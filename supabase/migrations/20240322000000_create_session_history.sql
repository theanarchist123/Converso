-- Create session_history table to track user session activity
CREATE TABLE IF NOT EXISTS session_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,  -- TEXT for Clerk user IDs
    companion_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Add foreign key constraint
    CONSTRAINT fk_session_history_companion
        FOREIGN KEY (companion_id) 
        REFERENCES companions(id)
        ON DELETE CASCADE
);

-- Disable RLS for session_history table (Clerk compatibility)
ALTER TABLE session_history DISABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_session_history_user_id ON session_history(user_id);
CREATE INDEX IF NOT EXISTS idx_session_history_companion_id ON session_history(companion_id);
CREATE INDEX IF NOT EXISTS idx_session_history_created_at ON session_history(created_at DESC);

-- Verify table creation
SELECT 'Session history table created successfully!' as status;
