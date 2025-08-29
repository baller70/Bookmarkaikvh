#!/usr/bin/env node
/*
  Sync root app/ tree into apps/web/app/ so edits under app/ are reflected in the deployed app.
  - Copies files/directories recursively
  - Skips node_modules, .next, .git
  - Overwrites destination files
*/
import fs from 'fs'
import path from 'path'

const repoRoot = process.cwd()
const srcDir = path.join(repoRoot, 'app')
const destDir = path.join(repoRoot, 'apps', 'web', 'app')

const IGNORE = new Set(['node_modules', '.next', '.git'])

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true })
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    const base = path.basename(src)
    if (IGNORE.has(base)) return
    ensureDir(dest)
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry))
    }
  } else {
    ensureDir(path.dirname(dest))
    fs.copyFileSync(src, dest)
  }
}

if (!fs.existsSync(srcDir)) {
  console.error('No root app/ directory found to sync.')
  process.exit(0)
}

console.log(`[sync-app] Copying ${srcDir} -> ${destDir}`)
copyRecursive(srcDir, destDir)
console.log('[sync-app] Done.')


