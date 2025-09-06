-- Add custom upload fields to user_bookmarks table for individual bookmark customization
-- This migration adds support for custom favicon, logo, and background uploads per bookmark

-- Add custom upload fields to user_bookmarks table
ALTER TABLE public.user_bookmarks 
ADD COLUMN IF NOT EXISTS custom_favicon TEXT,
ADD COLUMN IF NOT EXISTS custom_logo TEXT,
ADD COLUMN IF NOT EXISTS custom_background TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.user_bookmarks.custom_favicon IS 'Custom favicon URL uploaded by user for this specific bookmark, overrides automatic favicon';
COMMENT ON COLUMN public.user_bookmarks.custom_logo IS 'Custom logo URL uploaded by user for this specific bookmark, replaces default fallback logo';
COMMENT ON COLUMN public.user_bookmarks.custom_background IS 'Custom background image URL uploaded by user for this specific bookmark display';

-- Update the updated_at trigger to include new columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure the trigger exists for user_bookmarks
DROP TRIGGER IF EXISTS update_user_bookmarks_updated_at ON public.user_bookmarks;
CREATE TRIGGER update_user_bookmarks_updated_at 
    BEFORE UPDATE ON public.user_bookmarks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
