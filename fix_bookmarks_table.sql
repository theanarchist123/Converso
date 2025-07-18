-- Fix bookmarks table by adding missing pathname column
-- Run this directly in your Supabase SQL Editor

-- Add the missing pathname column to the bookmarks table
ALTER TABLE bookmarks 
ADD COLUMN IF NOT EXISTS pathname TEXT DEFAULT '/';

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'bookmarks' 
AND table_schema = 'public';
