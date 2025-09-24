-- Fix session_transcripts table for Clerk compatibility
-- Run this in your Supabase SQL Editor

-- First, drop the existing table if it exists (this will lose existing data)
-- If you have important data, backup first!
DROP TABLE IF EXISTS session_transcripts CASCADE;

-- Create the corrected session_transcripts table
CREATE TABLE session_transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,  -- TEXT for Clerk user IDs
    companion_id UUID NOT NULL,
    messages JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Add foreign key constraint (only if companions table exists)
    CONSTRAINT fk_companion
        FOREIGN KEY (companion_id) 
        REFERENCES companions(id)
        ON DELETE CASCADE
);

-- Disable RLS for Clerk compatibility
ALTER TABLE session_transcripts DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Users can view their own transcripts" ON session_transcripts;
DROP POLICY IF EXISTS "Users can insert their own transcripts" ON session_transcripts;
DROP POLICY IF EXISTS "Users can delete their own transcripts" ON session_transcripts;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_session_transcripts_user_id ON session_transcripts(user_id);
CREATE INDEX IF NOT EXISTS idx_session_transcripts_companion_id ON session_transcripts(companion_id);
CREATE INDEX IF NOT EXISTS idx_session_transcripts_created_at ON session_transcripts(created_at DESC);

-- Verify table creation
SELECT 'session_transcripts table recreated successfully with Clerk compatibility!' as status;
