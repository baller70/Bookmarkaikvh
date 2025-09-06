-- Create bookmarks table that matches the API interface exactly
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'General',
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    ai_summary TEXT,
    ai_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    ai_category TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    site_health TEXT DEFAULT 'working' CHECK (site_health IN ('excellent', 'working', 'fair', 'poor', 'broken')),
    last_health_check TIMESTAMPTZ,
    healthCheckCount INTEGER DEFAULT 0,
    customBackground TEXT,
    visits INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0,
    relatedBookmarks INTEGER[] DEFAULT ARRAY[]::INTEGER[],

    -- Custom uploads for individual bookmark customization
    custom_favicon TEXT,
    custom_logo TEXT,
    custom_background TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_url ON public.bookmarks(url);
CREATE INDEX IF NOT EXISTS idx_bookmarks_category ON public.bookmarks(category);
CREATE INDEX IF NOT EXISTS idx_bookmarks_tags ON public.bookmarks USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON public.bookmarks(created_at DESC);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bookmarks_updated_at
    BEFORE UPDATE ON public.bookmarks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.bookmarks TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE bookmarks_id_seq TO authenticated;

-- Insert a test bookmark to verify the table works
INSERT INTO public.bookmarks (user_id, title, url, description, category) 
VALUES ('dev-user-fixed-id', 'Test Bookmark', 'https://test.com', 'Test bookmark for verification', 'Testing')
ON CONFLICT DO NOTHING;

