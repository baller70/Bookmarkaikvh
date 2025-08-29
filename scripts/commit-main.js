#!/usr/bin/env node
const { execSync } = require('child_process');

function run(cmd, opts = {}) {
  try {
    const out = execSync(cmd, { stdio: 'pipe', encoding: 'utf8', ...opts });
    process.stdout.write(out || '');
    return out.trim();
  } catch (e) {
    if (e.stdout) process.stdout.write(e.stdout.toString());
    if (e.stderr) process.stderr.write(e.stderr.toString());
    throw e;
  }
}

function tryRun(cmd) {
  try { run(cmd); } catch (_) { /* ignore */ }
}

const message = process.argv.slice(2).join(' ').trim() || `chore: auto-commit to main (${new Date().toISOString()})`;

// Ensure repo
const cwd = process.cwd();
console.log('📦 Repo:', cwd);

// Current branch
const currentBranch = run('git rev-parse --abbrev-ref HEAD');
console.log('🔀 Current branch:', currentBranch);

// Stage and commit local changes (if any)
tryRun('git add -A');
try {
  run(`git commit -m "${message.replace(/"/g, '\\"')}"`);
  console.log('✅ Committed local changes');
} catch {
  console.log('ℹ️  No local changes to commit');
}

// If already on main, just push
if (currentBranch === 'main') {
  tryRun('git fetch origin main');
  run('git push origin main');
  console.log('🚀 Pushed main');
  process.exit(0);
}

// Update main, merge current branch, and push
tryRun('git fetch origin main');
run('git checkout main');
try {
  run('git pull --rebase origin main');
} catch {
  tryRun('git pull origin main');
}
run(`git merge --no-ff ${currentBranch} -m "merge: auto from ${currentBranch}"`);
run('git push origin main');
console.log('🚀 Pushed merged changes to main');

// Switch back
run(`git checkout ${currentBranch}`);
