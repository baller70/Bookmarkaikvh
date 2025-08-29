#!/usr/bin/env node

/**
 * Setup script to create .env.local with proper configuration
 * Run this to enable persistent storage for user settings
 */

import fs from 'fs';
import path from 'path';

const ENV_CONTENT = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://kljhlubpxxcawacrzaix.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsamhsdWJweHhjYXdhY3J6YWl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2OTk4NzQsImV4cCI6MjA2NDI3NTg3NH0.UFmDwHP641NLtKKAoriM2re4ADcjLpfZhbkUfbmWuK0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsamhsdWJweHhjYXdhY3J6YWl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODY5OTg3NCwiZXhwIjoyMDY0Mjc1ODc0fQ.GXO_NsRI2VtJt0dmkER9DszNpoRyELASZuyKd47-ZQs

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Development Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
DEV_MODE=false
BYPASS_AUTHENTICATION=true
AI_RECOMMENDATIONS_TESTING=false
DEV_USER_ID=48e1b5b9-3b0f-4ccb-8b34-831b1337fc3f

# GitHub Configuration (for tri-store backup)
NEXT_PUBLIC_GH_OWNER=your_github_username
NEXT_PUBLIC_GH_REPO=your_github_repo
NEXT_PUBLIC_GH_BRANCH=main
GITHUB_TOKEN=your_github_token_here

# Storage Configuration
ENABLE_FILE_STORAGE_FALLBACK=true
FILE_STORAGE_PATH=./data

# Comments System Configuration
NEXT_PUBLIC_COMMENTS_ENABLED=true
NEXT_PUBLIC_MENTIONS_ENABLED=true
NEXT_PUBLIC_REACTIONS_ENABLED=true
NEXT_PUBLIC_FILE_ATTACHMENTS_ENABLED=true

# WebSocket Configuration (for real-time updates)
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:3001
WEBSOCKET_PORT=3001

# Notification Configuration
NEXT_PUBLIC_NOTIFICATIONS_ENABLED=true
NOTIFICATIONS_TOPIC=comment-notifications

# File Upload Configuration
NEXT_PUBLIC_MAX_FILE_SIZE=10485760  # 10MB in bytes
NEXT_PUBLIC_ALLOWED_FILE_TYPES=image/*,.pdf,.doc,.docx,.txt
SUPABASE_STORAGE_BUCKET=comment-attachments

# Rate Limiting
COMMENTS_RATE_LIMIT_PER_MINUTE=30
MENTIONS_RATE_LIMIT_PER_MINUTE=60
`;

async function setupEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  try {
    // Check if .env.local already exists
    if (fs.existsSync(envPath)) {
      console.log('⚠️  .env.local already exists. Backing up to .env.local.backup');
      fs.copyFileSync(envPath, envPath + '.backup');
    }
    
    // Write the new .env.local
    fs.writeFileSync(envPath, ENV_CONTENT);
    
    console.log('✅ .env.local created successfully!');
    console.log('📋 Configuration includes:');
    console.log('   - Supabase credentials (primary storage)');
    console.log('   - File storage fallback enabled');
    console.log('   - OpenAI API key (update with your key)');
    console.log('   - Development mode settings');
    console.log('');
    console.log('🔧 Next steps:');
    console.log('   1. Update OPENAI_API_KEY in .env.local with your actual key');
    console.log('   2. (Optional) Set up GitHub token for additional backup');
    console.log('   3. Restart your development server');
    console.log('');
    console.log('✨ Your settings will now persist across sessions!');
    
  } catch (error) {
    console.error('❌ Failed to create .env.local:', error.message);
    console.log('');
    console.log('🛠️  Manual setup:');
    console.log('   1. Create .env.local in your project root');
    console.log('   2. Copy the content from env.example.comments');
    console.log('   3. Add: ENABLE_FILE_STORAGE_FALLBACK=true');
    console.log('   4. Add: FILE_STORAGE_PATH=./data');
  }
}

setupEnv(); 