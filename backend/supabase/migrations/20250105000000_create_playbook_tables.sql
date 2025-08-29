-- Drop existing tables if they exist (in correct order to avoid foreign key constraints)
DROP TABLE IF EXISTS playbook_plays CASCADE;
DROP TABLE IF EXISTS playbook_likes CASCADE;
DROP TABLE IF EXISTS playbook_collaborators CASCADE;
DROP TABLE IF EXISTS playbook_bookmarks CASCADE;
DROP TABLE IF EXISTS user_playbooks CASCADE;

-- Create user_playbooks table
CREATE TABLE user_playbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  is_public BOOLEAN DEFAULT false,
  is_collaborative BOOLEAN DEFAULT false,
  allow_comments BOOLEAN DEFAULT true,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  likes_count INTEGER DEFAULT 0,
  plays_count INTEGER DEFAULT 0,
  bookmarks_count INTEGER DEFAULT 0
);

-- Create playbook_bookmarks table
CREATE TABLE playbook_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playbook_id UUID NOT NULL REFERENCES user_playbooks(id) ON DELETE CASCADE,
  bookmark_id UUID NOT NULL,
  bookmark_url TEXT NOT NULL,
  bookmark_title TEXT,
  bookmark_description TEXT,
  bookmark_favicon TEXT,
  bookmark_tags TEXT[],
  position INTEGER DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  added_by UUID NOT NULL
);

-- Create playbook_collaborators table
CREATE TABLE playbook_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playbook_id UUID NOT NULL REFERENCES user_playbooks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  permission_level VARCHAR(20) DEFAULT 'view' CHECK (permission_level IN ('view', 'edit', 'admin')),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  invited_by UUID NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(playbook_id, user_id)
);

-- Create playbook_likes table
CREATE TABLE playbook_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playbook_id UUID NOT NULL REFERENCES user_playbooks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  liked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(playbook_id, user_id)
);

-- Create playbook_plays table
CREATE TABLE playbook_plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playbook_id UUID NOT NULL REFERENCES user_playbooks(id) ON DELETE CASCADE,
  user_id UUID,
  session_id VARCHAR(255),
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_seconds INTEGER,
  device_type VARCHAR(50),
  user_agent TEXT
);

-- Create indexes for better performance
CREATE INDEX idx_user_playbooks_user_id ON user_playbooks(user_id);
CREATE INDEX idx_user_playbooks_category ON user_playbooks(category);
CREATE INDEX idx_user_playbooks_is_public ON user_playbooks(is_public);
CREATE INDEX idx_user_playbooks_created_at ON user_playbooks(created_at);

CREATE INDEX idx_playbook_bookmarks_playbook_id ON playbook_bookmarks(playbook_id);
CREATE INDEX idx_playbook_bookmarks_position ON playbook_bookmarks(playbook_id, position);

CREATE INDEX idx_playbook_collaborators_playbook_id ON playbook_collaborators(playbook_id);
CREATE INDEX idx_playbook_collaborators_user_id ON playbook_collaborators(user_id);

CREATE INDEX idx_playbook_likes_playbook_id ON playbook_likes(playbook_id);
CREATE INDEX idx_playbook_likes_user_id ON playbook_likes(user_id);

CREATE INDEX idx_playbook_plays_playbook_id ON playbook_plays(playbook_id);
CREATE INDEX idx_playbook_plays_user_id ON playbook_plays(user_id);
CREATE INDEX idx_playbook_plays_played_at ON playbook_plays(played_at);

-- Enable Row Level Security (RLS)
ALTER TABLE user_playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbook_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbook_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbook_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbook_plays ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_playbooks
CREATE POLICY "Users can view public playbooks" ON user_playbooks
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own playbooks" ON user_playbooks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view collaborative playbooks they're part of" ON user_playbooks
  FOR SELECT USING (
    is_collaborative = true AND 
    id IN (SELECT playbook_id FROM playbook_collaborators WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create their own playbooks" ON user_playbooks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playbooks" ON user_playbooks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playbooks" ON user_playbooks
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for playbook_bookmarks
CREATE POLICY "Users can view bookmarks in accessible playbooks" ON playbook_bookmarks
  FOR SELECT USING (
    playbook_id IN (
      SELECT id FROM user_playbooks 
      WHERE is_public = true 
         OR user_id = auth.uid() 
         OR (is_collaborative = true AND id IN (
           SELECT playbook_id FROM playbook_collaborators WHERE user_id = auth.uid()
         ))
    )
  );

CREATE POLICY "Users can add bookmarks to their playbooks" ON playbook_bookmarks
  FOR INSERT WITH CHECK (
    playbook_id IN (SELECT id FROM user_playbooks WHERE user_id = auth.uid())
    OR playbook_id IN (
      SELECT playbook_id FROM playbook_collaborators 
      WHERE user_id = auth.uid() AND permission_level IN ('edit', 'admin')
    )
  );

CREATE POLICY "Users can update bookmarks in their playbooks" ON playbook_bookmarks
  FOR UPDATE USING (
    playbook_id IN (SELECT id FROM user_playbooks WHERE user_id = auth.uid())
    OR playbook_id IN (
      SELECT playbook_id FROM playbook_collaborators 
      WHERE user_id = auth.uid() AND permission_level IN ('edit', 'admin')
    )
  );

CREATE POLICY "Users can delete bookmarks from their playbooks" ON playbook_bookmarks
  FOR DELETE USING (
    playbook_id IN (SELECT id FROM user_playbooks WHERE user_id = auth.uid())
    OR playbook_id IN (
      SELECT playbook_id FROM playbook_collaborators 
      WHERE user_id = auth.uid() AND permission_level IN ('edit', 'admin')
    )
  );

-- Create RLS policies for playbook_likes
CREATE POLICY "Users can view all likes" ON playbook_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like any accessible playbook" ON playbook_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes" ON playbook_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for playbook_plays
CREATE POLICY "Users can view plays for their playbooks" ON playbook_plays
  FOR SELECT USING (
    playbook_id IN (SELECT id FROM user_playbooks WHERE user_id = auth.uid())
  );

CREATE POLICY "Anyone can record plays" ON playbook_plays
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for playbook_collaborators
CREATE POLICY "Users can view collaborators for accessible playbooks" ON playbook_collaborators
  FOR SELECT USING (
    playbook_id IN (
      SELECT id FROM user_playbooks 
      WHERE user_id = auth.uid() 
         OR (is_collaborative = true AND id IN (
           SELECT playbook_id FROM playbook_collaborators WHERE user_id = auth.uid()
         ))
    )
  );

CREATE POLICY "Playbook owners can manage collaborators" ON playbook_collaborators
  FOR ALL USING (
    playbook_id IN (SELECT id FROM user_playbooks WHERE user_id = auth.uid())
  ); 