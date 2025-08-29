const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function verifyBookmarksTable() {
  try {
    console.log('🔍 Verifying bookmarks table structure...');
    
    // Test table access
    const { data, error } = await supabase
      .from('user_bookmarks')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error accessing bookmarks table:', error);
      return false;
    }
    
    console.log('✅ Bookmarks table is accessible');
    console.log('📊 Sample data structure:', data);
    
    // Test table schema
    const { data: schemaData, error: schemaError } = await supabase
      .rpc('get_table_schema', { table_name: 'user_bookmarks' });
    
    if (!schemaError && schemaData) {
      console.log('📋 Table schema:', schemaData);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Verification failed:', error);
    return false;
  }
}

verifyBookmarksTable().then(success => {
  console.log(success ? '✅ Verification complete' : '❌ Verification failed');
  process.exit(success ? 0 : 1);
}); 