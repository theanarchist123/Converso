-- Populate session_history from existing session_transcripts
-- This will help show recent sessions immediately

INSERT INTO session_history (user_id, companion_id, created_at)
SELECT DISTINCT ON (user_id, companion_id, DATE(created_at))
    user_id, 
    companion_id, 
    created_at
FROM session_transcripts
WHERE companion_id IS NOT NULL
ORDER BY user_id, companion_id, DATE(created_at), created_at DESC;
