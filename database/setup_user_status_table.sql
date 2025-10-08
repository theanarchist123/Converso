-- User Status Table for Real-time Ban Notifications
-- This table tracks user status changes and enables real-time notifications

-- Create the user_status table
CREATE TABLE IF NOT EXISTS user_status (
  user_id text PRIMARY KEY,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'banned', 'suspended', 'pending')),
  ban_reason text,
  banned_by text,
  suspended_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_status_status ON user_status(status);
CREATE INDEX IF NOT EXISTS idx_user_status_updated_at ON user_status(updated_at);
CREATE INDEX IF NOT EXISTS idx_user_status_banned_by ON user_status(banned_by);

-- Enable Row Level Security
ALTER TABLE user_status ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own status
CREATE POLICY "Users can view own status" ON user_status
  FOR SELECT
  USING (user_id = auth.jwt() ->> 'sub');

-- RLS Policy: Only service role can insert/update status (for admin operations)
CREATE POLICY "Service role can manage all status" ON user_status
  FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policy: Authenticated users can insert their own active status (for registration)
CREATE POLICY "Users can create own active status" ON user_status
  FOR INSERT
  WITH CHECK (
    user_id = auth.jwt() ->> 'sub' 
    AND status = 'active'
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_user_status_updated_at_trigger ON user_status;
CREATE TRIGGER update_user_status_updated_at_trigger
  BEFORE UPDATE ON user_status
  FOR EACH ROW
  EXECUTE FUNCTION update_user_status_updated_at();

-- Function to safely ban a user (to be called from admin API)
CREATE OR REPLACE FUNCTION ban_user(
  target_user_id text,
  reason text DEFAULT 'Policy violation',
  banned_by_id text DEFAULT 'system'
)
RETURNS user_status AS $$
DECLARE
  result user_status;
BEGIN
  -- Insert or update user status
  INSERT INTO user_status (user_id, status, ban_reason, banned_by)
    VALUES (target_user_id, 'banned', reason, banned_by_id)
  ON CONFLICT (user_id) 
  DO UPDATE SET
    status = 'banned',
    ban_reason = reason,
    banned_by = banned_by_id,
    updated_at = now()
  RETURNING * INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unban a user
CREATE OR REPLACE FUNCTION unban_user(
  target_user_id text,
  unbanned_by_id text DEFAULT 'system'
)
RETURNS user_status AS $$
DECLARE
  result user_status;
BEGIN
  -- Update user status to active
  UPDATE user_status 
  SET 
    status = 'active',
    ban_reason = NULL,
    banned_by = unbanned_by_id,
    updated_at = now()
  WHERE user_id = target_user_id
  RETURNING * INTO result;
  
  -- If no row was updated, insert a new active status
  IF NOT FOUND THEN
    INSERT INTO user_status (user_id, status, banned_by)
      VALUES (target_user_id, 'active', unbanned_by_id)
    RETURNING * INTO result;
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to suspend a user temporarily
CREATE OR REPLACE FUNCTION suspend_user(
  target_user_id text,
  reason text DEFAULT 'Temporary suspension',
  suspended_by_id text DEFAULT 'system',
  suspend_until timestamptz DEFAULT (now() + interval '24 hours')
)
RETURNS user_status AS $$
DECLARE
  result user_status;
BEGIN
  -- Insert or update user status
  INSERT INTO user_status (user_id, status, ban_reason, banned_by, suspended_until)
    VALUES (target_user_id, 'suspended', reason, suspended_by_id, suspend_until)
  ON CONFLICT (user_id) 
  DO UPDATE SET
    status = 'suspended',
    ban_reason = reason,
    banned_by = suspended_by_id,
    suspended_until = suspend_until,
    updated_at = now()
  RETURNING * INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user status with additional info
CREATE OR REPLACE FUNCTION get_user_status(target_user_id text)
RETURNS TABLE (
  user_id text,
  status text,
  ban_reason text,
  banned_by text,
  suspended_until timestamptz,
  is_currently_active boolean,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    us.user_id,
    us.status,
    us.ban_reason,
    us.banned_by,
    us.suspended_until,
    CASE 
      WHEN us.status = 'active' THEN true
      WHEN us.status = 'suspended' AND us.suspended_until > now() THEN false
      WHEN us.status = 'suspended' AND us.suspended_until <= now() THEN true
      ELSE false
    END as is_currently_active,
    us.created_at,
    us.updated_at
  FROM user_status us
  WHERE us.user_id = target_user_id;
  
  -- If no status record exists, return default active status
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      target_user_id,
      'active'::text,
      NULL::text,
      NULL::text,
      NULL::timestamptz,
      true,
      now(),
      now();
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Realtime for the user_status table
-- This allows Supabase Realtime to broadcast changes
ALTER PUBLICATION supabase_realtime ADD TABLE user_status;

-- Create view for admin dashboard (banned users summary)
CREATE OR REPLACE VIEW banned_users_summary AS
SELECT 
  user_id,
  status,
  ban_reason,
  banned_by,
  suspended_until,
  CASE 
    WHEN status = 'banned' THEN 'Permanently Banned'
    WHEN status = 'suspended' AND suspended_until > now() THEN 'Temporarily Suspended'
    WHEN status = 'suspended' AND suspended_until <= now() THEN 'Suspension Expired'
    ELSE 'Active'
  END as status_description,
  created_at,
  updated_at
FROM user_status
WHERE status IN ('banned', 'suspended')
ORDER BY updated_at DESC;

-- Grant permissions for the service role to use functions
GRANT EXECUTE ON FUNCTION ban_user(text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION unban_user(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION suspend_user(text, text, text, timestamptz) TO service_role;
GRANT EXECUTE ON FUNCTION get_user_status(text) TO service_role;

-- Grant permissions for authenticated users to call get_user_status for their own status
GRANT EXECUTE ON FUNCTION get_user_status(text) TO authenticated;

-- Comments for documentation
COMMENT ON TABLE user_status IS 'Tracks user account status changes for real-time notifications';
COMMENT ON COLUMN user_status.user_id IS 'Clerk user ID (TEXT format)';
COMMENT ON COLUMN user_status.status IS 'Current user status: active, banned, suspended, pending';
COMMENT ON COLUMN user_status.ban_reason IS 'Reason for ban or suspension';
COMMENT ON COLUMN user_status.banned_by IS 'ID of admin who performed the action';
COMMENT ON COLUMN user_status.suspended_until IS 'Timestamp when suspension expires (NULL for permanent ban)';

COMMENT ON FUNCTION ban_user(text, text, text) IS 'Safely ban a user with reason and admin tracking';
COMMENT ON FUNCTION unban_user(text, text) IS 'Restore user to active status';
COMMENT ON FUNCTION suspend_user(text, text, text, timestamptz) IS 'Temporarily suspend user until specified time';
COMMENT ON FUNCTION get_user_status(text) IS 'Get comprehensive user status including computed active state';