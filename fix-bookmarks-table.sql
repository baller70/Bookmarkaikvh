-- Fix bookmarks table by adding all missing columns that the API expects
-- This will make the existing bookmarks table compatible with the API

-- Add missing columns to the existing bookmarks table
ALTER TABLE public.bookmarks 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General',
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS ai_summary TEXT,
ADD COLUMN IF NOT EXISTS ai_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS ai_category TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS site_health TEXT DEFAULT 'working' CHECK (site_health IN ('excellent', 'working', 'fair', 'poor', 'broken')),
ADD COLUMN IF NOT EXISTS last_health_check TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS healthCheckCount INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS customBackground TEXT,
ADD COLUMN IF NOT EXISTS visits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS time_spent INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS relatedBookmarks TEXT[] DEFAULT ARRAY[]::TEXT[];