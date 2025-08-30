-- Add missing week_start column to bookmark_analytics table
-- This column is needed for the THIS WEEK analytics card to work correctly

ALTER TABLE public.bookmark_analytics 
ADD COLUMN IF NOT EXISTS week_start TIMESTAMP WITH TIME ZONE;

-- Add an index for better performance on week_start queries
CREATE INDEX IF NOT EXISTS idx_bookmark_analytics_week_start 
ON public.bookmark_analytics(week_start);

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'bookmark_analytics' 
AND table_schema = 'public'
ORDER BY ordinal_position;
