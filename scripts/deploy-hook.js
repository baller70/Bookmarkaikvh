#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load .env.local manually so this script has access to the hook URL
try {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach((line) => {
      const m = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
      if (m) {
        const key = m[1];
        const raw = m[2];
        const val = raw.replace(/^['"]|['"]$/g, '');
        if (!process.env[key]) process.env[key] = val;
      }
    });
  }
} catch {}

const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;
if (!hookUrl) {
  console.error('Missing VERCEL_DEPLOY_HOOK_URL. Set it in bookaimark/.env.local');
  process.exit(1);
}

https
  .request(hookUrl, { method: 'POST' }, (res) => {
    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
      console.log('✅ Deploy hook triggered. Status:', res.statusCode);
    } else {
      console.error('❌ Deploy hook failed. Status:', res.statusCode);
    }
    res.resume();
  })
  .on('error', (err) => {
    console.error('❌ Deploy hook error:', err.message);
    process.exit(1);
  })
  .end();
