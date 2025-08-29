-- Run this SQL in your Supabase SQL Editor
-- Go to: https://supabase.com/dashboard/project/kljhlubpxxcawacrzaix/sql

-- Create user_bookmarks table
CREATE TABLE IF NOT EXISTS public.user_bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    
    -- Core bookmark data
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    favicon TEXT,
    screenshot TEXT,
    
    -- Categorization
    category TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    folder_id UUID,
    
    -- Metadata
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    is_favorite BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    
    -- Analytics
    visit_count INTEGER DEFAULT 0,
    last_visited_at TIMESTAMP WITH TIME ZONE,
    reading_time_minutes INTEGER,
    
    -- AI-generated data
    ai_summary TEXT,
    ai_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    ai_category TEXT,
    
    -- Processing metadata
    link_type TEXT CHECK (link_type IN ('video', 'doc', 'pdf', 'repo', 'web', 'article', 'tool')),
    domain TEXT,
    language TEXT,
    word_count INTEGER,
    
    -- Notes and custom data
    notes TEXT,
    custom_data JSONB DEFAULT '{}'::JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Constraints
    UNIQUE(user_id, url)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id ON public.user_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_url ON public.user_bookmarks(url);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_domain ON public.user_bookmarks(domain);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_category ON public.user_bookmarks(category);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_tags ON public.user_bookmarks USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_created_at ON public.user_bookmarks(created_at DESC);

-- Enable RLS (but service role bypasses this)
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies 
CREATE POLICY "Users can view their own bookmarks" ON public.user_bookmarks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks" ON public.user_bookmarks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmarks" ON public.user_bookmarks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" ON public.user_bookmarks
    FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_bookmarks_updated_at
    BEFORE UPDATE ON public.user_bookmarks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Test the table creation
SELECT 'user_bookmarks table created successfully!' as result; 