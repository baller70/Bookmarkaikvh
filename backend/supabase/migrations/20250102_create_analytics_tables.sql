-- Analytics tracking tables for comprehensive user analytics
-- This migration creates tables to track user behavior and generate insights

-- User Pomodoro Sessions for time tracking
CREATE TABLE IF NOT EXISTS user_pomodoro_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES user_tasks(id) ON DELETE SET NULL,
    task_title TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER NOT NULL, -- in minutes
    type TEXT NOT NULL CHECK (type IN ('work', 'shortBreak', 'longBreak')),
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    was_interrupted BOOLEAN NOT NULL DEFAULT FALSE,
    productivity_score INTEGER CHECK (productivity_score >= 0 AND productivity_score <= 100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Tasks for project management
CREATE TABLE IF NOT EXISTS user_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES user_bookmark_categories(id) ON DELETE SET NULL,
    priority_level INTEGER NOT NULL DEFAULT 3 CHECK (priority_level >= 1 AND priority_level <= 5),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    deadline TIMESTAMP WITH TIME ZONE,
    estimated_duration INTEGER, -- in minutes
    actual_duration INTEGER, -- in minutes
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    recurring_pattern TEXT, -- 'daily', 'weekly', 'monthly'
    tags TEXT[], -- array of tag names
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- User Analytics Cache for performance
CREATE TABLE IF NOT EXISTS user_analytics_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    time_range TEXT NOT NULL CHECK (time_range IN ('7d', '30d', '90d', '1y')),
    section TEXT NOT NULL CHECK (section IN ('overview', 'time-tracking', 'insights', 'categories', 'projects', 'recommendations')),
    data JSONB NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 hour'),
    UNIQUE(user_id, time_range, section)
);

