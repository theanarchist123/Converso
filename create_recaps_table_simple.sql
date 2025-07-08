-- Create session_recaps table for Converso app
-- Run this in your Supabase SQL Editor

-- Drop existing table if it exists (for clean setup)
DROP TABLE IF EXISTS session_recaps;

-- Create session_recaps table
CREATE TABLE session_recaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    companion_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    bullet_points TEXT[] NOT NULL DEFAULT '{}',
    key_topics TEXT[] NOT NULL DEFAULT '{}',
    summary TEXT NOT NULL,
    messages_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Disable RLS for Clerk compatibility
ALTER TABLE session_recaps DISABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_session_recaps_user_id ON session_recaps(user_id);
CREATE INDEX idx_session_recaps_created_at ON session_recaps(created_at DESC);

-- Verify table creation
SELECT 'session_recaps table created successfully!' as status;
