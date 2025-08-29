#!/usr/bin/env node

/**
 * Environment Setup Script for BookmarkAI
 * 
 * This script helps set up the development environment by:
 * 1. Creating .env.local from .env.example
 * 2. Validating required environment variables
 * 3. Providing setup guidance
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ENV_EXAMPLE_PATH = path.join(process.cwd(), '.env.example');
const ENV_LOCAL_PATH = path.join(process.cwd(), '.env.local');

const REQUIRED_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXTAUTH_SECRET',
  'OPENAI_API_KEY'
];

const RECOMMENDED_VARS = [
  'STRIPE_SECRET_KEY',
  'RESEND_API_KEY',
  'SENTRY_DSN'
];

function generateRandomSecret(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function promptUser(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function setupEnvironment() {
  console.log('🚀 BookmarkAI Environment Setup');
  console.log('================================\n');

  if (!fs.existsSync(ENV_EXAMPLE_PATH)) {
    console.error('❌ .env.example file not found!');
    console.log('Please ensure you are running this script from the project root.');
    process.exit(1);
  }

  if (fs.existsSync(ENV_LOCAL_PATH)) {
    const overwrite = await promptUser('⚠️  .env.local already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }
    
    const backupPath = `${ENV_LOCAL_PATH}.backup.${Date.now()}`;
    fs.copyFileSync(ENV_LOCAL_PATH, backupPath);
    console.log(`📋 Backed up existing .env.local to ${path.basename(backupPath)}`);
  }

  let envContent = fs.readFileSync(ENV_EXAMPLE_PATH, 'utf8');

  console.log('\n🔧 Setting up environment variables...\n');

  const nextAuthSecret = generateRandomSecret(32);
  envContent = envContent.replace('your-nextauth-secret-here', nextAuthSecret);
  console.log('✅ Generated NEXTAUTH_SECRET');

  fs.writeFileSync(ENV_LOCAL_PATH, envContent);

  console.log('\n✅ Created .env.local with default values');
  console.log('\n📝 Next steps:');
  console.log('   1. Update the following REQUIRED variables in .env.local:');
  
  REQUIRED_VARS.forEach(varName => {
    if (varName !== 'NEXTAUTH_SECRET') { // Skip since we auto-generated this
      console.log(`      - ${varName}`);
    }
  });

  console.log('\n   2. Optionally configure these RECOMMENDED variables:');
  RECOMMENDED_VARS.forEach(varName => {
    console.log(`      - ${varName}`);
  });

  console.log('\n   3. Run the application:');
  console.log('      pnpm dev');

  console.log('\n📚 Documentation:');
  console.log('   - Supabase setup: https://supabase.com/docs');
  console.log('   - OpenAI API keys: https://platform.openai.com/api-keys');
  console.log('   - Stripe setup: https://stripe.com/docs');

  rl.close();
}

function validateEnvironment() {
  if (!fs.existsSync(ENV_LOCAL_PATH)) {
    console.error('❌ .env.local not found. Run setup first.');
    return false;
  }

  const envContent = fs.readFileSync(ENV_LOCAL_PATH, 'utf8');
  const missingVars = [];

  REQUIRED_VARS.forEach(varName => {
    const regex = new RegExp(`^${varName}=(.+)$`, 'm');
    const match = envContent.match(regex);
    if (!match || match[1].startsWith('your-') || match[1].trim() === '') {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.error('   -', varName));
    return false;
  }

  console.log('✅ All required environment variables are configured');
  return true;
}

const command = process.argv[2];

if (command === 'validate') {
  validateEnvironment();
} else {
  setupEnvironment();
}

