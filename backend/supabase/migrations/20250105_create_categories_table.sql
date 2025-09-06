-- Create categories table for bookmark categorization
-- This allows users to create custom categories for organizing their bookmarks

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Ensure unique category names per user (allow null user_id for global categories)
    UNIQUE(user_id, name)
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own categories and global categories" ON public.categories
    FOR SELECT USING (
        auth.uid() = user_id OR user_id IS NULL
    );

CREATE POLICY "Users can insert their own categories" ON public.categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" ON public.categories
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" ON public.categories
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_name ON public.categories(name);

-- Insert some default global categories (user_id = NULL)
INSERT INTO public.categories (user_id, name, description, color) VALUES
(NULL, 'Development', 'Programming, coding, and software development resources', '#3B82F6'),
(NULL, 'Design', 'UI/UX design, graphics, and creative resources', '#EF4444'),
(NULL, 'Marketing', 'Marketing strategies, tools, and resources', '#10B981'),
(NULL, 'Productivity', 'Tools and resources to boost productivity', '#8B5CF6'),
(NULL, 'Research', 'Research papers, articles, and academic resources', '#F59E0B'),
(NULL, 'Education', 'Learning materials, courses, and educational content', '#06B6D4'),
(NULL, 'Entertainment', 'Movies, games, music, and entertainment content', '#F97316'),
(NULL, 'News', 'News articles, current events, and journalism', '#EC4899'),
(NULL, 'Shopping', 'E-commerce, products, and shopping resources', '#84CC16'),
(NULL, 'Social', 'Social media, networking, and community resources', '#6366F1'),
(NULL, 'Travel', 'Travel guides, destinations, and travel planning', '#14B8A6'),
(NULL, 'Health', 'Health, fitness, and wellness resources', '#F43F5E'),
(NULL, 'Finance', 'Financial planning, investing, and money management', '#22C55E'),
(NULL, 'Sports', 'Sports news, statistics, and athletic content', '#A855F7'),
(NULL, 'Technology', 'Tech news, gadgets, and technology resources', '#0EA5E9'),
(NULL, 'Business', 'Business strategies, entrepreneurship, and corporate resources', '#F97316'),
(NULL, 'Other', 'Miscellaneous bookmarks that don\'t fit other categories', '#6B7280')
ON CONFLICT (user_id, name) DO NOTHING;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION update_categories_updated_at();

-- Comments for documentation
COMMENT ON TABLE public.categories IS 'Stores user-defined and global bookmark categories';
COMMENT ON COLUMN public.categories.user_id IS 'User who owns the category. NULL for global categories available to all users';
COMMENT ON COLUMN public.categories.name IS 'Category name (unique per user)';
COMMENT ON COLUMN public.categories.description IS 'Optional description of the category';
COMMENT ON COLUMN public.categories.color IS 'Hex color code for the category display';
