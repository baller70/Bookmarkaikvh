-- Create user_bookmarks table
-- Run this in Supabase Dashboard > SQL Editor
-- https://supabase.com/dashboard/project/kljhlubpxxcawacrzaix/sql

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

-- Create user_bookmark_folders table
CREATE TABLE IF NOT EXISTS public.user_bookmark_folders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    parent_folder_id UUID REFERENCES public.user_bookmark_folders(id) ON DELETE CASCADE,
    is_system_folder BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    UNIQUE(user_id, name)
);

-- Add foreign key constraint for folder_id
ALTER TABLE public.user_bookmarks 
ADD CONSTRAINT fk_user_bookmarks_folder 
FOREIGN KEY (folder_id) REFERENCES public.user_bookmark_folders(id) ON DELETE SET NULL;

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

-- Create RLS policies for user_bookmark_folders
CREATE POLICY "Users can view their own bookmark folders" ON public.user_bookmark_folders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmark folders" ON public.user_bookmark_folders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmark folders" ON public.user_bookmark_folders
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmark folders" ON public.user_bookmark_folders
    FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.user_bookmarks TO authenticated;
GRANT ALL ON public.user_bookmark_folders TO authenticated; 