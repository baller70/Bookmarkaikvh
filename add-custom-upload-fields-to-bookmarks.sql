-- Add custom upload fields to bookmarks table for individual bookmark customization
-- This migration adds support for custom favicon, logo, and background uploads per bookmark

-- Add custom upload fields to bookmarks table
ALTER TABLE public.bookmarks 
ADD COLUMN IF NOT EXISTS custom_favicon TEXT,
ADD COLUMN IF NOT EXISTS custom_logo TEXT,
ADD COLUMN IF NOT EXISTS custom_background TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.bookmarks.custom_favicon IS 'Custom favicon URL uploaded by user for this specific bookmark, overrides automatic favicon';
COMMENT ON COLUMN public.bookmarks.custom_logo IS 'Custom logo URL uploaded by user for this specific bookmark, replaces default fallback logo';
COMMENT ON COLUMN public.bookmarks.custom_background IS 'Custom background image URL uploaded by user for this specific bookmark display';
