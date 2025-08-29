const { createClient } = require('@supabase/supabase-js');

// Set environment variables for this test
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://kljhlubpxxcawacrzaix.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsamhsdWJweHhjYXdhY3J6YWl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2OTk4NzQsImV4cCI6MjA2NDI3NTg3NH0.UFmDwHP641NLtKKAoriM2re4ADcjLpfZhbkUfbmWuK0';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsamhsdWJweHhjYXdhY3J6YWl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODY5OTg3NCwiZXhwIjoyMDY0Mjc1ODc0fQ.GXO_NsRI2VtJt0dmkER9DszNpoRyELASZuyKd47-ZQs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testBulkUploader() {
  try {
    console.log('🧪 Testing bulk uploader API...');
    
    // First, let's test if we can directly insert a bookmark
    console.log('💾 Testing direct database insert...');
    const { data: testInsert, error: insertError } = await supabase
      .from('bookmarks')
      .insert({
        user_id: '48e1b5b9-3b0f-4ccb-8b34-831b1337fc3f',
        url: 'https://test.com',
        title: 'Test Bookmark',
        description: 'Test description',
        created_at: new Date().toISOString()
      })
      .select();
    
    if (insertError) {
      console.log('❌ Direct insert failed:', insertError.message);
    } else {
      console.log('✅ Direct insert works:', testInsert);
    }
    
    // Now test the API
    const testData = {
      links: [
        'https://github.com/vercel/next.js',
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      ],
      settings: {
        batchSize: 10,
        autoCategorize: false,
        privacy: 'private',
        duplicateHandling: 'skip'
      }
    };
    
    console.log('🔗 Testing API endpoint...');
    const response = await fetch('http://localhost:3000/api/ai/bulk-uploader', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    console.log('📊 Response status:', response.status);
    console.log('📊 Response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Bulk uploader working!');
      
      // Check database
      const { data: bookmarks, error } = await supabase
        .from('bookmarks')
        .select('*')
        .limit(10);
        
      if (error) {
        console.log('⚠️ Database check error:', error.message);
      } else {
        console.log('💾 Database now has', bookmarks.length, 'bookmarks');
        bookmarks.forEach(bookmark => {
          console.log('📖', bookmark.title, '→', bookmark.url);
        });
      }
    } else {
      console.log('❌ Bulk uploader failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBulkUploader(); 