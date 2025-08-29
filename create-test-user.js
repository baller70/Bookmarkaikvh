const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTestUser() {
  try {
    const testUserId = '00000000-0000-0000-0000-000000000001'
    
    // Check if user already exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', testUserId)
      .single()
    
    if (existing) {
      console.log('Test user already exists:', testUserId)
      return testUserId
    }
    
    // Create test user in profiles table
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: testUserId,
          full_name: 'Test User',
          avatar_url: null,
        }
      ])
      .select()
    
    if (error) {
      console.error('Error creating test user:', error)
      return null
    }
    
    console.log('Created test user:', data)
    return testUserId
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}

createTestUser().then(userId => {
  if (userId) {
    console.log('Test user ready:', userId)
  } else {
    console.log('Failed to create test user')
  }
  process.exit(0)
})



