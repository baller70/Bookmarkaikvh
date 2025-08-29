const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createPlaybookTables() {
  console.log('🚀 Creating playbook tables...')
  
  try {
    // Test if tables already exist by trying to query them
    console.log('🔍 Checking if tables exist...')
    
    const { data: existingPlaybooks, error: playbooksError } = await supabase
      .from('user_playbooks')
      .select('id')
      .limit(1)
    
    if (!playbooksError) {
      console.log('✅ Tables already exist and are working!')
      console.log('🎯 Playbook feature is ready to use')
      return
    }
    
    console.log('📋 Tables need to be created manually in Supabase dashboard')
    console.log('🔗 Go to: https://supabase.com/dashboard/project/' + supabaseUrl.split('//')[1].split('.')[0] + '/sql')
    console.log('📄 Copy and paste the SQL from: create-playbooks-direct.sql')
    console.log('')
    console.log('🎯 Once tables are created, the playbook feature will work automatically!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.log('📝 Please create tables manually in Supabase dashboard')
  }
}

createPlaybookTables() 