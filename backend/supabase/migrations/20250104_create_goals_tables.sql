-- Create goal folders and goals tables for Goal 2.0 feature
-- This allows users to create folders and organize goals within them

-- Create goal_folders table
CREATE TABLE IF NOT EXISTS public.goal_folders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Ensure unique folder names per user
    UNIQUE(user_id, name)
);

-- Create goals table
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    folder_id UUID REFERENCES public.goal_folders(id) ON DELETE SET NULL,
    
    -- Basic goal information
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    deadline_date DATE,
    
    -- Goal categorization and status
    goal_type TEXT DEFAULT 'custom' CHECK (goal_type IN ('organize', 'complete_all', 'review_all', 'learn_category', 'research_topic', 'custom')),
    goal_description TEXT,
    goal_status TEXT DEFAULT 'not_started' CHECK (goal_status IN ('not_started', 'in_progress', 'completed', 'on_hold', 'cancelled')),
    goal_priority TEXT DEFAULT 'medium' CHECK (goal_priority IN ('low', 'medium', 'high', 'urgent')),
    goal_progress INTEGER DEFAULT 0 CHECK (goal_progress >= 0 AND goal_progress <= 100),
    
    -- Connected data
    connected_bookmarks TEXT[] DEFAULT ARRAY[]::TEXT[],
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_goal_folders_user_id ON public.goal_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_folders_created_at ON public.goal_folders(created_at);

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_folder_id ON public.goals(folder_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON public.goals(goal_status);
CREATE INDEX IF NOT EXISTS idx_goals_priority ON public.goals(goal_priority);
CREATE INDEX IF NOT EXISTS idx_goals_deadline ON public.goals(deadline_date);
CREATE INDEX IF NOT EXISTS idx_goals_created_at ON public.goals(created_at);

-- Enable Row Level Security
ALTER TABLE public.goal_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for goal_folders
CREATE POLICY "Users can view their own goal folders" ON public.goal_folders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goal folders" ON public.goal_folders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goal folders" ON public.goal_folders
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goal folders" ON public.goal_folders
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for goals
CREATE POLICY "Users can view their own goals" ON public.goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals" ON public.goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON public.goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" ON public.goals
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_goal_folders_updated_at 
    BEFORE UPDATE ON public.goal_folders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at 
    BEFORE UPDATE ON public.goals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.goal_folders IS 'Folders for organizing goals in Goal 2.0 feature';
COMMENT ON TABLE public.goals IS 'User goals that can be organized in folders';
COMMENT ON COLUMN public.goals.folder_id IS 'Optional folder assignment - null means goal is not in a folder';
COMMENT ON COLUMN public.goals.connected_bookmarks IS 'Array of bookmark IDs connected to this goal';
COMMENT ON COLUMN public.goals.goal_progress IS 'Progress percentage from 0 to 100';
