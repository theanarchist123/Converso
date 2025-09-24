-- Migration script to populate session_history from existing session_transcripts
-- Run this after creating the session_history table

INSERT INTO session_history (user_id, companion_id, created_at)
SELECT DISTINCT 
    user_id, 
    companion_id, 
    created_at
FROM session_transcripts
WHERE (user_id, companion_id, DATE(created_at)) NOT IN (
    SELECT user_id, companion_id, DATE(created_at) 
    FROM session_history
)
ORDER BY created_at DESC;
