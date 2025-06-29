-- Session Transcripts Table Setup for Converso App
-- Run this in your Supabase SQL Editor

-- Create session_transcripts table
CREATE TABLE IF NOT EXISTS session_transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    companion_id UUID NOT NULL,
    messages JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Add foreign key constraint
    CONSTRAINT fk_companion
        FOREIGN KEY (companion_id) 
        REFERENCES companions(id)
        ON DELETE CASCADE
);

-- Add RLS (Row Level Security) policies - Disabled for Clerk integration
-- ALTER TABLE session_transcripts ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies are commented out because we're using Clerk for authentication
-- and handling user filtering at the application level for better compatibility

-- If you want to enable RLS later, uncomment these policies:
-- CREATE POLICY "Users can view their own transcripts"
--     ON session_transcripts
--     FOR SELECT
--     USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- CREATE POLICY "Users can insert their own transcripts"
--     ON session_transcripts
--     FOR INSERT
--     WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- CREATE POLICY "Users can delete their own transcripts"
--     ON session_transcripts
--     FOR DELETE
--     USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_session_transcripts_user_id ON session_transcripts(user_id);
CREATE INDEX IF NOT EXISTS idx_session_transcripts_companion_id ON session_transcripts(companion_id);
CREATE INDEX IF NOT EXISTS idx_session_transcripts_created_at ON session_transcripts(created_at DESC);

-- Verify table creation
SELECT 'session_transcripts table created successfully!' as status;
