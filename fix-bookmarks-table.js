const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Supabase configuration
const supabaseUrl = 'https://kljhlubpxxcawacrzaix.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsamhsdWJweHhjYXdhY3J6YWl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODY5OTg3NCwiZXhwIjoyMDY0Mjc1ODc0fQ.GXO_NsRI2VtJt0dmkER9DszNpoRyELASZuyKd47-ZQs';

async function fixBookmarksTable() {
    console.log('🔧 Fixing bookmarks table structure...');
    
    try {
        // Initialize Supabase client with service role
        const supabase = createClient(supabaseUrl, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
        
        // Read the SQL file
        const sql = fs.readFileSync('fix-bookmarks-table.sql', 'utf8');
        
        console.log('📝 Adding missing columns to bookmarks table...');
        
        // Execute the ALTER TABLE statement directly
        const { data, error } = await supabase.rpc('exec_sql', { 
            sql: sql 
        });
        
        if (error) {
            console.log('⚠️  SQL execution result:', error.message);
            
            // Try alternative approach: add columns one by one
            console.log('🔄 Trying alternative approach: adding columns individually...');
            
            const columns = [
                "ALTER TABLE public.bookmarks ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';",
                "ALTER TABLE public.bookmarks ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[];",
                "ALTER TABLE public.bookmarks ADD COLUMN IF NOT EXISTS ai_summary TEXT;",
                "ALTER TABLE public.bookmarks ADD COLUMN IF NOT EXISTS ai_tags TEXT[] DEFAULT ARRAY[]::TEXT[];",
                "ALTER TABLE public.bookmarks ADD COLUMN IF NOT EXISTS ai_category TEXT;",
                "ALTER TABLE public.bookmarks ADD COLUMN IF NOT EXISTS notes TEXT;",
                "ALTER TABLE public.bookmarks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();",
                "ALTER TABLE public.bookmarks ADD COLUMN IF NOT EXISTS site_health TEXT DEFAULT 'working';",
                "ALTER TABLE public.bookmarks ADD COLUMN IF NOT EXISTS last_health_check TIMESTAMPTZ;",
                "ALTER TABLE public.bookmarks ADD COLUMN IF NOT EXISTS healthCheckCount INTEGER DEFAULT 0;",
                "ALTER TABLE public.bookmarks ADD COLUMN IF NOT EXISTS customBackground TEXT;",
                "ALTER TABLE public.bookmarks ADD COLUMN IF NOT EXISTS visits INTEGER DEFAULT 0;",
                "ALTER TABLE public.bookmarks ADD COLUMN IF NOT EXISTS time_spent INTEGER DEFAULT 0;",
                "ALTER TABLE public.bookmarks ADD COLUMN IF NOT EXISTS relatedBookmarks TEXT[] DEFAULT ARRAY[]::TEXT[];"
            ];
            
            for (let i = 0; i < columns.length; i++) {
                try {
                    const { data: colData, error: colError } = await supabase.rpc('exec_sql', { 
                        sql: columns[i] 
                    });
                    
                    if (colError) {
                        console.log(`⚠️  Column ${i + 1} error:`, colError.message);
                    } else {
                        console.log(`✅ Column ${i + 1} added successfully`);
                    }
                } catch (err) {
                    console.log(`⚠️  Column ${i + 1} exception:`, err.message);
                }
            }
        } else {
            console.log('✅ SQL executed successfully');
        }
        
        console.log('🎉 Table structure fix completed!');
        
        // Test the fix by trying to insert a test record
        console.log('🧪 Testing the fix...');
        const testBookmark = {
            user_id: '00000000-0000-0000-0000-000000000001',
            title: 'Test Bookmark Fix',
            url: 'https://test-fix.com',
            description: 'Test description',
            category: 'Testing',
            tags: ['test'],
            ai_summary: 'Test AI summary',
            ai_tags: ['ai-test'],
            ai_category: 'AI Testing',
            notes: 'Test notes'
        };
        
        const { data: insertData, error: insertError } = await supabase
            .from('bookmarks')
            .insert(testBookmark)
            .select();
            
        if (insertError) {
            console.log('❌ Test insert failed:', insertError.message);
            console.log('❌ Full error:', insertError);
        } else {
            console.log('✅ Test insert successful! Bookmark ID:', insertData[0]?.id);
            
            // Clean up test record
            if (insertData[0]?.id) {
                await supabase
                    .from('bookmarks')
                    .delete()
                    .eq('id', insertData[0].id);
                console.log('🧹 Test record cleaned up');
            }
        }
        
    } catch (error) {
        console.error('❌ Error fixing bookmarks table:', error.message);
        console.error('❌ Full error:', error);
    }
}

// Run the fix
fixBookmarksTable();