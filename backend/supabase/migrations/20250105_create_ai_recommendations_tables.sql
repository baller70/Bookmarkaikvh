-- Create AI Recommendations Context Tables
-- This migration creates tables for sophisticated user context tracking for AI recommendations

-- User Browsing History table - tracks user's web activity patterns
CREATE TABLE IF NOT EXISTS public.user_browsing_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- URL and content data
    url TEXT NOT NULL,
    title TEXT,
    domain TEXT,
    page_type TEXT, -- 'article', 'documentation', 'tutorial', 'tool', 'video', 'social'
    
    -- Visit data
    visit_duration_seconds INTEGER,
    scroll_depth_percent INTEGER, -- how far they scrolled
    interaction_count INTEGER DEFAULT 0, -- clicks, form fills, etc.
    return_visit BOOLEAN DEFAULT FALSE,
    
    -- Content analysis
    detected_topics TEXT[] DEFAULT ARRAY[]::TEXT[],
    detected_categories TEXT[] DEFAULT ARRAY[]::TEXT[],
    content_language TEXT,
    reading_level TEXT, -- 'beginner', 'intermediate', 'advanced'
    
    -- Context
    referrer_url TEXT,
    time_of_day INTEGER, -- hour of day (0-23)
    day_of_week INTEGER, -- 1-7
    device_type TEXT, -- 'desktop', 'mobile', 'tablet'
    
    -- Timestamps
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- User Interests table - learned user preferences and interests
CREATE TABLE IF NOT EXISTS public.user_interests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Interest data
    interest_type TEXT NOT NULL, -- 'topic', 'category', 'technology', 'skill', 'industry'
    interest_name TEXT NOT NULL,
    interest_keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Confidence and weighting
    confidence_score DECIMAL(3,2) DEFAULT 0.50, -- 0.00 to 1.00
    interaction_weight INTEGER DEFAULT 1, -- how many interactions contributed
    last_reinforced_at TIMESTAMP WITH TIME ZONE,
    
    -- Learning source
    learned_from TEXT, -- 'bookmarks', 'browsing', 'explicit', 'recommendations'
    source_count INTEGER DEFAULT 1,
    
    -- Metadata
    related_domains TEXT[] DEFAULT ARRAY[]::TEXT[],
    skill_level TEXT, -- 'beginner', 'intermediate', 'advanced', 'expert'
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    UNIQUE(user_id, interest_type, interest_name)
);

-- User Recommendations History table - tracks what was recommended and feedback
CREATE TABLE IF NOT EXISTS public.user_recommendations_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Recommendation data
    recommendation_id TEXT NOT NULL, -- matches the 'id' from OpenAI response
    recommendation_url TEXT NOT NULL,
    recommendation_title TEXT,
    recommendation_description TEXT,
    
    -- Context when recommended
    recommendation_context JSONB, -- settings, user context, etc.
    confidence_score DECIMAL(3,2),
    reasoning TEXT[], -- the 'why' array from OpenAI
    
    -- User interaction
    was_clicked BOOLEAN DEFAULT FALSE,
    was_bookmarked BOOLEAN DEFAULT FALSE,
    was_dismissed BOOLEAN DEFAULT FALSE,
    user_rating INTEGER, -- 1-5 star rating
    user_feedback TEXT,
    
    -- Timing data
    time_to_click_seconds INTEGER,
    time_on_page_seconds INTEGER,
    
    -- Session data
    recommendation_session_id TEXT, -- groups recommendations from same request
    position_in_list INTEGER, -- 1st, 2nd, 3rd recommendation
    
    -- Timestamps
    recommended_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    clicked_at TIMESTAMP WITH TIME ZONE,
    rated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- User Recommendation Feedback table - detailed feedback on recommendation quality
