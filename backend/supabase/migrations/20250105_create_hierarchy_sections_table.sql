-- Create hierarchy_sections table to store user's custom hierarchy sections
CREATE TABLE IF NOT EXISTS hierarchy_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  section_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  icon VARCHAR(100) DEFAULT 'Crown',
  color VARCHAR(50) DEFAULT 'purple',
  gradient VARCHAR(255) DEFAULT 'bg-gradient-to-r from-purple-600 to-blue-600',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, section_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS hierarchy_sections_user_id_idx ON hierarchy_sections(user_id);
CREATE INDEX IF NOT EXISTS hierarchy_sections_position_idx ON hierarchy_sections(user_id, position);

-- Enable RLS
ALTER TABLE hierarchy_sections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own hierarchy sections" ON hierarchy_sections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own hierarchy sections" ON hierarchy_sections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hierarchy sections" ON hierarchy_sections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hierarchy sections" ON hierarchy_sections
  FOR DELETE USING (auth.uid() = user_id);

