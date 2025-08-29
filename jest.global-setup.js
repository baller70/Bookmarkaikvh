// Jest global setup - runs once before all tests
module.exports = async () => {
  console.log('🚀 Starting BookAIMark test suite...')
  
  // Set global test environment variables
  process.env.NODE_ENV = 'test'
  process.env.NEXT_TELEMETRY_DISABLED = '1'
  process.env.CI = 'true'
  
  // Mock API keys for testing
  process.env.OPENAI_API_KEY = 'test-openai-key'
  process.env.STRIPE_SECRET_KEY = 'test-stripe-key'
  process.env.SUPABASE_URL = 'https://test.supabase.co'
  process.env.SUPABASE_ANON_KEY = 'test-supabase-key'
  
  // Create test data directory if it doesn't exist
  const fs = require('fs')
  const path = require('path')
  
  const testDataDir = path.join(__dirname, 'test-data')
  if (!fs.existsSync(testDataDir)) {
    fs.mkdirSync(testDataDir, { recursive: true })
  }
  
  // Create test bookmark data
  const testBookmarks = [
    {
      id: 1,
      title: 'Test Bookmark 1',
      url: 'https://example.com/1',
      description: 'Test description 1',
      category: 'Technology',
      tags: ['test', 'bookmark'],
      user_id: 'test-user-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      title: 'Test Bookmark 2',
      url: 'https://example.com/2',
      description: 'Test description 2',
      category: 'Development',
      tags: ['test', 'development'],
      user_id: 'test-user-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]
  
  fs.writeFileSync(
    path.join(testDataDir, 'bookmarks.json'),
    JSON.stringify(testBookmarks, null, 2)
  )
  
  console.log('✅ Test environment initialized')
} 