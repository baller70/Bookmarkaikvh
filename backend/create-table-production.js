const { createClient } = require('@supabase/supabase-js');

// Supabase configuration from your project
const supabaseUrl = 'https://kljhlubpxxcawacrzaix.supabase.co';

// Get service role key from environment or use the actual key from your project
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsamhsdWJweHhjYXdhY3J6YWl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODY5OTg3NCwiZXhwIjoyMDY0Mjc1ODc0fQ.GXO_NsRI2VtJt0dmkER9DszNpoRyELASZuyKd47-ZQs';

async function createTable() {
    console.log('🚀 Creating user_bookmarks table...');
    
    // Create service role client
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    try {
        // First, check if table exists
        console.log('🔍 Checking if table exists...');
        const { data: tables, error: tableError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .eq('table_name', 'user_bookmarks');
            
        if (tableError) {
            console.log('ℹ️  Cannot check table existence, proceeding with creation...');
        } else if (tables && tables.length > 0) {
            console.log('✅ Table user_bookmarks already exists!');
            return true;
        }
        
        // Create the table
        console.log('📋 Creating table...');
        const createTableSQL = `
            -- Create user_bookmarks table
            CREATE TABLE IF NOT EXISTS public.user_bookmarks (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id UUID NOT NULL,
                
                -- Core bookmark data
                title TEXT NOT NULL,
                url TEXT NOT NULL,
                description TEXT,
                favicon TEXT,
                screenshot TEXT,
                
                -- Categorization
                category TEXT,
                tags TEXT[] DEFAULT ARRAY[]::TEXT[],
                folder_id UUID,
                
                -- Metadata
                priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
                is_favorite BOOLEAN DEFAULT FALSE,
                is_public BOOLEAN DEFAULT FALSE,
                
                -- Analytics
                visit_count INTEGER DEFAULT 0,
                last_visited_at TIMESTAMP WITH TIME ZONE,
                reading_time_minutes INTEGER,
                
                -- AI-generated data
                ai_summary TEXT,
                ai_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
                ai_category TEXT,
                
                -- Processing metadata
                link_type TEXT CHECK (link_type IN ('video', 'doc', 'pdf', 'repo', 'web', 'article', 'tool')),
                domain TEXT,
                language TEXT,
                word_count INTEGER,
                
                -- Notes and custom data
                notes TEXT,
                custom_data JSONB DEFAULT '{}'::JSONB,
                
                -- Timestamps
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                
                -- Constraints
                UNIQUE(user_id, url)
            );
            
            -- Create indexes for better performance
            CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id ON public.user_bookmarks(user_id);
            CREATE INDEX IF NOT EXISTS idx_user_bookmarks_url ON public.user_bookmarks(url);
            CREATE INDEX IF NOT EXISTS idx_user_bookmarks_domain ON public.user_bookmarks(domain);
            CREATE INDEX IF NOT EXISTS idx_user_bookmarks_category ON public.user_bookmarks(category);
            CREATE INDEX IF NOT EXISTS idx_user_bookmarks_tags ON public.user_bookmarks USING GIN(tags);
            CREATE INDEX IF NOT EXISTS idx_user_bookmarks_created_at ON public.user_bookmarks(created_at DESC);
            
            -- Enable RLS (but service role bypasses this)
            ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;
            
            -- Create RLS policies 
            CREATE POLICY "Users can view their own bookmarks" ON public.user_bookmarks
                FOR SELECT USING (auth.uid() = user_id);
            
            CREATE POLICY "Users can insert their own bookmarks" ON public.user_bookmarks
                FOR INSERT WITH CHECK (auth.uid() = user_id);
            
            CREATE POLICY "Users can update their own bookmarks" ON public.user_bookmarks
                FOR UPDATE USING (auth.uid() = user_id);
            
            CREATE POLICY "Users can delete their own bookmarks" ON public.user_bookmarks
                FOR DELETE USING (auth.uid() = user_id);
        `;
        
        // Execute the SQL using rpc
        const { error } = await supabase.rpc('exec', { sql: createTableSQL });
        
        if (error) {
            console.error('❌ Error creating table:', error);
            console.error('Error details:', {
                message: error.message,
                hint: error.hint,
                details: error.details,
                code: error.code
            });
            return false;
        }
        
        console.log('✅ Table created successfully!');
        
        // Test the table
        console.log('🧪 Testing table access...');
        const { error: testError } = await supabase
            .from('user_bookmarks')
            .select('id')
            .limit(1);
            
        if (testError) {
            console.error('❌ Error testing table:', testError);
            return false;
        }
        
        console.log('✅ Table is accessible and ready!');
        return true;
        
    } catch (error) {
        console.error('❌ Unexpected error:', error);
        return false;
    }
}

// Run the function
createTable().then(success => {
    if (success) {
        console.log('🎉 Database setup complete! Your bulk uploader should now work.');
    } else {
        console.log('💥 Database setup failed. Please check the errors above.');
    }
    process.exit(success ? 0 : 1);
}); 