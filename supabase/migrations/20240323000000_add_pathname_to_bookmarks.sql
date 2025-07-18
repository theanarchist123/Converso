-- Add missing pathname column to bookmarks table
ALTER TABLE bookmarks
  ADD COLUMN IF NOT EXISTS pathname TEXT DEFAULT '/';

-- Ensure RLS is disabled for the updated table (Clerk compatibility)
ALTER TABLE bookmarks DISABLE ROW LEVEL SECURITY;

-- Create index on pathname if needed for performance (optional)
-- CREATE INDEX IF NOT EXISTS idx_bookmarks_pathname ON bookmarks(pathname);
