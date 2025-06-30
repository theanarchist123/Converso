-- Complete Database Setup for Converso App
-- Run this in your Supabase SQL Editor

-- Create companions table with correct structure
CREATE TABLE IF NOT EXISTS companions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    voice TEXT NOT NULL,
    style TEXT NOT NULL,
    duration INTEGER DEFAULT 15,
    author TEXT NOT NULL,  -- TEXT for Clerk user IDs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    companion_id UUID NOT NULL REFERENCES companions(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,  -- TEXT for Clerk user IDs
    pathname TEXT DEFAULT '/',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint to prevent duplicate bookmarks
    UNIQUE(companion_id, user_id)
);

-- Create session_transcripts table (if not already created)
CREATE TABLE IF NOT EXISTS session_transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,  -- TEXT for Clerk user IDs
    companion_id UUID NOT NULL,
    messages JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Add foreign key constraint
    CONSTRAINT fk_companion
        FOREIGN KEY (companion_id) 
        REFERENCES companions(id)
        ON DELETE CASCADE
);

-- Disable RLS for all tables (Clerk compatibility)
ALTER TABLE companions DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks DISABLE ROW LEVEL SECURITY;
ALTER TABLE session_transcripts DISABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_companions_author ON companions(author);
CREATE INDEX IF NOT EXISTS idx_companions_subject ON companions(subject);
CREATE INDEX IF NOT EXISTS idx_companions_created_at ON companions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_companion_id ON bookmarks(companion_id);

CREATE INDEX IF NOT EXISTS idx_session_transcripts_user_id ON session_transcripts(user_id);
CREATE INDEX IF NOT EXISTS idx_session_transcripts_companion_id ON session_transcripts(companion_id);
CREATE INDEX IF NOT EXISTS idx_session_transcripts_created_at ON session_transcripts(created_at DESC);

-- Verify table creation
SELECT 'All Converso tables created successfully!' as status;
