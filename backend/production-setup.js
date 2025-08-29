const { createClient } = require('@supabase/supabase-js');

console.log('🚀 Setting up production database...');

// Production Supabase configuration
const supabaseUrl = 'https://kljhlubpxxcawacrzaix.supabase.co';
// You need to get this from your Supabase Dashboard > Settings > API
// Go to: https://supabase.com/dashboard/project/kljhlubpxxcawacrzaix/settings/api
// Copy the "service_role" key (not the anon key)
const serviceRoleKey = 'YOUR_ACTUAL_SERVICE_ROLE_KEY_HERE';

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, serviceRoleKey);

// SQL to create the user_bookmarks table
const createTableSQL = `
-- Create user_bookmarks table with all required fields
CREATE TABLE IF NOT EXISTS public.user_bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
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
    
    -- View-specific data (JSON for flexibility)
    view_data JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id ON public.user_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_category ON public.user_bookmarks(category);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_tags ON public.user_bookmarks USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_created_at ON public.user_bookmarks(created_at);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_url ON public.user_bookmarks(url);

-- Enable RLS
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY IF NOT EXISTS "Users can view own bookmarks" ON public.user_bookmarks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own bookmarks" ON public.user_bookmarks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own bookmarks" ON public.user_bookmarks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own bookmarks" ON public.user_bookmarks
    FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER IF NOT EXISTS update_user_bookmarks_updated_at
    BEFORE UPDATE ON public.user_bookmarks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
`;

async function setupDatabase() {
    try {
        console.log('📊 Creating user_bookmarks table...');
        
        const { error } = await supabase.rpc('exec', { 
            sql: createTableSQL 
        });
        
        if (error) {
            console.error('❌ Error creating table:', error);
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
        
        console.log('✅ Table is accessible!');
        return true;
        
    } catch (error) {
        console.error('❌ Setup failed:', error);
        return false;
    }
}

async function main() {
    const success = await setupDatabase();
    
    if (success) {
        console.log('');
        console.log('🎉 Production database setup complete!');
        console.log('✅ user_bookmarks table created');
        console.log('✅ Indexes created for performance');
        console.log('✅ RLS policies configured');
        console.log('✅ Bulk uploader is ready for production use');
        console.log('');
        console.log('🚀 You can now use the bulk uploader at:');
        console.log('   http://localhost:3000/settings/ai/bulk-uploader');
    } else {
        console.log('❌ Setup failed. Check the errors above.');
    }
}

main(); 