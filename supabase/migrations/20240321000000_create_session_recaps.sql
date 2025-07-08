-- Create session_recaps table
CREATE TABLE IF NOT EXISTS session_recaps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    companion_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    bullet_points TEXT[] NOT NULL DEFAULT '{}',
    key_topics TEXT[] NOT NULL DEFAULT '{}',
    summary TEXT NOT NULL,
    messages_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_session_recaps_user_id ON session_recaps(user_id);
CREATE INDEX IF NOT EXISTS idx_session_recaps_created_at ON session_recaps(created_at DESC);

-- Add RLS (Row Level Security)
ALTER TABLE session_recaps ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can view their own recaps" ON session_recaps
    FOR ALL USING (auth.uid()::text = user_id);