CREATE TABLE IF NOT EXISTS public.user_recommendation_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    recommendation_history_id UUID REFERENCES public.user_recommendations_history(id) ON DELETE CASCADE,
    
    -- Feedback data
    feedback_type TEXT NOT NULL, -- 'explicit', 'implicit', 'behavioral'
    feedback_action TEXT NOT NULL, -- 'like', 'dislike', 'irrelevant', 'too_basic', 'too_advanced', 'already_known'
    feedback_value DECIMAL(3,2), -- normalized score -1.00 to 1.00
    
    -- Context
    feedback_reason TEXT,
    suggested_improvement TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_browsing_history_user_id ON public.user_browsing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_browsing_history_domain ON public.user_browsing_history(domain);
CREATE INDEX IF NOT EXISTS idx_user_browsing_history_visited_at ON public.user_browsing_history(visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_browsing_history_topics ON public.user_browsing_history USING GIN(detected_topics);
CREATE INDEX IF NOT EXISTS idx_user_browsing_history_categories ON public.user_browsing_history USING GIN(detected_categories);

CREATE INDEX IF NOT EXISTS idx_user_interests_user_id ON public.user_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_type_name ON public.user_interests(interest_type, interest_name);
CREATE INDEX IF NOT EXISTS idx_user_interests_confidence ON public.user_interests(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_interests_keywords ON public.user_interests USING GIN(interest_keywords);

CREATE INDEX IF NOT EXISTS idx_user_recommendations_history_user_id ON public.user_recommendations_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_history_session ON public.user_recommendations_history(recommendation_session_id);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_history_recommended_at ON public.user_recommendations_history(recommended_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_history_clicked ON public.user_recommendations_history(was_clicked);

CREATE INDEX IF NOT EXISTS idx_user_recommendation_feedback_user_id ON public.user_recommendation_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recommendation_feedback_history_id ON public.user_recommendation_feedback(recommendation_history_id);

-- Enable RLS
ALTER TABLE public.user_browsing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_recommendations_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_recommendation_feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_browsing_history
CREATE POLICY "Users can view their own browsing history" ON public.user_browsing_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own browsing history" ON public.user_browsing_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own browsing history" ON public.user_browsing_history
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own browsing history" ON public.user_browsing_history
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_interests
CREATE POLICY "Users can view their own interests" ON public.user_interests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interests" ON public.user_interests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interests" ON public.user_interests
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interests" ON public.user_interests
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_recommendations_history
CREATE POLICY "Users can view their own recommendations history" ON public.user_recommendations_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recommendations history" ON public.user_recommendations_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recommendations history" ON public.user_recommendations_history
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recommendations history" ON public.user_recommendations_history
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_recommendation_feedback
CREATE POLICY "Users can view their own recommendation feedback" ON public.user_recommendation_feedback
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recommendation feedback" ON public.user_recommendation_feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recommendation feedback" ON public.user_recommendation_feedback
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recommendation feedback" ON public.user_recommendation_feedback
    FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger for user_interests
CREATE TRIGGER update_user_interests_updated_at
    BEFORE UPDATE ON public.user_interests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.user_browsing_history TO authenticated;
GRANT ALL ON public.user_interests TO authenticated;
GRANT ALL ON public.user_recommendations_history TO authenticated;
GRANT ALL ON public.user_recommendation_feedback TO authenticated;

-- Create helpful functions for interest learning
CREATE OR REPLACE FUNCTION public.update_user_interest(
    p_user_id UUID,
    p_interest_type TEXT,
    p_interest_name TEXT,
    p_confidence_boost DECIMAL DEFAULT 0.1,
    p_source TEXT DEFAULT 'browsing'
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.user_interests (
        user_id, 
        interest_type, 
        interest_name, 
        confidence_score,
        learned_from,
        last_reinforced_at
    )
    VALUES (
        p_user_id, 
        p_interest_type, 
        p_interest_name, 
        LEAST(0.5 + p_confidence_boost, 1.0),
        p_source,
        NOW()
    )
    ON CONFLICT (user_id, interest_type, interest_name) 
    DO UPDATE SET
        confidence_score = LEAST(user_interests.confidence_score + p_confidence_boost, 1.0),
        source_count = user_interests.source_count + 1,
        last_reinforced_at = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user context for recommendations
CREATE OR REPLACE FUNCTION public.get_user_recommendation_context(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    WITH recent_bookmarks AS (
        SELECT category, ai_category, ai_tags, domain
        FROM public.user_bookmarks 
        WHERE user_id = p_user_id 
          AND created_at > NOW() - INTERVAL '30 days'
        ORDER BY created_at DESC
        LIMIT 20
    ),
    top_interests AS (
        SELECT interest_type, interest_name, confidence_score
        FROM public.user_interests
        WHERE user_id = p_user_id
        ORDER BY confidence_score DESC, updated_at DESC
        LIMIT 10
    ),
    recent_browsing AS (
        SELECT domain, detected_topics, detected_categories, page_type
        FROM public.user_browsing_history
        WHERE user_id = p_user_id
          AND visited_at > NOW() - INTERVAL '7 days'
        ORDER BY visited_at DESC
        LIMIT 50
    ),
    feedback_patterns AS (
        SELECT 
            feedback_action,
            COUNT(*) as count,
            AVG(feedback_value) as avg_value
        FROM public.user_recommendation_feedback
        WHERE user_id = p_user_id
          AND created_at > NOW() - INTERVAL '90 days'
        GROUP BY feedback_action
    )
    SELECT jsonb_build_object(
        'recent_bookmarks', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'category', category,
                    'ai_category', ai_category,
                    'ai_tags', ai_tags,
                    'domain', domain
                )
            ) FROM recent_bookmarks
        ),
        'top_interests', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'type', interest_type,
                    'name', interest_name,
                    'confidence', confidence_score
                )
            ) FROM top_interests
        ),
        'recent_browsing', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'domain', domain,
                    'topics', detected_topics,
                    'categories', detected_categories,
                    'page_type', page_type
                )
            ) FROM recent_browsing
        ),
        'feedback_patterns', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'action', feedback_action,
                    'count', count,
                    'avg_value', avg_value
                )
            ) FROM feedback_patterns
        )
    ) INTO result;
    
    RETURN COALESCE(result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to seed sample data for development/testing
CREATE OR REPLACE FUNCTION public.seed_sample_user_data(p_user_id UUID DEFAULT 'dev-user-123'::uuid)
RETURNS VOID AS $$
BEGIN
    -- Insert sample interests
    INSERT INTO public.user_interests (user_id, interest_type, interest_name, confidence_score, learned_from, interest_keywords) VALUES
    (p_user_id, 'technology', 'React', 0.85, 'bookmarks', ARRAY['react', 'frontend', 'javascript', 'components']),
    (p_user_id, 'technology', 'TypeScript', 0.78, 'bookmarks', ARRAY['typescript', 'types', 'javascript']),
    (p_user_id, 'technology', 'AI/ML', 0.92, 'explicit', ARRAY['artificial intelligence', 'machine learning', 'ai', 'openai']),
    (p_user_id, 'category', 'Web Development', 0.88, 'browsing', ARRAY['web dev', 'frontend', 'backend', 'fullstack']),
    (p_user_id, 'category', 'Productivity', 0.65, 'bookmarks', ARRAY['productivity', 'tools', 'efficiency', 'workflow']),
    (p_user_id, 'skill', 'UI/UX Design', 0.70, 'bookmarks', ARRAY['design', 'ui', 'ux', 'user experience']),
    (p_user_id, 'industry', 'SaaS', 0.75, 'explicit', ARRAY['saas', 'software as a service', 'business']),
    (p_user_id, 'technology', 'Node.js', 0.80, 'bookmarks', ARRAY['nodejs', 'backend', 'javascript', 'server'])
    ON CONFLICT (user_id, interest_type, interest_name) DO UPDATE SET
        confidence_score = EXCLUDED.confidence_score,
        updated_at = NOW();

    -- Insert sample browsing history
    INSERT INTO public.user_browsing_history (user_id, url, title, domain, page_type, visit_duration_seconds, detected_topics, detected_categories, visited_at) VALUES
    (p_user_id, 'https://react.dev/learn', 'Learn React', 'react.dev', 'documentation', 1800, ARRAY['react', 'frontend', 'javascript'], ARRAY['Development', 'Tutorial'], NOW() - INTERVAL '2 hours'),
    (p_user_id, 'https://openai.com/blog/gpt-4', 'GPT-4 Technical Report', 'openai.com', 'article', 900, ARRAY['ai', 'gpt', 'language models'], ARRAY['AI/ML', 'Research'], NOW() - INTERVAL '1 day'),
    (p_user_id, 'https://github.com/microsoft/vscode', 'Visual Studio Code', 'github.com', 'tool', 300, ARRAY['editor', 'productivity', 'development'], ARRAY['Development', 'Tools'], NOW() - INTERVAL '3 hours'),
    (p_user_id, 'https://tailwindcss.com/docs', 'Tailwind CSS Documentation', 'tailwindcss.com', 'documentation', 1200, ARRAY['css', 'styling', 'frontend'], ARRAY['Development', 'Design'], NOW() - INTERVAL '5 hours'),
    (p_user_id, 'https://supabase.com/docs', 'Supabase Documentation', 'supabase.com', 'documentation', 2100, ARRAY['database', 'backend', 'postgresql'], ARRAY['Development', 'Database'], NOW() - INTERVAL '1 day'),
    (p_user_id, 'https://nextjs.org/docs', 'Next.js Documentation', 'nextjs.org', 'documentation', 1500, ARRAY['nextjs', 'react', 'fullstack'], ARRAY['Development', 'Framework'], NOW() - INTERVAL '6 hours')
    ON CONFLICT DO NOTHING;

    -- Insert sample bookmarks (referencing the user_bookmarks table)
    INSERT INTO public.user_bookmarks (user_id, title, url, description, category, ai_category, ai_tags, domain, created_at) VALUES
    (p_user_id, 'React Documentation', 'https://react.dev', 'Official React documentation and tutorials', 'Development', 'Web Development', ARRAY['react', 'frontend', 'javascript'], 'react.dev', NOW() - INTERVAL '1 week'),
    (p_user_id, 'OpenAI API Reference', 'https://platform.openai.com/docs', 'Complete guide to OpenAI API usage', 'AI/ML', 'Artificial Intelligence', ARRAY['openai', 'api', 'ai', 'gpt'], 'platform.openai.com', NOW() - INTERVAL '3 days'),
    (p_user_id, 'TypeScript Handbook', 'https://www.typescriptlang.org/docs/', 'Official TypeScript documentation', 'Development', 'Programming Language', ARRAY['typescript', 'types', 'javascript'], 'typescriptlang.org', NOW() - INTERVAL '2 weeks'),
    (p_user_id, 'Figma Design System', 'https://www.figma.com/design-systems/', 'Design system best practices', 'Design', 'UI/UX Design', ARRAY['design', 'ui', 'ux', 'figma'], 'figma.com', NOW() - INTERVAL '1 week'),
    (p_user_id, 'Notion Productivity Guide', 'https://www.notion.so/help/guides', 'Productivity tips and workflows', 'Productivity', 'Tools', ARRAY['notion', 'productivity', 'organization'], 'notion.so', NOW() - INTERVAL '4 days')
    ON CONFLICT (user_id, url) DO UPDATE SET
        ai_category = EXCLUDED.ai_category,
        ai_tags = EXCLUDED.ai_tags,
        updated_at = NOW();

    RAISE NOTICE 'Sample data seeded successfully for user: %', p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 