-- User Activity Log for detailed tracking
CREATE TABLE IF NOT EXISTS user_activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'bookmark_visit', 'bookmark_create', 'task_complete', etc.
    entity_type TEXT NOT NULL, -- 'bookmark', 'task', 'category', etc.
    entity_id UUID,
    metadata JSONB, -- flexible data storage
    duration_minutes INTEGER, -- time spent on activity
    productivity_score INTEGER CHECK (productivity_score >= 0 AND productivity_score <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add analytics columns to existing user_bookmarks table
ALTER TABLE user_bookmarks 
ADD COLUMN IF NOT EXISTS visit_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_visited_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reading_time_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS productivity_score INTEGER CHECK (productivity_score >= 0 AND productivity_score <= 100);

-- Add analytics columns to existing user_bookmark_categories table
ALTER TABLE user_bookmark_categories 
ADD COLUMN IF NOT EXISTS usage_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS efficiency_score INTEGER CHECK (efficiency_score >= 0 AND efficiency_score <= 100);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_time ON user_pomodoro_sessions(user_id, start_time);
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_type ON user_pomodoro_sessions(type);
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON user_tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON user_tasks(deadline) WHERE deadline IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analytics_cache_lookup ON user_analytics_cache(user_id, time_range, section);
CREATE INDEX IF NOT EXISTS idx_analytics_cache_expires ON user_analytics_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_time ON user_activity_log(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_activity_log_type ON user_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_bookmarks_visit_count ON user_bookmarks(visit_count DESC);
CREATE INDEX IF NOT EXISTS idx_bookmarks_last_visited ON user_bookmarks(last_visited_at DESC);

-- Create a function to increment visit count
CREATE OR REPLACE FUNCTION increment_visit_count(bookmark_id UUID)
RETURNS INTEGER AS $$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE user_bookmarks 
    SET visit_count = visit_count + 1,
        last_visited_at = NOW()
    WHERE id = bookmark_id
    RETURNING visit_count INTO new_count;
    
    RETURN COALESCE(new_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Create a function to calculate productivity score based on time spent and engagement
CREATE OR REPLACE FUNCTION calculate_productivity_score(
    time_spent_minutes INTEGER,
    engagement_level INTEGER DEFAULT 50
)
RETURNS INTEGER AS $$
BEGIN
    -- Simple algorithm: base score from engagement, bonus for time spent
    -- Engagement level (0-100) forms the base
    -- Time spent adds bonus points (diminishing returns)
    RETURN LEAST(100, engagement_level + (time_spent_minutes / 10));
END;
$$ LANGUAGE plpgsql;

-- Create a function to clean up expired analytics cache
CREATE OR REPLACE FUNCTION cleanup_expired_analytics_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_analytics_cache 
    WHERE expires_at < NOW()
    RETURNING COUNT(*) INTO deleted_count;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update analytics when bookmarks are accessed
CREATE OR REPLACE FUNCTION update_bookmark_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- Log the activity
    INSERT INTO user_activity_log (
        user_id, 
        activity_type, 
        entity_type, 
        entity_id, 
        metadata
    ) VALUES (
        NEW.user_id,
        'bookmark_update',
        'bookmark',
        NEW.id,
        jsonb_build_object(
            'title', NEW.title,
            'url', NEW.url,
            'visit_count', NEW.visit_count
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS bookmark_analytics_trigger ON user_bookmarks;
CREATE TRIGGER bookmark_analytics_trigger
    AFTER UPDATE ON user_bookmarks
    FOR EACH ROW
    WHEN (OLD.visit_count IS DISTINCT FROM NEW.visit_count)
    EXECUTE FUNCTION update_bookmark_analytics();

-- Create a function to get user analytics summary
CREATE OR REPLACE FUNCTION get_user_analytics_summary(
    p_user_id UUID,
    p_time_range TEXT DEFAULT '30d'
)
RETURNS JSONB AS $$
DECLARE
    start_date TIMESTAMP WITH TIME ZONE;
    result JSONB;
BEGIN
    -- Calculate start date based on time range
    CASE p_time_range
        WHEN '7d' THEN start_date := NOW() - INTERVAL '7 days';
        WHEN '30d' THEN start_date := NOW() - INTERVAL '30 days';
        WHEN '90d' THEN start_date := NOW() - INTERVAL '90 days';
        WHEN '1y' THEN start_date := NOW() - INTERVAL '1 year';
        ELSE start_date := NOW() - INTERVAL '30 days';
    END CASE;
    
    -- Build comprehensive analytics JSON
    SELECT jsonb_build_object(
        'overview', jsonb_build_object(
            'totalBookmarks', (SELECT COUNT(*) FROM user_bookmarks WHERE user_id = p_user_id),
            'totalVisits', (SELECT COALESCE(SUM(visit_count), 0) FROM user_bookmarks WHERE user_id = p_user_id),
            'engagementScore', (SELECT COALESCE(AVG(productivity_score), 0) FROM user_bookmarks WHERE user_id = p_user_id AND productivity_score IS NOT NULL),
            'timeSpent', (SELECT COALESCE(SUM(reading_time_minutes), 0) FROM user_bookmarks WHERE user_id = p_user_id),
            'productivityScore', (SELECT COALESCE(AVG(productivity_score), 0) FROM user_pomodoro_sessions WHERE user_id = p_user_id AND start_time >= start_date)
        ),
        'timeTracking', jsonb_build_object(
            'dailyAverage', (SELECT COALESCE(AVG(duration), 0) / 60.0 FROM user_pomodoro_sessions WHERE user_id = p_user_id AND start_time >= start_date AND type = 'work'),
            'totalHours', (SELECT COALESCE(SUM(duration), 0) / 60.0 FROM user_pomodoro_sessions WHERE user_id = p_user_id AND start_time >= start_date),
            'sessionsCompleted', (SELECT COUNT(*) FROM user_pomodoro_sessions WHERE user_id = p_user_id AND start_time >= start_date AND is_completed = true)
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Insert some sample data for testing (only if tables are empty)
DO $$
BEGIN
    -- Sample pomodoro sessions
    IF NOT EXISTS (SELECT 1 FROM user_pomodoro_sessions LIMIT 1) THEN
        -- This would need actual user IDs in production
        -- INSERT INTO user_pomodoro_sessions (user_id, task_title, duration, type, is_completed, productivity_score)
        -- VALUES 
        --     ('user-uuid-here', 'Code Review', 25, 'work', true, 85),
        --     ('user-uuid-here', 'Documentation', 25, 'work', true, 78);
    END IF;
END $$;

-- Enable RLS (Row Level Security)
ALTER TABLE user_pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can only access their own pomodoro sessions" ON user_pomodoro_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own tasks" ON user_tasks
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own analytics cache" ON user_analytics_cache
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own activity log" ON user_activity_log
    FOR ALL USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON user_pomodoro_sessions TO authenticated;
GRANT ALL ON user_tasks TO authenticated;
GRANT ALL ON user_analytics_cache TO authenticated;
GRANT ALL ON user_activity_log TO authenticated;

-- Create a scheduled job to clean up expired cache (if pg_cron is available)
-- SELECT cron.schedule('cleanup-analytics-cache', '0 * * * *', 'SELECT cleanup_expired_analytics_cache();');

COMMENT ON TABLE user_pomodoro_sessions IS 'Tracks user pomodoro sessions for time management analytics';
COMMENT ON TABLE user_tasks IS 'User tasks for project management and productivity tracking';
COMMENT ON TABLE user_analytics_cache IS 'Cached analytics data for performance optimization';
COMMENT ON TABLE user_activity_log IS 'Detailed log of user activities for analytics';
COMMENT ON FUNCTION get_user_analytics_summary IS 'Returns comprehensive analytics summary for a user'; 