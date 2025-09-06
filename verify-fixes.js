#!/usr/bin/env node

/**
 * Verification script to confirm all fixes are working
 * Run this before deployment to ensure everything is ready
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying All Fixes Are Complete...\n');

const checks = [];

// Check 1: Favicon utilities exist
console.log('1. 📸 Checking favicon utilities...');
const faviconUtilsPath = path.join(__dirname, 'apps/web/lib/favicon-utils.ts');
if (fs.existsSync(faviconUtilsPath)) {
  const content = fs.readFileSync(faviconUtilsPath, 'utf8');
  if (content.includes('getFaviconUrl') && content.includes('handleFaviconError')) {
    console.log('   ✅ Favicon utilities implemented');
    checks.push(true);
  } else {
    console.log('   ❌ Favicon utilities incomplete');
    checks.push(false);
  }
} else {
  console.log('   ❌ Favicon utilities file missing');
  checks.push(false);
}

// Check 2: Mobile breakpoints in Tailwind config
console.log('\n2. 📱 Checking mobile breakpoints...');
const tailwindConfigPath = path.join(__dirname, 'apps/web/tailwind.config.js');
if (fs.existsSync(tailwindConfigPath)) {
  const content = fs.readFileSync(tailwindConfigPath, 'utf8');
  if (content.includes("'xs': '375px'")) {
    console.log('   ✅ Mobile breakpoints configured');
    checks.push(true);
  } else {
    console.log('   ❌ Mobile breakpoints missing');
    checks.push(false);
  }
} else {
  console.log('   ❌ Tailwind config file missing');
  checks.push(false);
}

// Check 3: Search API Supabase integration
console.log('\n3. 🔍 Checking search API integration...');
const searchApiPath = path.join(__dirname, 'apps/web/app/api/bookmarks/search/route.ts');
if (fs.existsSync(searchApiPath)) {
  const content = fs.readFileSync(searchApiPath, 'utf8');
  if (content.includes('createClient') && content.includes('USE_SUPABASE')) {
    console.log('   ✅ Search API has Supabase integration');
    checks.push(true);
  } else {
    console.log('   ❌ Search API missing Supabase integration');
    checks.push(false);
  }
} else {
  console.log('   ❌ Search API file missing');
  checks.push(false);
}

// Check 4: Dashboard search integration
console.log('\n4. 🎯 Checking dashboard search integration...');
const dashboardPath = path.join(__dirname, 'apps/web/app/dashboard/DashboardClient.tsx');
if (fs.existsSync(dashboardPath)) {
  const content = fs.readFileSync(dashboardPath, 'utf8');
  if (content.includes('performSearch') && content.includes('/api/bookmarks/search')) {
    console.log('   ✅ Dashboard has search API integration');
    checks.push(true);
  } else {
    console.log('   ❌ Dashboard missing search API integration');
    checks.push(false);
  }
} else {
  console.log('   ❌ Dashboard client file missing');
  checks.push(false);
}

// Check 5: Build configuration
console.log('\n5. 🏗️ Checking build configuration...');
const packageJsonPath = path.join(__dirname, 'apps/web/package.json');
if (fs.existsSync(packageJsonPath)) {
  const content = fs.readFileSync(packageJsonPath, 'utf8');
  const packageJson = JSON.parse(content);
  if (packageJson.scripts && packageJson.scripts.build === 'next build') {
    console.log('   ✅ Build script configured correctly');
    checks.push(true);
  } else {
    console.log('   ❌ Build script missing or incorrect');
    checks.push(false);
  }
} else {
  console.log('   ❌ Package.json file missing');
  checks.push(false);
}

// Check 6: Vercel configuration
console.log('\n6. 🚀 Checking Vercel configuration...');
const vercelJsonPath = path.join(__dirname, 'vercel.json');
if (fs.existsSync(vercelJsonPath)) {
  const content = fs.readFileSync(vercelJsonPath, 'utf8');
  if (content.includes('buildCommand') && content.includes('apps/web')) {
    console.log('   ✅ Vercel configuration present');
    checks.push(true);
  } else {
    console.log('   ❌ Vercel configuration incomplete');
    checks.push(false);
  }
} else {
  console.log('   ❌ Vercel configuration file missing');
  checks.push(false);
}

// Check 7: Deployment scripts
console.log('\n7. 📜 Checking deployment scripts...');
const deployScriptPath = path.join(__dirname, 'deploy-to-vercel.sh');
if (fs.existsSync(deployScriptPath)) {
  console.log('   ✅ Deployment script available');
  checks.push(true);
} else {
  console.log('   ❌ Deployment script missing');
  checks.push(false);
}

// Check 8: Environment configuration
console.log('\n8. 🔧 Checking environment configuration...');
const envExamplePath = path.join(__dirname, '.env.example');
if (fs.existsSync(envExamplePath)) {
  const content = fs.readFileSync(envExamplePath, 'utf8');
  if (content.includes('NEXT_PUBLIC_SUPABASE_URL') && content.includes('SUPABASE_SERVICE_ROLE_KEY')) {
    console.log('   ✅ Environment variables documented');
    checks.push(true);
  } else {
    console.log('   ❌ Environment variables incomplete');
    checks.push(false);
  }
} else {
  console.log('   ❌ Environment example file missing');
  checks.push(false);
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 VERIFICATION SUMMARY');
console.log('='.repeat(50));

const passedChecks = checks.filter(Boolean).length;
const totalChecks = checks.length;
const percentage = Math.round((passedChecks / totalChecks) * 100);

console.log(`✅ Passed: ${passedChecks}/${totalChecks} checks (${percentage}%)`);

if (passedChecks === totalChecks) {
  console.log('\n🎉 ALL FIXES VERIFIED - READY FOR DEPLOYMENT!');
  console.log('\n🚀 Next steps:');
  console.log('   1. Run: ./deploy-to-vercel.sh');
  console.log('   2. Configure environment variables in Vercel');
  console.log('   3. Test the deployed application');
  console.log('\n✨ Your BookmarkHub is ready to go live!');
  process.exit(0);
} else {
  console.log('\n⚠️  Some issues need attention before deployment');
  console.log('\n🔧 Please review the failed checks above and fix them');
  console.log('   Then run this script again to verify');
  process.exit(1);
}
