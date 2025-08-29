const { createClient } = require('@supabase/supabase-js');

// Supabase configuration from the project
const supabaseUrl = 'https://kljhlubpxxcawacrzaix.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsamhsdWJweHhjYXdhY3J6YWl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODY5OTg3NCwiZXhwIjoyMDY0Mjc1ODc0fQ.GXO_NsRI2VtJt0dmkER9DszNpoRyELASZuyKd47-ZQs';

async function createBookmarksTable() {
    console.log('🚀 Creating bookmarks table in Supabase...');
    
    try {
        // Initialize Supabase client with service role
        const supabase = createClient(supabaseUrl, serviceRoleKey);
        
        // SQL to create the bookmarks table that matches the API interface exactly
        const createTableSQL = `
            -- Create bookmarks table that matches the API interface exactly
            CREATE TABLE IF NOT EXISTS public.bookmarks (
                id BIGSERIAL PRIMARY KEY,
                user_id TEXT NOT NULL,
                title TEXT NOT NULL,
                url TEXT NOT NULL,
                description TEXT NOT NULL DEFAULT '',
                category TEXT NOT NULL DEFAULT 'General',
                tags TEXT[] DEFAULT ARRAY[]::TEXT[],
                ai_summary TEXT,
                ai_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
                ai_category TEXT,
                notes TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
                updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
                site_health TEXT DEFAULT 'working' CHECK (site_health IN ('excellent', 'working', 'fair', 'poor', 'broken')),
                last_health_check TIMESTAMPTZ,
                healthCheckCount INTEGER DEFAULT 0,
                customBackground TEXT,
                visits INTEGER DEFAULT 0,
                time_spent INTEGER DEFAULT 0,
                relatedBookmarks INTEGER[] DEFAULT ARRAY[]::INTEGER[]
            );

            -- Create indexes for performance
            CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
            CREATE INDEX IF NOT EXISTS idx_bookmarks_url ON public.bookmarks(url);
            CREATE INDEX IF NOT EXISTS idx_bookmarks_category ON public.bookmarks(category);
            CREATE INDEX IF NOT EXISTS idx_bookmarks_tags ON public.bookmarks USING GIN(tags);
            CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON public.bookmarks(created_at DESC);

            -- Create trigger for updated_at
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            CREATE TRIGGER IF NOT EXISTS update_bookmarks_updated_at
                BEFORE UPDATE ON public.bookmarks
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();

            -- Grant permissions
            GRANT ALL ON public.bookmarks TO authenticated;
            GRANT USAGE, SELECT ON SEQUENCE bookmarks_id_seq TO authenticated;
        `;
        
        // Execute the SQL
        const { error } = await supabase.rpc('exec', { sql: createTableSQL });
        
        if (error) {
            console.error('❌ Error creating table:', error);
            throw error;
        }
        
        console.log('✅ Successfully created bookmarks table!');
        console.log('📋 Table schema:');
        console.log('   - id: BIGSERIAL (auto-increment)');
        console.log('   - user_id: TEXT');
        console.log('   - title, url, description, category: TEXT');
        console.log('   - tags, ai_tags: TEXT[]');
        console.log('   - visits, time_spent, healthCheckCount: INTEGER');
        console.log('   - created_at, updated_at: TIMESTAMPTZ');
        console.log('   - site_health: ENUM');
        console.log('   - relatedBookmarks: INTEGER[]');
        
        // Test the table by checking if it exists
        const { data: tableInfo, error: checkError } = await supabase
            .from('bookmarks')
            .select('*')
            .limit(1);
            
        if (checkError && !checkError.message.includes('no rows')) {
            console.error('❌ Error checking table:', checkError);
        } else {
            console.log('✅ Table verification successful!');
            console.log('🎉 Ready for bookmark operations!');
        }
        
    } catch (error) {
        console.error('❌ Fatal error:', error.message);
        process.exit(1);
    }
}

// Run the function
createBookmarksTable();

