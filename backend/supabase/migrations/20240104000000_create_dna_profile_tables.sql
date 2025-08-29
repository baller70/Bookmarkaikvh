-- DNA Profile Migration: Complete system for bookmark personalization
-- This migration creates all 8 tables for the DNA profile system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. About You Table
CREATE TABLE IF NOT EXISTS dna_about_you (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Personal Information
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(100),
    bio TEXT,
    location VARCHAR(200),
    timezone VARCHAR(50),
    birth_date DATE,
    
    -- Professional Information
    job_title VARCHAR(200),
    company VARCHAR(200),
    industry VARCHAR(100),
    experience_level VARCHAR(50),
    skills TEXT[], -- Array of skills
    
    -- Goals and Interests
    professional_goals TEXT[],
    personal_interests TEXT[],
    learning_objectives TEXT[],
    
    -- Avatar and Social
    avatar_url TEXT,
    website_url TEXT,
    linkedin_url TEXT,
    twitter_url TEXT,
    github_url TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- 2. Insight Questions Table
CREATE TABLE IF NOT EXISTS dna_insight_questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Learning Style (questions 1-5)
    learning_style_visual INTEGER CHECK (learning_style_visual BETWEEN 1 AND 5),
    learning_style_practical INTEGER CHECK (learning_style_practical BETWEEN 1 AND 5),
    learning_style_theoretical INTEGER CHECK (learning_style_theoretical BETWEEN 1 AND 5),
    learning_style_collaborative INTEGER CHECK (learning_style_collaborative BETWEEN 1 AND 5),
    learning_style_self_paced INTEGER CHECK (learning_style_self_paced BETWEEN 1 AND 5),
    
    -- Content Preferences (questions 6-10)
    content_depth_preference INTEGER CHECK (content_depth_preference BETWEEN 1 AND 5),
    content_format_preference INTEGER CHECK (content_format_preference BETWEEN 1 AND 5),
    content_recency_importance INTEGER CHECK (content_recency_importance BETWEEN 1 AND 5),
    content_source_trust INTEGER CHECK (content_source_trust BETWEEN 1 AND 5),
    content_diversity_preference INTEGER CHECK (content_diversity_preference BETWEEN 1 AND 5),
    
    -- Professional Focus (questions 11-15)
    professional_development_priority INTEGER CHECK (professional_development_priority BETWEEN 1 AND 5),
    industry_news_interest INTEGER CHECK (industry_news_interest BETWEEN 1 AND 5),
    technical_content_preference INTEGER CHECK (technical_content_preference BETWEEN 1 AND 5),
    leadership_content_interest INTEGER CHECK (leadership_content_interest BETWEEN 1 AND 5),
    networking_importance INTEGER CHECK (networking_importance BETWEEN 1 AND 5),
    
    -- Personal Interests (questions 16-20)
    hobby_content_interest INTEGER CHECK (hobby_content_interest BETWEEN 1 AND 5),
    entertainment_preference INTEGER CHECK (entertainment_preference BETWEEN 1 AND 5),
    health_wellness_interest INTEGER CHECK (health_wellness_interest BETWEEN 1 AND 5),
    travel_culture_interest INTEGER CHECK (travel_culture_interest BETWEEN 1 AND 5),
    technology_trends_interest INTEGER CHECK (technology_trends_interest BETWEEN 1 AND 5),
    
    -- Progress tracking
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- 3. Importance Weights Table
CREATE TABLE IF NOT EXISTS dna_importance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Content Quality Factors (0-100 scale)
    accuracy_importance INTEGER DEFAULT 50 CHECK (accuracy_importance BETWEEN 0 AND 100),
    depth_importance INTEGER DEFAULT 50 CHECK (depth_importance BETWEEN 0 AND 100),
    clarity_importance INTEGER DEFAULT 50 CHECK (clarity_importance BETWEEN 0 AND 100),
    recency_importance INTEGER DEFAULT 50 CHECK (recency_importance BETWEEN 0 AND 100),
    
    -- User Experience Factors
    readability_importance INTEGER DEFAULT 50 CHECK (readability_importance BETWEEN 0 AND 100),
    visual_appeal_importance INTEGER DEFAULT 50 CHECK (visual_appeal_importance BETWEEN 0 AND 100),
    load_time_importance INTEGER DEFAULT 50 CHECK (load_time_importance BETWEEN 0 AND 100),
    mobile_friendly_importance INTEGER DEFAULT 50 CHECK (mobile_friendly_importance BETWEEN 0 AND 100),
    
    -- Social and Community Factors
    social_proof_importance INTEGER DEFAULT 50 CHECK (social_proof_importance BETWEEN 0 AND 100),
    community_engagement_importance INTEGER DEFAULT 50 CHECK (community_engagement_importance BETWEEN 0 AND 100),
    author_reputation_importance INTEGER DEFAULT 50 CHECK (author_reputation_importance BETWEEN 0 AND 100),
    trending_importance INTEGER DEFAULT 50 CHECK (trending_importance BETWEEN 0 AND 100),
    
    -- Personalization Factors
    past_behavior_importance INTEGER DEFAULT 50 CHECK (past_behavior_importance BETWEEN 0 AND 100),
    similar_users_importance INTEGER DEFAULT 50 CHECK (similar_users_importance BETWEEN 0 AND 100),
    explicit_preferences_importance INTEGER DEFAULT 50 CHECK (explicit_preferences_importance BETWEEN 0 AND 100),
    serendipity_importance INTEGER DEFAULT 50 CHECK (serendipity_importance BETWEEN 0 AND 100),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- 4. Content and Channels Table
CREATE TABLE IF NOT EXISTS dna_content_channels (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Content Type Preferences (JSON for flexibility)
    content_types JSONB DEFAULT '{}',
    
    -- Channel Management
    preferred_channels TEXT[],
    blocked_channels TEXT[],
    
    -- RSS and Custom Sources
    rss_feeds JSONB DEFAULT '[]', -- Array of RSS feed objects
    custom_sources JSONB DEFAULT '[]', -- Array of custom source objects
    
    -- Social Media Integration
    social_platforms JSONB DEFAULT '{}', -- Platform-specific settings
    
    -- Content Filtering
    language_preferences TEXT[] DEFAULT ARRAY['en'],
    content_length_preference VARCHAR(20) DEFAULT 'medium', -- short, medium, long, any
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- 5. Tags and Filters Table
CREATE TABLE IF NOT EXISTS dna_tags_filters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Tag Management
    preferred_tags TEXT[],
    blocked_tags TEXT[],
    custom_tags JSONB DEFAULT '[]', -- Array of custom tag objects with weights
    
    -- Content Filtering
    blocked_keywords TEXT[],
    blocked_domains TEXT[],
    
    -- Smart Filters
    smart_filters JSONB DEFAULT '{}', -- AI-powered filtering rules
    
    -- Sentiment and Quality Filters
    sentiment_filter VARCHAR(20) DEFAULT 'neutral', -- positive, negative, neutral, all
    quality_threshold INTEGER DEFAULT 50 CHECK (quality_threshold BETWEEN 0 AND 100),
    
    -- Custom Filter Rules
    custom_filters JSONB DEFAULT '[]', -- Array of custom filter objects
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- 6. Site Preferences Table
CREATE TABLE IF NOT EXISTS dna_site_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Theme and Appearance
    theme VARCHAR(20) DEFAULT 'system', -- light, dark, system
    color_scheme VARCHAR(50) DEFAULT 'default',
    font_family VARCHAR(50) DEFAULT 'system',
    font_size VARCHAR(20) DEFAULT 'medium',
    
    -- Layout Preferences
    layout_style VARCHAR(20) DEFAULT 'grid', -- grid, list, card, magazine
    sidebar_position VARCHAR(20) DEFAULT 'left', -- left, right, hidden
    content_width VARCHAR(20) DEFAULT 'comfortable', -- narrow, comfortable, wide
    
    -- Reading Experience
    reading_mode_enabled BOOLEAN DEFAULT false,
    auto_scroll_enabled BOOLEAN DEFAULT false,
    focus_mode_enabled BOOLEAN DEFAULT false,
    
    -- Navigation and Interaction
    keyboard_shortcuts_enabled BOOLEAN DEFAULT true,
    hover_previews_enabled BOOLEAN DEFAULT true,
    infinite_scroll_enabled BOOLEAN DEFAULT false,
    
    -- Content Display
    show_thumbnails BOOLEAN DEFAULT true,
    show_summaries BOOLEAN DEFAULT true,
    show_metadata BOOLEAN DEFAULT true,
    show_tags BOOLEAN DEFAULT true,
    
    -- Performance Settings
    lazy_loading_enabled BOOLEAN DEFAULT true,
    preload_content BOOLEAN DEFAULT false,
    cache_preferences JSONB DEFAULT '{}',
    
    -- Privacy and Data
    analytics_enabled BOOLEAN DEFAULT true,
    data_sharing_enabled BOOLEAN DEFAULT false,
    tracking_preferences JSONB DEFAULT '{}',
    
    -- Notifications
    notification_preferences JSONB DEFAULT '{}',
    
    -- Accessibility
    accessibility_preferences JSONB DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- 7. Recommendations Table
CREATE TABLE IF NOT EXISTS dna_recommendations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Algorithm Selection
    primary_algorithm VARCHAR(50) DEFAULT 'hybrid', -- collaborative, content, hybrid, ai
    algorithm_weights JSONB DEFAULT '{}', -- Weights for different algorithms
    
    -- Content Weighting
    recency_weight INTEGER DEFAULT 30 CHECK (recency_weight BETWEEN 0 AND 100),
    popularity_weight INTEGER DEFAULT 25 CHECK (popularity_weight BETWEEN 0 AND 100),
    relevance_weight INTEGER DEFAULT 35 CHECK (relevance_weight BETWEEN 0 AND 100),
    diversity_weight INTEGER DEFAULT 10 CHECK (diversity_weight BETWEEN 0 AND 100),
    
    -- Recommendation Types
    trending_enabled BOOLEAN DEFAULT true,
    personalized_enabled BOOLEAN DEFAULT true,
    collaborative_enabled BOOLEAN DEFAULT true,
    serendipity_enabled BOOLEAN DEFAULT false,
    
    -- AI and Machine Learning
    ai_recommendations_enabled BOOLEAN DEFAULT true,
    learning_rate VARCHAR(20) DEFAULT 'medium', -- slow, medium, fast
    feedback_incorporation BOOLEAN DEFAULT true,
    
    -- Filtering and Constraints
    duplicate_filtering BOOLEAN DEFAULT true,
    time_decay_enabled BOOLEAN DEFAULT true,
    quality_filtering BOOLEAN DEFAULT true,
    
    -- Advanced Features
    cross_domain_recommendations BOOLEAN DEFAULT false,
    temporal_recommendations BOOLEAN DEFAULT false,
    contextual_recommendations BOOLEAN DEFAULT false,
    
    -- Experimental Features
    experimental_features JSONB DEFAULT '{}',
    
    -- Performance Tuning
    recommendation_refresh_rate VARCHAR(20) DEFAULT 'daily', -- hourly, daily, weekly
    max_recommendations INTEGER DEFAULT 50 CHECK (max_recommendations BETWEEN 1 AND 200),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- 8. Review and Save Table (Profile Summary and Status)
CREATE TABLE IF NOT EXISTS dna_review_save (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Section Completion Status
    about_you_completed BOOLEAN DEFAULT false,
    insight_questions_completed BOOLEAN DEFAULT false,
    importance_completed BOOLEAN DEFAULT false,
    content_channels_completed BOOLEAN DEFAULT false,
    tags_filters_completed BOOLEAN DEFAULT false,
    site_preferences_completed BOOLEAN DEFAULT false,
    recommendations_completed BOOLEAN DEFAULT false,
    
    -- Overall Progress
    total_progress INTEGER DEFAULT 0 CHECK (total_progress BETWEEN 0 AND 100),
    completion_date TIMESTAMP WITH TIME ZONE,
    
    -- Profile Status
    profile_active BOOLEAN DEFAULT false,
    profile_version INTEGER DEFAULT 1,
    
    -- Export and Backup
    last_export_date TIMESTAMP WITH TIME ZONE,
    export_format VARCHAR(20) DEFAULT 'json', -- json, csv, xml
    
    -- Profile Summary (computed fields)
    profile_summary JSONB DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dna_about_you_user_id ON dna_about_you(user_id);
CREATE INDEX IF NOT EXISTS idx_dna_insight_questions_user_id ON dna_insight_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_dna_importance_user_id ON dna_importance(user_id);
CREATE INDEX IF NOT EXISTS idx_dna_content_channels_user_id ON dna_content_channels(user_id);
CREATE INDEX IF NOT EXISTS idx_dna_tags_filters_user_id ON dna_tags_filters(user_id);
CREATE INDEX IF NOT EXISTS idx_dna_site_preferences_user_id ON dna_site_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_dna_recommendations_user_id ON dna_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_dna_review_save_user_id ON dna_review_save(user_id);

-- Create updated_at triggers for all tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_dna_about_you_updated_at BEFORE UPDATE ON dna_about_you FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dna_insight_questions_updated_at BEFORE UPDATE ON dna_insight_questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dna_importance_updated_at BEFORE UPDATE ON dna_importance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dna_content_channels_updated_at BEFORE UPDATE ON dna_content_channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dna_tags_filters_updated_at BEFORE UPDATE ON dna_tags_filters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dna_site_preferences_updated_at BEFORE UPDATE ON dna_site_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dna_recommendations_updated_at BEFORE UPDATE ON dna_recommendations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dna_review_save_updated_at BEFORE UPDATE ON dna_review_save FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE dna_about_you ENABLE ROW LEVEL SECURITY;
ALTER TABLE dna_insight_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dna_importance ENABLE ROW LEVEL SECURITY;
ALTER TABLE dna_content_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE dna_tags_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE dna_site_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE dna_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dna_review_save ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for all tables (users can only access their own data)
CREATE POLICY "Users can view their own DNA about you data" ON dna_about_you FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own DNA about you data" ON dna_about_you FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own DNA about you data" ON dna_about_you FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own DNA about you data" ON dna_about_you FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own DNA insight questions data" ON dna_insight_questions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own DNA insight questions data" ON dna_insight_questions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own DNA insight questions data" ON dna_insight_questions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own DNA insight questions data" ON dna_insight_questions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own DNA importance data" ON dna_importance FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own DNA importance data" ON dna_importance FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own DNA importance data" ON dna_importance FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own DNA importance data" ON dna_importance FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own DNA content channels data" ON dna_content_channels FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own DNA content channels data" ON dna_content_channels FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own DNA content channels data" ON dna_content_channels FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own DNA content channels data" ON dna_content_channels FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own DNA tags filters data" ON dna_tags_filters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own DNA tags filters data" ON dna_tags_filters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own DNA tags filters data" ON dna_tags_filters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own DNA tags filters data" ON dna_tags_filters FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own DNA site preferences data" ON dna_site_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own DNA site preferences data" ON dna_site_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own DNA site preferences data" ON dna_site_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own DNA site preferences data" ON dna_site_preferences FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own DNA recommendations data" ON dna_recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own DNA recommendations data" ON dna_recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own DNA recommendations data" ON dna_recommendations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own DNA recommendations data" ON dna_recommendations FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own DNA review save data" ON dna_review_save FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own DNA review save data" ON dna_review_save FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own DNA review save data" ON dna_review_save FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own DNA review save data" ON dna_review_save FOR DELETE USING (auth.uid() = user_id);

-- Create a function to automatically create a review_save record when user completes their first section
CREATE OR REPLACE FUNCTION create_dna_review_save_record()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO dna_review_save (user_id, about_you_completed, insight_questions_completed, importance_completed, content_channels_completed, tags_filters_completed, site_preferences_completed, recommendations_completed)
    VALUES (NEW.user_id, false, false, false, false, false, false, false)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically create review_save records
CREATE TRIGGER create_review_save_on_about_you AFTER INSERT ON dna_about_you FOR EACH ROW EXECUTE FUNCTION create_dna_review_save_record();
CREATE TRIGGER create_review_save_on_insight_questions AFTER INSERT ON dna_insight_questions FOR EACH ROW EXECUTE FUNCTION create_dna_review_save_record();
CREATE TRIGGER create_review_save_on_importance AFTER INSERT ON dna_importance FOR EACH ROW EXECUTE FUNCTION create_dna_review_save_record();
CREATE TRIGGER create_review_save_on_content_channels AFTER INSERT ON dna_content_channels FOR EACH ROW EXECUTE FUNCTION create_dna_review_save_record();
CREATE TRIGGER create_review_save_on_tags_filters AFTER INSERT ON dna_tags_filters FOR EACH ROW EXECUTE FUNCTION create_dna_review_save_record();
CREATE TRIGGER create_review_save_on_site_preferences AFTER INSERT ON dna_site_preferences FOR EACH ROW EXECUTE FUNCTION create_dna_review_save_record();
CREATE TRIGGER create_review_save_on_recommendations AFTER INSERT ON dna_recommendations FOR EACH ROW EXECUTE FUNCTION create_dna_review_save_record();

-- Create a function to update completion status in review_save table
CREATE OR REPLACE FUNCTION update_completion_status()
RETURNS TRIGGER AS $$
DECLARE
    completion_count INTEGER := 0;
    total_sections INTEGER := 7;
    progress_percentage INTEGER;
BEGIN
    -- Count completed sections
    SELECT 
        (CASE WHEN EXISTS(SELECT 1 FROM dna_about_you WHERE user_id = NEW.user_id) THEN 1 ELSE 0 END) +
        (CASE WHEN EXISTS(SELECT 1 FROM dna_insight_questions WHERE user_id = NEW.user_id) THEN 1 ELSE 0 END) +
        (CASE WHEN EXISTS(SELECT 1 FROM dna_importance WHERE user_id = NEW.user_id) THEN 1 ELSE 0 END) +
        (CASE WHEN EXISTS(SELECT 1 FROM dna_content_channels WHERE user_id = NEW.user_id) THEN 1 ELSE 0 END) +
        (CASE WHEN EXISTS(SELECT 1 FROM dna_tags_filters WHERE user_id = NEW.user_id) THEN 1 ELSE 0 END) +
        (CASE WHEN EXISTS(SELECT 1 FROM dna_site_preferences WHERE user_id = NEW.user_id) THEN 1 ELSE 0 END) +
        (CASE WHEN EXISTS(SELECT 1 FROM dna_recommendations WHERE user_id = NEW.user_id) THEN 1 ELSE 0 END)
    INTO completion_count;
    
    progress_percentage := (completion_count * 100) / total_sections;
    
    -- Update the review_save table
    UPDATE dna_review_save SET
        about_you_completed = EXISTS(SELECT 1 FROM dna_about_you WHERE user_id = NEW.user_id),
        insight_questions_completed = EXISTS(SELECT 1 FROM dna_insight_questions WHERE user_id = NEW.user_id),
        importance_completed = EXISTS(SELECT 1 FROM dna_importance WHERE user_id = NEW.user_id),
        content_channels_completed = EXISTS(SELECT 1 FROM dna_content_channels WHERE user_id = NEW.user_id),
        tags_filters_completed = EXISTS(SELECT 1 FROM dna_tags_filters WHERE user_id = NEW.user_id),
        site_preferences_completed = EXISTS(SELECT 1 FROM dna_site_preferences WHERE user_id = NEW.user_id),
        recommendations_completed = EXISTS(SELECT 1 FROM dna_recommendations WHERE user_id = NEW.user_id),
        total_progress = progress_percentage,
        completion_date = CASE WHEN progress_percentage = 100 THEN NOW() ELSE NULL END,
        profile_active = CASE WHEN progress_percentage = 100 THEN true ELSE profile_active END
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to update completion status
CREATE TRIGGER update_completion_on_about_you AFTER INSERT OR UPDATE ON dna_about_you FOR EACH ROW EXECUTE FUNCTION update_completion_status();
CREATE TRIGGER update_completion_on_insight_questions AFTER INSERT OR UPDATE ON dna_insight_questions FOR EACH ROW EXECUTE FUNCTION update_completion_status();
CREATE TRIGGER update_completion_on_importance AFTER INSERT OR UPDATE ON dna_importance FOR EACH ROW EXECUTE FUNCTION update_completion_status();
CREATE TRIGGER update_completion_on_content_channels AFTER INSERT OR UPDATE ON dna_content_channels FOR EACH ROW EXECUTE FUNCTION update_completion_status();
CREATE TRIGGER update_completion_on_tags_filters AFTER INSERT OR UPDATE ON dna_tags_filters FOR EACH ROW EXECUTE FUNCTION update_completion_status();
CREATE TRIGGER update_completion_on_site_preferences AFTER INSERT OR UPDATE ON dna_site_preferences FOR EACH ROW EXECUTE FUNCTION update_completion_status();
CREATE TRIGGER update_completion_on_recommendations AFTER INSERT OR UPDATE ON dna_recommendations FOR EACH ROW EXECUTE FUNCTION update_completion_status();

-- Create a view for easy profile summary access
CREATE OR REPLACE VIEW dna_profile_summary AS
SELECT 
    rs.user_id,
    rs.total_progress,
    rs.profile_active,
    rs.completion_date,
    
    -- About You summary
    ay.display_name,
    ay.job_title,
    ay.company,
    ay.avatar_url,
    
    -- Completion status
    rs.about_you_completed,
    rs.insight_questions_completed,
    rs.importance_completed,
    rs.content_channels_completed,
    rs.tags_filters_completed,
    rs.site_preferences_completed,
    rs.recommendations_completed,
    
    -- Last updated
    GREATEST(
        COALESCE(ay.updated_at, '1970-01-01'::timestamp),
        COALESCE(iq.updated_at, '1970-01-01'::timestamp),
        COALESCE(imp.updated_at, '1970-01-01'::timestamp),
        COALESCE(cc.updated_at, '1970-01-01'::timestamp),
        COALESCE(tf.updated_at, '1970-01-01'::timestamp),
        COALESCE(sp.updated_at, '1970-01-01'::timestamp),
        COALESCE(rec.updated_at, '1970-01-01'::timestamp)
    ) as last_updated
    
FROM dna_review_save rs
LEFT JOIN dna_about_you ay ON rs.user_id = ay.user_id
LEFT JOIN dna_insight_questions iq ON rs.user_id = iq.user_id
LEFT JOIN dna_importance imp ON rs.user_id = imp.user_id
LEFT JOIN dna_content_channels cc ON rs.user_id = cc.user_id
LEFT JOIN dna_tags_filters tf ON rs.user_id = tf.user_id
LEFT JOIN dna_site_preferences sp ON rs.user_id = sp.user_id
LEFT JOIN dna_recommendations rec ON rs.user_id = rec.user_id;

-- Grant appropriate permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Comments for documentation
COMMENT ON TABLE dna_about_you IS 'Personal and professional information for DNA profile';
COMMENT ON TABLE dna_insight_questions IS 'User responses to insight questionnaire for personalization';
COMMENT ON TABLE dna_importance IS 'User-defined importance weights for different factors';
COMMENT ON TABLE dna_content_channels IS 'Content type preferences and channel management';
COMMENT ON TABLE dna_tags_filters IS 'Tag preferences and content filtering rules';
COMMENT ON TABLE dna_site_preferences IS 'User interface and experience preferences';
COMMENT ON TABLE dna_recommendations IS 'Recommendation algorithm configuration and preferences';
COMMENT ON TABLE dna_review_save IS 'Profile completion tracking and summary data';
COMMENT ON VIEW dna_profile_summary IS 'Consolidated view of user DNA profile status and key information'; 