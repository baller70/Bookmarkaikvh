-- Enhanced Comments System Migration
-- This migration adds comprehensive comment functionality with mentions, reactions, and notifications

-- Create user_comments_mentions table for tracking @-mentions
CREATE TABLE IF NOT EXISTS user_comments_mentions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES user_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentioned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(comment_id, user_id)
);

-- Add RLS policies for mentions
ALTER TABLE user_comments_mentions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view mentions they are involved in" ON user_comments_mentions
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() = mentioned_by OR
    auth.uid() IN (
      SELECT uc.user_id FROM user_comments uc WHERE uc.id = comment_id
    )
  );

CREATE POLICY "Users can create mentions" ON user_comments_mentions
  FOR INSERT WITH CHECK (auth.uid() = mentioned_by);

CREATE POLICY "Users can delete their own mentions" ON user_comments_mentions
  FOR DELETE USING (auth.uid() = mentioned_by);

-- Create indexes for performance
CREATE INDEX idx_user_comments_mentions_comment_id ON user_comments_mentions(comment_id);
CREATE INDEX idx_user_comments_mentions_user_id ON user_comments_mentions(user_id);
CREATE INDEX idx_user_comments_mentions_mentioned_by ON user_comments_mentions(mentioned_by);

-- Add new columns to user_comments table if they don't exist
DO $$ 
BEGIN
  -- Add reactions column (JSONB to store emoji reactions)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_comments' AND column_name = 'reactions') THEN
    ALTER TABLE user_comments ADD COLUMN reactions JSONB DEFAULT '{}';
  END IF;

  -- Add resolved_by column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_comments' AND column_name = 'resolved_by') THEN
    ALTER TABLE user_comments ADD COLUMN resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  -- Add resolved_at column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_comments' AND column_name = 'resolved_at') THEN
    ALTER TABLE user_comments ADD COLUMN resolved_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add is_edited column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_comments' AND column_name = 'is_edited') THEN
    ALTER TABLE user_comments ADD COLUMN is_edited BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add attachments column (JSONB to store file attachments)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_comments' AND column_name = 'attachments') THEN
    ALTER TABLE user_comments ADD COLUMN attachments JSONB DEFAULT '[]';
  END IF;

  -- Add mentions column (array of user IDs)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_comments' AND column_name = 'mentions') THEN
    ALTER TABLE user_comments ADD COLUMN mentions UUID[] DEFAULT '{}';
  END IF;
END $$;

-- Create user_notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for notifications
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON user_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON user_notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON user_notifications
  FOR INSERT WITH CHECK (true);

-- Create indexes for notifications
CREATE INDEX idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX idx_user_notifications_created_at ON user_notifications(created_at DESC);
CREATE INDEX idx_user_notifications_is_read ON user_notifications(is_read);
CREATE INDEX idx_user_notifications_type ON user_notifications(type);

-- Create profiles table if it doesn't exist (for user information)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255),
  full_name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by authenticated users" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create indexes for profiles
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_full_name ON profiles(full_name);

-- Add additional indexes for user_comments for better performance
CREATE INDEX IF NOT EXISTS idx_user_comments_entity_type_id ON user_comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_user_comments_parent_id ON user_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_user_comments_is_resolved ON user_comments(is_resolved);
CREATE INDEX IF NOT EXISTS idx_user_comments_mentions_gin ON user_comments USING GIN(mentions);
CREATE INDEX IF NOT EXISTS idx_user_comments_reactions_gin ON user_comments USING GIN(reactions);

-- Create storage bucket for comment attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('comment-attachments', 'comment-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Add storage policies for comment attachments
CREATE POLICY "Authenticated users can upload comment attachments" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'comment-attachments' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view comment attachments" ON storage.objects
  FOR SELECT USING (bucket_id = 'comment-attachments');

CREATE POLICY "Users can update their own comment attachments" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'comment-attachments' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own comment attachments" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'comment-attachments' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_user_comments_updated_at ON user_comments;
CREATE TRIGGER update_user_comments_updated_at
  BEFORE UPDATE ON user_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_notifications_updated_at ON user_notifications;
CREATE TRIGGER update_user_notifications_updated_at
  BEFORE UPDATE ON user_notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 