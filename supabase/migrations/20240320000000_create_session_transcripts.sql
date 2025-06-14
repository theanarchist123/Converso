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

-- Add RLS (Row Level Security) policies
ALTER TABLE session_transcripts ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to only see their own transcripts
CREATE POLICY "Users can view their own transcripts"
    ON session_transcripts
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy to allow users to insert their own transcripts
CREATE POLICY "Users can insert their own transcripts"
    ON session_transcripts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to delete their own transcripts
CREATE POLICY "Users can delete their own transcripts"
    ON session_transcripts
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_session_transcripts_user_id ON session_transcripts(user_id);
CREATE INDEX idx_session_transcripts_companion_id ON session_transcripts(companion_id);
CREATE INDEX idx_session_transcripts_created_at ON session_transcripts(created_at DESC); 