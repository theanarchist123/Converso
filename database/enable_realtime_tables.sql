-- ===============================================
-- ENABLE REALTIME FOR TABLES - Complete Setup
-- ===============================================
-- Execute this in Supabase SQL Editor

-- Step 1: First, let's check what tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('user_status', 'companions', 'session_history', 'session_recaps', 'feedback')
ORDER BY table_name;

-- Step 2: Enable realtime for user_status (critical for ban detection)
-- This table should be created by the setup_user_status_table.sql script
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_status') THEN
        -- Check if already in publication
        IF NOT EXISTS (SELECT FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'user_status') THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE user_status;
            RAISE NOTICE 'Enabled realtime for user_status table';
        ELSE
            RAISE NOTICE 'user_status table already has realtime enabled - skipping';
        END IF;
    ELSE
        RAISE NOTICE 'user_status table does not exist - skipping. Please run setup_user_status_table.sql first';
    END IF;
END $$;

-- Step 3: Enable realtime for existing analytics tables (only if they exist)
DO $$
BEGIN
    -- Check and enable realtime for companions table
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'companions') THEN
        IF NOT EXISTS (SELECT FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'companions') THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE companions;
            RAISE NOTICE 'Enabled realtime for companions table';
        ELSE
            RAISE NOTICE 'companions table already has realtime enabled - skipping';
        END IF;
    ELSE
        RAISE NOTICE 'companions table does not exist - skipping';
    END IF;

    -- Check and enable realtime for session_history table
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'session_history') THEN
        IF NOT EXISTS (SELECT FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'session_history') THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE session_history;
            RAISE NOTICE 'Enabled realtime for session_history table';
        ELSE
            RAISE NOTICE 'session_history table already has realtime enabled - skipping';
        END IF;
    ELSE
        RAISE NOTICE 'session_history table does not exist - skipping';
    END IF;

    -- Check and enable realtime for session_recaps table
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'session_recaps') THEN
        IF NOT EXISTS (SELECT FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'session_recaps') THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE session_recaps;
            RAISE NOTICE 'Enabled realtime for session_recaps table';
        ELSE
            RAISE NOTICE 'session_recaps table already has realtime enabled - skipping';
        END IF;
    ELSE
        RAISE NOTICE 'session_recaps table does not exist - skipping';
    END IF;

    -- Check and enable realtime for feedback table
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'feedback') THEN
        IF NOT EXISTS (SELECT FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'feedback') THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE feedback;
            RAISE NOTICE 'Enabled realtime for feedback table';
        ELSE
            RAISE NOTICE 'feedback table already has realtime enabled - skipping';
        END IF;
    ELSE
        RAISE NOTICE 'feedback table does not exist - skipping';
    END IF;
END $$;

-- Step 4: Verify which tables now have realtime enabled
SELECT 
    schemaname, 
    tablename,
    'Realtime ENABLED' as status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- Step 5: Show total count of realtime-enabled tables
SELECT 
    COUNT(*) as total_realtime_tables,
    'Total tables with realtime enabled' as description
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';