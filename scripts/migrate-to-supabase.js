#!/usr/bin/env node

/**
 * BookAIMark Database Migration Script
 * Migrates data from file-based storage to Supabase
 */

const fs = require('fs').promises
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Configuration
const config = {
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  dataDir: path.join(__dirname, '..', 'data'),
  appsDataDir: path.join(__dirname, '..', 'apps', 'web', 'data'),
  backupDir: path.join(__dirname, '..', 'backups'),
  batchSize: 100, // Process records in batches
}

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

// Logging functions
const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
  header: (msg) => console.log(`${colors.cyan}${colors.bright}=== ${msg} ===${colors.reset}`),
}

// Initialize Supabase client
let supabase = null

async function initializeSupabase() {
  if (!config.supabaseUrl || !config.supabaseKey) {
    throw new Error('Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.')
  }
  
  supabase = createClient(config.supabaseUrl, config.supabaseKey)
  log.info('Supabase client initialized')
}

// Create backup of existing data
async function createBackup() {
  log.header('Creating Data Backup')
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupPath = path.join(config.backupDir, `backup-${timestamp}`)
  
  try {
    await fs.mkdir(backupPath, { recursive: true })
    
    // Backup main data directory
    if (await fileExists(config.dataDir)) {
      await copyDirectory(config.dataDir, path.join(backupPath, 'data'))
    }
    
    // Backup apps data directory
    if (await fileExists(config.appsDataDir)) {
      await copyDirectory(config.appsDataDir, path.join(backupPath, 'apps-data'))
    }
    
    log.success(`Backup created at: ${backupPath}`)
    return backupPath
  } catch (error) {
    log.error(`Failed to create backup: ${error.message}`)
    throw error
  }
}

// Utility functions
async function fileExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function copyDirectory(src, dest) {
  await fs.mkdir(dest, { recursive: true })
  const entries = await fs.readdir(src, { withFileTypes: true })
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    
    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath)
    } else {
      await fs.copyFile(srcPath, destPath)
    }
  }
}

async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    log.warning(`Could not read ${filePath}: ${error.message}`)
    return null
  }
}

