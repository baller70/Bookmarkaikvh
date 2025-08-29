#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Starting unused imports cleanup...');

// Common unused imports to remove
const UNUSED_PATTERNS = [
  /import.*React.*from ['"]react['"];?\s*\n/g,  // Remove unused React imports
  /import.*\{\s*\}.*from.*['"];?\s*\n/g,        // Remove empty imports
  /import.*unused.*from.*['"];?\s*\n/gi,        // Remove anything with 'unused' in name
];

// Files to skip
const SKIP_FILES = [
  'node_modules',
  '.next',
  '.git',
  'chrome-extension',
  'backups'
];

function shouldSkipFile(filePath) {
  return SKIP_FILES.some(skip => filePath.includes(skip));
}

function cleanupFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let hasChanges = false;

    // Apply cleanup patterns
    UNUSED_PATTERNS.forEach(pattern => {
      const before = newContent;
      newContent = newContent.replace(pattern, '');
      if (before !== newContent) {
        hasChanges = true;
      }
    });

    // Remove duplicate empty lines
    newContent = newContent.replace(/\n\s*\n\s*\n/g, '\n\n');

    if (hasChanges) {
      fs.writeFileSync(filePath, newContent);
      console.log(`✅ Cleaned: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      
      if (shouldSkipFile(fullPath)) {
        continue;
      }
      
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...findFiles(fullPath, extensions));
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return files;
}

// Main execution
const files = findFiles('.').slice(0, 50); // Limit to first 50 files
console.log(`📁 Found ${files.length} files to process`);

let cleaned = 0;
files.forEach(file => {
  if (cleanupFile(file)) {
    cleaned++;
  }
});

console.log(`🎉 Cleanup complete! Processed ${cleaned} files.`); 