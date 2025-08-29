-- Migration: Create Oracle AI tables
-- Created: 2024-12-31
-- Description: Add tables for Oracle conversations, messages, and settings

-- Create oracle_conversations table
CREATE TABLE IF NOT EXISTS public.oracle_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    message_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create oracle_messages table
CREATE TABLE IF NOT EXISTS public.oracle_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.oracle_conversations(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    audio_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create oracle_settings table
CREATE TABLE IF NOT EXISTS public.oracle_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    setting_type TEXT NOT NULL CHECK (setting_type IN ('appearance', 'behavior', 'voice', 'context', 'tools', 'advanced')),
    settings_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, setting_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_oracle_conversations_user_id ON public.oracle_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_oracle_conversations_is_active ON public.oracle_conversations(is_active);
CREATE INDEX IF NOT EXISTS idx_oracle_conversations_last_message_at ON public.oracle_conversations(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_oracle_messages_conversation_id ON public.oracle_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_oracle_messages_user_id ON public.oracle_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_oracle_messages_created_at ON public.oracle_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_oracle_messages_role ON public.oracle_messages(role);

CREATE INDEX IF NOT EXISTS idx_oracle_settings_user_id ON public.oracle_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_oracle_settings_type ON public.oracle_settings(setting_type);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_oracle_conversations_updated_at 
    BEFORE UPDATE ON public.oracle_conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oracle_messages_updated_at 
    BEFORE UPDATE ON public.oracle_messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oracle_settings_updated_at 
    BEFORE UPDATE ON public.oracle_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update message count
CREATE OR REPLACE FUNCTION update_conversation_message_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.oracle_conversations 
        SET message_count = message_count + 1,
            last_message_at = NEW.created_at
        WHERE id = NEW.conversation_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.oracle_conversations 
        SET message_count = message_count - 1
        WHERE id = OLD.conversation_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversation_message_count_trigger
    AFTER INSERT OR DELETE ON public.oracle_messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_message_count();

-- Enable Row Level Security (RLS)
ALTER TABLE public.oracle_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oracle_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oracle_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only access their own conversations
CREATE POLICY "Users can view their own conversations" ON public.oracle_conversations
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own conversations" ON public.oracle_conversations
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own conversations" ON public.oracle_conversations
    FOR UPDATE USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own conversations" ON public.oracle_conversations
    FOR DELETE USING (user_id = auth.uid()::text);

-- Users can only access their own messages
CREATE POLICY "Users can view their own messages" ON public.oracle_messages
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own messages" ON public.oracle_messages
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own messages" ON public.oracle_messages
    FOR UPDATE USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own messages" ON public.oracle_messages
    FOR DELETE USING (user_id = auth.uid()::text);

-- Users can only access their own settings
CREATE POLICY "Users can view their own settings" ON public.oracle_settings
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own settings" ON public.oracle_settings
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own settings" ON public.oracle_settings
    FOR UPDATE USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own settings" ON public.oracle_settings
    FOR DELETE USING (user_id = auth.uid()::text);

-- Grant permissions
GRANT ALL ON public.oracle_conversations TO authenticated;
GRANT ALL ON public.oracle_messages TO authenticated;
GRANT ALL ON public.oracle_settings TO authenticated;

-- Create helpful views
CREATE OR REPLACE VIEW public.oracle_conversations_with_latest_message AS
SELECT 
    c.*,
    m.content as latest_message_content,
    m.role as latest_message_role,
    m.created_at as latest_message_created_at
FROM public.oracle_conversations c
LEFT JOIN LATERAL (
    SELECT content, role, created_at
    FROM public.oracle_messages 
    WHERE conversation_id = c.id 
    ORDER BY created_at DESC 
    LIMIT 1
) m ON true
ORDER BY c.last_message_at DESC;

-- Grant access to the view
GRANT SELECT ON public.oracle_conversations_with_latest_message TO authenticated;

-- Create function to get conversation history
CREATE OR REPLACE FUNCTION get_conversation_history(
    p_conversation_id UUID,
    p_user_id TEXT,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    role TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    audio_url TEXT,
    metadata JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.content,
        m.role,
        m.created_at,
        m.audio_url,
        m.metadata
    FROM public.oracle_messages m
    WHERE m.conversation_id = p_conversation_id 
    AND m.user_id = p_user_id
    ORDER BY m.created_at ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_conversation_history TO authenticated;

-- Comments for documentation
COMMENT ON TABLE public.oracle_conversations IS 'Stores Oracle AI conversation sessions';
COMMENT ON TABLE public.oracle_messages IS 'Stores individual messages within Oracle conversations';
COMMENT ON TABLE public.oracle_settings IS 'Stores user-specific Oracle AI settings';
COMMENT ON FUNCTION get_conversation_history IS 'Retrieves conversation history for a specific conversation'; 