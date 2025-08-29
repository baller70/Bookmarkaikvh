const { createClient } = require('@supabase/supabase-js');

// Production Supabase configuration
const supabaseUrl = 'https://kljhlubpxxcawacrzaix.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsamhsdWJweHhjYXdhY3J6YWl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODY5OTg3NCwiZXhwIjoyMDY0Mjc1ODc0fQ.GXO_NsRI2VtJt0dmkER9DszNpoRyELASZuyKd47-ZQs';

// Create service role client (bypasses RLS)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const BULK_UPLOADER_USER_ID = '00000000-0000-0000-0000-000000000000';

async function setupProductionDatabase() {
  console.log('🚀 Setting up production database for bulk uploader...');

  try {
    // Step 1: Create user profile in profiles table (required for foreign key constraint)
    console.log('👤 Creating user profile...');
    
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', BULK_UPLOADER_USER_ID)
      .single();

    if (!existingProfile) {
      console.log('📝 Profile does not exist, creating...');
      
      // Try with minimal fields first
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: BULK_UPLOADER_USER_ID,
          full_name: 'Bulk Uploader Service',
          username: 'bulk_uploader'
        })
        .select()
        .single();

      if (profileError) {
        console.error('❌ Failed to create profile:', profileError);
        console.error('Profile error details:', JSON.stringify(profileError, null, 2));
        
        // Try to create the auth.users entry first (if that's the issue)
        console.log('🔧 Attempting to create auth.users entry...');
        const { error: authError } = await supabase.auth.admin.createUser({
          user_id: BULK_UPLOADER_USER_ID,
          email: 'bulk-uploader@system.local',
          password: 'bulk-uploader-system-password-' + Date.now(),
          email_confirm: true
        });
        
        if (authError) {
          console.error('❌ Failed to create auth user:', authError);
        } else {
          console.log('✅ Auth user created, retrying profile creation...');
          
          const { data: retryProfile, error: retryProfileError } = await supabase
            .from('profiles')
            .insert({
              id: BULK_UPLOADER_USER_ID,
              full_name: 'Bulk Uploader Service',
              username: 'bulk_uploader'
            })
            .select()
            .single();
            
          if (retryProfileError) {
            console.error('❌ Failed to create profile on retry:', retryProfileError);
            throw retryProfileError;
          } else {
            console.log('✅ Profile created successfully on retry:', retryProfile);
          }
        }
      } else {
        console.log('✅ Profile created successfully:', newProfile);
      }
    } else {
      console.log('✅ Profile already exists:', existingProfile);
    }

    // Step 2: Create default folders
    console.log('📁 Setting up default folders...');
    
    const defaultFolders = [
      { name: 'Work', description: 'Work-related bookmarks', color: '#3B82F6' },
      { name: 'Personal', description: 'Personal bookmarks', color: '#10B981' },
      { name: 'Learning', description: 'Educational resources', color: '#F59E0B' },
      { name: 'Tools', description: 'Useful tools and utilities', color: '#8B5CF6' },
      { name: 'General', description: 'General bookmarks', color: '#6B7280' }
    ];

    for (const folder of defaultFolders) {
      const { data: existingFolder, error: folderCheckError } = await supabase
        .from('user_bookmark_folders')
        .select('id, name')
        .eq('user_id', BULK_UPLOADER_USER_ID)
        .eq('name', folder.name)
        .single();

      if (!existingFolder) {
        const { data: newFolder, error: folderError } = await supabase
          .from('user_bookmark_folders')
          .insert({
            user_id: BULK_UPLOADER_USER_ID,
            name: folder.name,
            description: folder.description,
            color: folder.color,
            is_system_folder: true
          })
          .select()
          .single();

        if (folderError) {
          console.error(`❌ Failed to create folder "${folder.name}":`, folderError);
        } else {
          console.log(`✅ Created folder: ${newFolder.name} (${newFolder.id})`);
        }
      } else {
        console.log(`✅ Folder already exists: ${existingFolder.name}`);
      }
    }

    // Step 3: Test bookmark creation
    console.log('🧪 Testing bookmark creation...');
    
    const testBookmark = {
      user_id: BULK_UPLOADER_USER_ID,
      title: 'Test Bookmark - Production Setup',
      url: 'https://example.com/test',
      description: 'Test bookmark created during production setup',
      category: 'General',
      tags: ['test', 'setup'],
      ai_category: 'General',
      ai_tags: ['test'],
      link_type: 'web',
      domain: 'example.com'
    };

    const { data: testBookmarkData, error: testBookmarkError } = await supabase
      .from('user_bookmarks')
      .insert(testBookmark)
      .select()
      .single();

    if (testBookmarkError) {
      console.error('❌ Failed to create test bookmark:', testBookmarkError);
      console.error('Test bookmark error details:', JSON.stringify(testBookmarkError, null, 2));
    } else {
      console.log('✅ Test bookmark created successfully:', testBookmarkData);
      
      // Clean up test bookmark
      await supabase
        .from('user_bookmarks')
        .delete()
        .eq('id', testBookmarkData.id);
      console.log('🧹 Test bookmark cleaned up');
    }

    console.log('🎉 Production database setup completed successfully!');
    console.log('🔗 Bulk uploader is now ready to save links to the database');
    
  } catch (error) {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  }
}

setupProductionDatabase(); 