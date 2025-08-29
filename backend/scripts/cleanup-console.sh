#!/bin/bash

# Cleanup Console Statements Script
# This script replaces console.log, console.error, console.warn statements with proper Sentry logging

echo "🧹 Starting console cleanup process..."

# Create backup directory
mkdir -p backups/$(date +%Y%m%d_%H%M%S)

# Files to process (excluding node_modules, .next, .git)
FILES=$(find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | grep -v node_modules | grep -v .next | grep -v .git | grep -v chrome-extension | head -20)

echo "📁 Found $(echo "$FILES" | wc -l) files to process"

# Counter for changes
CHANGES=0

for file in $FILES; do
    # Skip if file doesn't exist or is empty
    if [[ ! -f "$file" || ! -s "$file" ]]; then
        continue
    fi
    
    # Check if file has console statements
    if grep -q "console\." "$file"; then
        echo "🔧 Processing: $file"
        
        # Create backup
        cp "$file" "backups/$(date +%Y%m%d_%H%M%S)/$(basename $file).bak"
        
        # Add logger import if not present and file has console statements
        if ! grep -q "appLogger" "$file"; then
            # Add import after existing imports
            sed -i '' '/^import.*from/a\
import { appLogger } from '\''@/lib/logger'\'';
' "$file" 2>/dev/null || true
        fi
        
        # Replace console.error statements
        sed -i '' 's/console\.error(\([^)]*\))/appLogger.error(\1)/g' "$file" 2>/dev/null || true
        
        # Replace console.warn statements  
        sed -i '' 's/console\.warn(\([^)]*\))/appLogger.warn(\1)/g' "$file" 2>/dev/null || true
        
        # Replace console.log statements (be more careful with these)
        sed -i '' 's/console\.log(\([^)]*\))/appLogger.debug(\1)/g' "$file" 2>/dev/null || true
        
        CHANGES=$((CHANGES + 1))
    fi
done

echo "✅ Processed $CHANGES files with console statements"
echo "🎉 Console cleanup complete!"
echo "📦 Backups stored in: backups/$(date +%Y%m%d_%H%M%S)/" 