// Database schema creation
async function createTables() {
  log.header('Creating Database Tables')
  
  const schemas = [
    {
      name: 'users',
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255),
          avatar_url TEXT,
          provider VARCHAR(50),
          provider_id VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider, provider_id);
      `
    },
    {
      name: 'bookmarks',
      sql: `
        CREATE TABLE IF NOT EXISTS bookmarks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(500) NOT NULL,
          url TEXT NOT NULL,
          description TEXT,
          category VARCHAR(100),
          tags TEXT[],
          notes TEXT,
          ai_summary TEXT,
          ai_tags TEXT[],
          ai_category VARCHAR(100),
          is_favorite BOOLEAN DEFAULT FALSE,
          site_health VARCHAR(20),
          last_health_check TIMESTAMP WITH TIME ZONE,
          health_check_count INTEGER DEFAULT 0,
          visit_count INTEGER DEFAULT 0,
          last_visited TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
        CREATE INDEX IF NOT EXISTS idx_bookmarks_category ON bookmarks(category);
        CREATE INDEX IF NOT EXISTS idx_bookmarks_tags ON bookmarks USING GIN(tags);
        CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON bookmarks(created_at);
        CREATE INDEX IF NOT EXISTS idx_bookmarks_url ON bookmarks(url);
      `
    },
    {
      name: 'ai_processing_jobs',
      sql: `
        CREATE TABLE IF NOT EXISTS ai_processing_jobs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          bookmark_id UUID REFERENCES bookmarks(id) ON DELETE CASCADE,
          job_type VARCHAR(50) NOT NULL,
          status VARCHAR(20) DEFAULT 'pending',
          input_data JSONB,
          result JSONB,
          error_message TEXT,
          processing_time_ms INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_ai_jobs_user_id ON ai_processing_jobs(user_id);
        CREATE INDEX IF NOT EXISTS idx_ai_jobs_bookmark_id ON ai_processing_jobs(bookmark_id);
        CREATE INDEX IF NOT EXISTS idx_ai_jobs_status ON ai_processing_jobs(status);
        CREATE INDEX IF NOT EXISTS idx_ai_jobs_type ON ai_processing_jobs(job_type);
      `
    },
    {
      name: 'analytics',
      sql: `
        CREATE TABLE IF NOT EXISTS analytics (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          bookmark_id UUID REFERENCES bookmarks(id) ON DELETE CASCADE,
          event_type VARCHAR(50) NOT NULL,
          event_data JSONB,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          session_id VARCHAR(255),
          user_agent TEXT,
          ip_address INET
        );
        
        CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
        CREATE INDEX IF NOT EXISTS idx_analytics_bookmark_id ON analytics(bookmark_id);
        CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
        CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics(timestamp);
        CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON analytics(session_id);
      `
    },
    {
      name: 'user_preferences',
      sql: `
        CREATE TABLE IF NOT EXISTS user_preferences (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          preferences JSONB NOT NULL DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE UNIQUE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
      `
    }
  ]
  
  for (const schema of schemas) {
    try {
      log.info(`Creating table: ${schema.name}`)
      const { error } = await supabase.rpc('exec_sql', { sql: schema.sql })
      
      if (error) {
        log.error(`Failed to create table ${schema.name}: ${error.message}`)
        throw error
      }
      
      log.success(`Table ${schema.name} created successfully`)
    } catch (error) {
      log.error(`Error creating table ${schema.name}: ${error.message}`)
      throw error
    }
  }
}

// Data migration functions
async function migrateUsers() {
  log.header('Migrating Users')
  
  // Create default user for existing bookmarks
  const defaultUser = {
    id: 'dev-user-123',
    email: 'dev@bookaimark.com',
    name: 'Development User',
    provider: 'development',
    provider_id: 'dev-123'
  }
  
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert([defaultUser])
      .select()
    
    if (error) {
      log.error(`Failed to create default user: ${error.message}`)
      throw error
    }
    
    log.success(`Default user created: ${data[0].email}`)
    return data[0]
  } catch (error) {
    log.error(`Error migrating users: ${error.message}`)
    throw error
  }
}

async function migrateBookmarks() {
  log.header('Migrating Bookmarks')
  
  const bookmarkSources = [
    path.join(config.dataDir, 'bookmarks.json'),
    path.join(config.appsDataDir, 'bookmarks.json'),
  ]
  
  let allBookmarks = []
  
  // Read bookmarks from all sources
  for (const source of bookmarkSources) {
    const bookmarks = await readJsonFile(source)
    if (bookmarks && Array.isArray(bookmarks)) {
      allBookmarks = allBookmarks.concat(bookmarks)
      log.info(`Found ${bookmarks.length} bookmarks in ${source}`)
    }
  }
  
  if (allBookmarks.length === 0) {
    log.warning('No bookmarks found to migrate')
    return
  }
  
  // Remove duplicates based on URL
  const uniqueBookmarks = allBookmarks.reduce((acc, bookmark) => {
    if (!acc.find(b => b.url === bookmark.url)) {
      acc.push(bookmark)
    }
    return acc
  }, [])
  
  log.info(`Migrating ${uniqueBookmarks.length} unique bookmarks`)
  
  // Transform bookmarks for Supabase
  const transformedBookmarks = uniqueBookmarks.map(bookmark => ({
    user_id: bookmark.user_id || 'dev-user-123',
    title: bookmark.title || 'Untitled',
    url: bookmark.url,
    description: bookmark.description || null,
    category: bookmark.category || null,
    tags: bookmark.tags || [],
    notes: bookmark.notes || null,
    ai_summary: bookmark.ai_summary || null,
    ai_tags: bookmark.ai_tags || [],
    ai_category: bookmark.ai_category || null,
    is_favorite: bookmark.is_favorite || false,
    site_health: bookmark.site_health || null,
    last_health_check: bookmark.last_health_check || null,
    health_check_count: bookmark.healthCheckCount || 0,
    visit_count: bookmark.visitCount || 0,
    last_visited: bookmark.lastVisited || null,
    created_at: bookmark.created_at || new Date().toISOString(),
    updated_at: bookmark.updated_at || new Date().toISOString(),
  }))
  
  // Insert bookmarks in batches
  let insertedCount = 0
  for (let i = 0; i < transformedBookmarks.length; i += config.batchSize) {
    const batch = transformedBookmarks.slice(i, i + config.batchSize)
    
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .insert(batch)
        .select('id')
      
      if (error) {
        log.error(`Failed to insert bookmark batch: ${error.message}`)
        throw error
      }
      
      insertedCount += data.length
      log.info(`Inserted ${insertedCount}/${transformedBookmarks.length} bookmarks`)
    } catch (error) {
      log.error(`Error inserting bookmark batch: ${error.message}`)
      throw error
    }
  }
  
  log.success(`Successfully migrated ${insertedCount} bookmarks`)
}

async function migrateAnalytics() {
  log.header('Migrating Analytics')
  
  const analyticsSources = [
    path.join(config.dataDir, 'analytics.json'),
    path.join(config.appsDataDir, 'analytics.json'),
  ]
  
  let allAnalytics = []
  
  // Read analytics from all sources
  for (const source of analyticsSources) {
    const analytics = await readJsonFile(source)
    if (analytics) {
      // Handle different analytics formats
      if (Array.isArray(analytics)) {
        allAnalytics = allAnalytics.concat(analytics)
      } else if (typeof analytics === 'object') {
        // Convert object format to array
        const analyticsArray = Object.entries(analytics).map(([key, value]) => ({
          id: key,
          ...value
        }))
        allAnalytics = allAnalytics.concat(analyticsArray)
      }
      log.info(`Found analytics data in ${source}`)
    }
  }
  
  if (allAnalytics.length === 0) {
    log.warning('No analytics data found to migrate')
    return
  }
  
  log.info(`Migrating ${allAnalytics.length} analytics records`)
  
  // Transform analytics for Supabase
  const transformedAnalytics = allAnalytics.map(record => ({
    user_id: record.user_id || 'dev-user-123',
    bookmark_id: record.bookmark_id || null,
    event_type: record.event_type || 'visit',
    event_data: record.event_data || record,
    timestamp: record.timestamp || record.created_at || new Date().toISOString(),
    session_id: record.session_id || null,
  }))
  
  // Insert analytics in batches
  let insertedCount = 0
  for (let i = 0; i < transformedAnalytics.length; i += config.batchSize) {
    const batch = transformedAnalytics.slice(i, i + config.batchSize)
    
    try {
      const { data, error } = await supabase
        .from('analytics')
        .insert(batch)
        .select('id')
      
      if (error) {
        log.error(`Failed to insert analytics batch: ${error.message}`)
        throw error
      }
      
      insertedCount += data.length
      log.info(`Inserted ${insertedCount}/${transformedAnalytics.length} analytics records`)
    } catch (error) {
      log.error(`Error inserting analytics batch: ${error.message}`)
      throw error
    }
  }
  
  log.success(`Successfully migrated ${insertedCount} analytics records`)
}

// Verification functions
async function verifyMigration() {
  log.header('Verifying Migration')
  
  try {
    // Check users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email')
    
    if (usersError) throw usersError
    log.info(`✓ Users table: ${users.length} records`)
    
    // Check bookmarks
    const { data: bookmarks, error: bookmarksError } = await supabase
      .from('bookmarks')
      .select('id, title, user_id')
    
    if (bookmarksError) throw bookmarksError
    log.info(`✓ Bookmarks table: ${bookmarks.length} records`)
    
    // Check analytics
    const { data: analytics, error: analyticsError } = await supabase
      .from('analytics')
      .select('id, event_type')
    
    if (analyticsError) throw analyticsError
    log.info(`✓ Analytics table: ${analytics.length} records`)
    
    // Verify relationships
    const bookmarksWithUsers = bookmarks.filter(b => b.user_id)
    log.info(`✓ Bookmarks with user relationships: ${bookmarksWithUsers.length}`)
    
    log.success('Migration verification completed successfully')
    
    return {
      users: users.length,
      bookmarks: bookmarks.length,
      analytics: analytics.length,
    }
  } catch (error) {
    log.error(`Verification failed: ${error.message}`)
    throw error
  }
}

// Main migration function
async function runMigration() {
  try {
    log.header('BookAIMark Database Migration')
    log.info('Starting migration from file-based storage to Supabase')
    
    // Initialize
    await initializeSupabase()
    
    // Create backup
    const backupPath = await createBackup()
    
    // Create database schema
    await createTables()
    
    // Migrate data
    await migrateUsers()
    await migrateBookmarks()
    await migrateAnalytics()
    
    // Verify migration
    const stats = await verifyMigration()
    
    log.header('Migration Summary')
    log.success(`✓ Users migrated: ${stats.users}`)
    log.success(`✓ Bookmarks migrated: ${stats.bookmarks}`)
    log.success(`✓ Analytics records migrated: ${stats.analytics}`)
    log.success(`✓ Backup created at: ${backupPath}`)
    
    log.header('Next Steps')
    log.info('1. Update your application configuration to use Supabase')
    log.info('2. Test the application with the new database')
    log.info('3. Update environment variables in production')
    log.info('4. Archive or remove file-based data after verification')
    
    log.success('Migration completed successfully! 🎉')
    
  } catch (error) {
    log.error(`Migration failed: ${error.message}`)
    log.error('Please check the error above and retry the migration')
    process.exit(1)
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration()
}

module.exports = {
  runMigration,
  createBackup,
  createTables,
  migrateUsers,
  migrateBookmarks,
  migrateAnalytics,
  verifyMigration,
} 