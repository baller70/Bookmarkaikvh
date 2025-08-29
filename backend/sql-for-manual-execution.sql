-- Playbook Tables Migration
-- Execute this SQL in your Supabase SQL Editor
-- https://supabase.com/dashboard/project/kljhlubpxxcawacrzaix/sql

-- Create user_playbooks table
CREATE TABLE IF NOT EXISTS public.user_playbooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  is_collaborative BOOLEAN DEFAULT FALSE,
  is_marketplace_listed BOOLEAN DEFAULT FALSE,
  price DECIMAL(10,2) DEFAULT 0.00,
  category TEXT,
  plays INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT valid_price CHECK (price >= 0)
);

-- Create playbook_bookmarks table
CREATE TABLE IF NOT EXISTS public.playbook_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  playbook_id UUID REFERENCES public.user_playbooks(id) ON DELETE CASCADE NOT NULL,
  bookmark_id UUID NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(playbook_id, bookmark_id),
  CONSTRAINT valid_duration CHECK (duration_minutes >= 0)
);

-- Create playbook_collaborators table
CREATE TABLE IF NOT EXISTS public.playbook_collaborators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  playbook_id UUID REFERENCES public.user_playbooks(id) ON DELETE CASCADE NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer',
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(playbook_id, user_id),
  CONSTRAINT valid_role CHECK (role IN ('viewer', 'editor', 'admin'))
);

-- Create playbook_likes table
CREATE TABLE IF NOT EXISTS public.playbook_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  playbook_id UUID REFERENCES public.user_playbooks(id) ON DELETE CASCADE NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(playbook_id, user_id)
);

-- Create playbook_plays table
CREATE TABLE IF NOT EXISTS public.playbook_plays (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  playbook_id UUID REFERENCES public.user_playbooks(id) ON DELETE CASCADE NOT NULL,
  user_id TEXT,
  session_id UUID DEFAULT gen_random_uuid(),
  duration_seconds INTEGER,
  completed BOOLEAN DEFAULT FALSE,
  bookmark_count INTEGER DEFAULT 0,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT valid_duration_seconds CHECK (duration_seconds >= 0),
  CONSTRAINT valid_bookmark_count CHECK (bookmark_count >= 0)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_playbooks_user_id ON public.user_playbooks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_playbooks_is_public ON public.user_playbooks(is_public);
CREATE INDEX IF NOT EXISTS idx_user_playbooks_category ON public.user_playbooks(category);
CREATE INDEX IF NOT EXISTS idx_user_playbooks_created_at ON public.user_playbooks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_playbooks_likes ON public.user_playbooks(likes DESC);
CREATE INDEX IF NOT EXISTS idx_user_playbooks_plays ON public.user_playbooks(plays DESC);

CREATE INDEX IF NOT EXISTS idx_playbook_bookmarks_playbook_id ON public.playbook_bookmarks(playbook_id);
CREATE INDEX IF NOT EXISTS idx_playbook_bookmarks_bookmark_id ON public.playbook_bookmarks(bookmark_id);
CREATE INDEX IF NOT EXISTS idx_playbook_bookmarks_order ON public.playbook_bookmarks(playbook_id, order_index);

CREATE INDEX IF NOT EXISTS idx_playbook_collaborators_playbook_id ON public.playbook_collaborators(playbook_id);
CREATE INDEX IF NOT EXISTS idx_playbook_collaborators_user_id ON public.playbook_collaborators(user_id);

CREATE INDEX IF NOT EXISTS idx_playbook_likes_playbook_id ON public.playbook_likes(playbook_id);
CREATE INDEX IF NOT EXISTS idx_playbook_likes_user_id ON public.playbook_likes(user_id);

CREATE INDEX IF NOT EXISTS idx_playbook_plays_playbook_id ON public.playbook_plays(playbook_id);
CREATE INDEX IF NOT EXISTS idx_playbook_plays_user_id ON public.playbook_plays(user_id);
CREATE INDEX IF NOT EXISTS idx_playbook_plays_played_at ON public.playbook_plays(played_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playbook_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playbook_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playbook_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playbook_plays ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_playbooks
CREATE POLICY "Users can view public playbooks" ON public.user_playbooks
  FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Users can view their own playbooks" ON public.user_playbooks
  FOR SELECT USING (user_id = auth.uid()::TEXT);

CREATE POLICY "Users can create their own playbooks" ON public.user_playbooks
  FOR INSERT WITH CHECK (user_id = auth.uid()::TEXT);

CREATE POLICY "Users can update their own playbooks" ON public.user_playbooks
  FOR UPDATE USING (user_id = auth.uid()::TEXT);

CREATE POLICY "Users can delete their own playbooks" ON public.user_playbooks
  FOR DELETE USING (user_id = auth.uid()::TEXT);

-- Create RLS policies for playbook_bookmarks
CREATE POLICY "Users can view bookmarks of public playbooks" ON public.playbook_bookmarks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_playbooks 
      WHERE id = playbook_bookmarks.playbook_id 
      AND is_public = TRUE
    )
  );

