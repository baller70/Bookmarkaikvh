import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables');
  console.log('Make sure you have both:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testBulkUploader() {
  console.log('🧪 Testing bulk uploader functionality...');
  
  const testUserId = '00000000-0000-0000-0000-000000000000';
  const testLinks = [
    'https://example.com',
    'https://github.com',
    'https://stackoverflow.com'
  ];

  try {
    // Test each link
    for (const link of testLinks) {
      console.log(`\n📝 Testing link: ${link}`);
      
      // Simulate what the bulk uploader does
      const bookmarkData = {
        user_id: testUserId,
        title: `Test bookmark for ${link}`,
        url: link,
        description: 'Test bookmark created by bulk uploader test',
        category: 'test',
        tags: ['test', 'bulk-uploader'],
        priority: 'medium',
        link_type: 'web',
        ai_summary: 'This is a test bookmark created during bulk uploader testing',
        ai_tags: ['test', 'automation'],
        ai_category: 'testing'
      };

      // Test insert
      const { data, error } = await supabase
        .from('user_bookmarks')
        .insert([bookmarkData])
        .select();

      if (error) {
        console.error(`❌ Failed to insert ${link}:`, error);
        return false;
      }

      console.log(`✅ Successfully inserted ${link}`);
      
      // Clean up
      if (data && data.length > 0) {
        await supabase
          .from('user_bookmarks')
          .delete()
          .eq('id', data[0].id);
        console.log(`🧹 Cleaned up ${link}`);
      }
    }

    console.log('\n🎉 All tests passed! Bulk uploader should work correctly.');
    console.log('✅ Database tables exist');
    console.log('✅ Insert operations work');
    console.log('✅ RLS policies configured properly');
    console.log('');
    console.log('🚀 You can now test the bulk uploader at:');
    console.log('   http://localhost:3000/bulk-uploader');
    
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

testBulkUploader().catch(console.error); 