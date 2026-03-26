#!/bin/bash
# Cleanup Validation Script
# Run this after cleanup to verify no regressions

set -e

echo "🔍 VALIDATING CLEANUP CHANGES..."
echo "================================"

# 1. Check no console.log remains
echo -e "\n1️⃣  Checking for console.log/debug..."
CONSOLE_COUNT=$(grep -r "console\.log\|console\.debug" apps/web --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l)
if [ $CONSOLE_COUNT -eq 0 ]; then
  echo "✅ No console.log statements found"
else
  echo "⚠️  Found $CONSOLE_COUNT console.log statements:"
  grep -r "console\.log\|console\.debug" apps/web --include="*.tsx" --include="*.ts" 2>/dev/null | head -5
fi

# 2. Check imports structure
echo -e "\n2️⃣  Checking imports structure..."
DEEP_IMPORTS=$(grep -r "from.*\.\./\.\./\.\." apps/web --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l)
if [ $DEEP_IMPORTS -eq 0 ]; then
  echo "✅ No deep relative imports (../../..) found"
else
  echo "⚠️  Found $DEEP_IMPORTS deep imports"
fi

# 3. List deleted files
echo -e "\n3️⃣  Deleted files:"
git status --porcelain | grep "^D " | head -10

# 4. List added files
echo -e "\n4️⃣  Added/Modified files:"
git status --porcelain | grep -v "^D " | head -15

# 5. Check TypeScript compilation (if node_modules exists)
if [ -d "apps/web/node_modules" ]; then
  echo -e "\n5️⃣  TypeScript compilation check..."
  cd apps/web
  npm run build 2>&1 | tail -10
  cd ../..
else
  echo -e "\n5️⃣  ⚠️  node_modules not found - install deps to validate compilation"
fi

echo -e "\n================================"
echo "✅ VALIDATION COMPLETE"
echo ""
echo "Next steps:"
echo "  1. Review changes: git diff"
echo "  2. Install deps: npm install (in apps/web)"
echo "  3. Run tests: npm run test:ci"
echo "  4. Commit: git commit -m 'chore: cleanup code and consolidate references'"