CREATE POLICY "Users can view bookmarks of their own playbooks" ON public.playbook_bookmarks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_playbooks 
      WHERE id = playbook_bookmarks.playbook_id 
      AND user_id = auth.uid()::TEXT
    )
  );

CREATE POLICY "Users can manage bookmarks of their own playbooks" ON public.playbook_bookmarks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_playbooks 
      WHERE id = playbook_bookmarks.playbook_id 
      AND user_id = auth.uid()::TEXT
    )
  );

-- Create RLS policies for playbook_likes
CREATE POLICY "Users can view all likes" ON public.playbook_likes FOR SELECT USING (TRUE);
CREATE POLICY "Users can manage their own likes" ON public.playbook_likes
  FOR ALL USING (user_id = auth.uid()::TEXT);

-- Create RLS policies for playbook_plays
CREATE POLICY "Users can view plays of their own playbooks" ON public.playbook_plays
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_playbooks 
      WHERE id = playbook_plays.playbook_id 
      AND user_id = auth.uid()::TEXT
    )
  );

CREATE POLICY "Users can create play records" ON public.playbook_plays
  FOR INSERT WITH CHECK (TRUE);

-- Create triggers for updating updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_playbooks_updated_at
  BEFORE UPDATE ON public.user_playbooks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playbook_bookmarks_updated_at
  BEFORE UPDATE ON public.playbook_bookmarks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create functions for updating playbook stats
CREATE OR REPLACE FUNCTION update_playbook_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.user_playbooks 
    SET likes = likes + 1 
    WHERE id = NEW.playbook_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.user_playbooks 
    SET likes = likes - 1 
    WHERE id = OLD.playbook_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_playbook_likes_count_trigger
  AFTER INSERT OR DELETE ON public.playbook_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_playbook_likes_count();

CREATE OR REPLACE FUNCTION update_playbook_plays_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.user_playbooks 
  SET plays = plays + 1 
  WHERE id = NEW.playbook_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_playbook_plays_count_trigger
  AFTER INSERT ON public.playbook_plays
  FOR EACH ROW
  EXECUTE FUNCTION update_playbook_plays_count();

-- Insert some sample data for testing
INSERT INTO public.user_playbooks (user_id, name, description, category, is_public, tags) VALUES
  ('user_123', 'Tech Startup Resources', 'Essential bookmarks for tech entrepreneurs', 'business', TRUE, ARRAY['startup', 'tech', 'business']),
  ('user_123', 'Web Development Learning Path', 'Curated resources for learning web development', 'education', TRUE, ARRAY['web', 'development', 'learning']),
  ('user_456', 'Design Inspiration', 'Beautiful design examples and tools', 'design', TRUE, ARRAY['design', 'inspiration', 'ui']);

-- Success message
SELECT 'Playbook tables created successfully! 🎉' AS message; 