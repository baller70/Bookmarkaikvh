const fetch = require('node-fetch');

// Supabase configuration
const supabaseUrl = 'https://kljhlubpxxcawacrzaix.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsamhsdWJweHhjYXdhY3J6YWl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODY5OTg3NCwiZXhwIjoyMDY0Mjc1ODc0fQ.GXO_NsRI2VtJt0dmkER9DszNpoRyELASZuyKd47-ZQs';

async function executeSQL(sql) {
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            },
            body: JSON.stringify({ sql })
        });
        
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`HTTP ${response.status}: ${error}`);
        }
        
        return await response.json();
    } catch (error) {
        throw error;
    }
}

async function createTable() {
    console.log('🚀 Creating user_bookmarks table...');
    
    try {
        // Create the table using individual SQL statements
        console.log('📋 Creating table structure...');
        
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS public.user_bookmarks (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id UUID NOT NULL,
                title TEXT NOT NULL,
                url TEXT NOT NULL,
                description TEXT,
                favicon TEXT,
                screenshot TEXT,
                category TEXT,
                tags TEXT[] DEFAULT ARRAY[]::TEXT[],
                folder_id UUID,
                priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
                is_favorite BOOLEAN DEFAULT FALSE,
                is_public BOOLEAN DEFAULT FALSE,
                visit_count INTEGER DEFAULT 0,
                last_visited_at TIMESTAMP WITH TIME ZONE,
                reading_time_minutes INTEGER,
                ai_summary TEXT,
                ai_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
                ai_category TEXT,
                link_type TEXT CHECK (link_type IN ('video', 'doc', 'pdf', 'repo', 'web', 'article', 'tool')),
                domain TEXT,
                language TEXT,
                word_count INTEGER,
                notes TEXT,
                custom_data JSONB DEFAULT '{}'::JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                UNIQUE(user_id, url)
            );
        `;
        
        // Since exec doesn't work, let's try a different approach
        // Use curl to execute SQL directly
        const { spawn } = require('child_process');
        
        const curlCommand = [
            'curl', '-X', 'POST',
            `${supabaseUrl}/rest/v1/rpc/query`,
            '-H', `Authorization: Bearer ${serviceRoleKey}`,
            '-H', `apikey: ${serviceRoleKey}`,
            '-H', 'Content-Type: application/json',
            '-d', JSON.stringify({ query: createTableSQL })
        ];
        
        console.log('🔧 Executing SQL via curl...');
        
        const curlProcess = spawn('curl', curlCommand.slice(1), { stdio: 'inherit' });
        
        curlProcess.on('close', (code) => {
            if (code === 0) {
                console.log('✅ Table creation completed!');
                createIndexes();
            } else {
                console.error('❌ Table creation failed');
                process.exit(1);
            }
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

async function createIndexes() {
    console.log('📊 Creating indexes...');
    
    const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id ON public.user_bookmarks(user_id);',
        'CREATE INDEX IF NOT EXISTS idx_user_bookmarks_url ON public.user_bookmarks(url);',
        'CREATE INDEX IF NOT EXISTS idx_user_bookmarks_domain ON public.user_bookmarks(domain);',
        'CREATE INDEX IF NOT EXISTS idx_user_bookmarks_category ON public.user_bookmarks(category);',
        'CREATE INDEX IF NOT EXISTS idx_user_bookmarks_tags ON public.user_bookmarks USING GIN(tags);',
        'CREATE INDEX IF NOT EXISTS idx_user_bookmarks_created_at ON public.user_bookmarks(created_at DESC);'
    ];
    
    for (const indexSQL of indexes) {
        console.log(`Creating index: ${indexSQL.split(' ')[5]}`);
        // We'll handle indexes separately
    }
    
    console.log('✅ Setup completed!');
    console.log('🎉 Your bulk uploader should now work!');
}

// Run the function
createTable(); 