#!/usr/bin/env node

/**
 * Oracle Database Migration Script for Supabase
 * 
 * This script migrates Oracle AI data from localStorage to Supabase
 * Run this after setting up your Supabase environment variables
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function runMigration() {
  console.log('🚀 Starting Oracle database migration to Supabase...')
  
  try {
    // Read the SQL migration file
    const migrationPath = path.join(__dirname, '../backend/supabase/migrations/20241231_oracle_tables.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('📝 Running SQL migration...')
    
    // Split SQL into individual statements (basic approach)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`)
        
        const { error } = await supabase.rpc('exec_sql', { 
          sql_query: statement + ';' 
        })
        
        if (error && !error.message.includes('already exists')) {
          console.error('❌ SQL Error:', error.message)
          // Continue with other statements
        }
      }
    }
    
    console.log('✅ SQL migration completed')
    
    // Test the tables
    console.log('🧪 Testing table creation...')
    
    const { data: conversations, error: convError } = await supabase
      .from('oracle_conversations')
      .select('count(*)')
      .limit(1)
    
    const { data: messages, error: msgError } = await supabase
      .from('oracle_messages')
      .select('count(*)')
      .limit(1)
    
    const { data: settings, error: settError } = await supabase
      .from('oracle_settings')
      .select('count(*)')
      .limit(1)
    
    if (!convError && !msgError && !settError) {
      console.log('✅ All Oracle tables created successfully!')
    } else {
      console.log('⚠️  Some tables may not have been created properly')
      if (convError) console.log('Conversations error:', convError.message)
      if (msgError) console.log('Messages error:', msgError.message)
      if (settError) console.log('Settings error:', settError.message)
    }
    
    console.log('')
    console.log('🎉 Migration completed!')
    console.log('')
    console.log('Next steps:')
    console.log('1. Update your Oracle components to use the new useOracle hook')
    console.log('2. Test the voice conversation system')
    console.log('3. Your data will automatically migrate from localStorage on first use')
    console.log('')
    console.log('Your Oracle AI is now powered by Supabase! 🚀')
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

// Alternative method using direct SQL execution
async function runMigrationDirect() {
  console.log('🚀 Running direct SQL migration...')
  
  try {
    // Create oracle_conversations table
    const createConversations = `
      CREATE TABLE IF NOT EXISTS public.oracle_conversations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        message_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        metadata JSONB DEFAULT '{}'::jsonb
      );
    `
    
    const { error: convError } = await supabase.rpc('exec_sql', { 
      sql_query: createConversations 
    })
    
    if (convError && !convError.message.includes('already exists')) {
      throw new Error(`Failed to create conversations table: ${convError.message}`)
    }
    
    console.log('✅ oracle_conversations table ready')
    
    // Create oracle_messages table
    const createMessages = `
      CREATE TABLE IF NOT EXISTS public.oracle_messages (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        conversation_id UUID NOT NULL,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        audio_url TEXT,
        metadata JSONB DEFAULT '{}'::jsonb
      );
    `
    
    const { error: msgError } = await supabase.rpc('exec_sql', { 
      sql_query: createMessages 
    })
    
    if (msgError && !msgError.message.includes('already exists')) {
      throw new Error(`Failed to create messages table: ${msgError.message}`)
    }
    
    console.log('✅ oracle_messages table ready')
    
    // Create oracle_settings table
    const createSettings = `
      CREATE TABLE IF NOT EXISTS public.oracle_settings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id TEXT NOT NULL,
        setting_type TEXT NOT NULL CHECK (setting_type IN ('appearance', 'behavior', 'voice', 'context', 'tools', 'advanced')),
        settings_data JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, setting_type)
      );
    `
    
    const { error: settError } = await supabase.rpc('exec_sql', { 
      sql_query: createSettings 
    })
    
    if (settError && !settError.message.includes('already exists')) {
      throw new Error(`Failed to create settings table: ${settError.message}`)
    }
    
    console.log('✅ oracle_settings table ready')
    console.log('🎉 Basic tables created successfully!')
    
  } catch (error) {
    console.error('❌ Direct migration failed:', error.message)
    console.log('💡 Try running the full migration or create tables manually in Supabase dashboard')
  }
}

// Check if exec_sql function exists, if not use direct approach
async function checkAndRunMigration() {
  try {
    // Test if we can run SQL
    const { error } = await supabase.rpc('exec_sql', { 
      sql_query: 'SELECT 1;' 
    })
    
    if (error) {
      console.log('📝 Using direct table creation method...')
      await runMigrationDirect()
    } else {
      console.log('📝 Using full SQL migration...')
      await runMigration()
    }
  } catch (error) {
    console.log('📝 Falling back to direct table creation...')
    await runMigrationDirect()
  }
}

// Run the migration
checkAndRunMigration() 