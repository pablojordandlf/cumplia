#!/bin/bash

# Script for pre-deploy checks

echo "Running pre-deploy checks..."

# 1. Linting (assuming ESLint is configured)
echo "Running ESLint..."
npm run lint --workspace apps/web # Adjust command if linting is done elsewhere or with a different command

# 2. Type-checking (assuming TypeScript)
echo "Running TypeScript type check..."
npm run typecheck --workspace apps/web # Adjust command if type-checking is done differently

# 3. Running tests (assuming Jest or similar is configured)
echo "Running tests..."
npm run test --workspace apps/web # Adjust command if tests are run differently

echo "Pre-deploy checks completed."
exit 0 # Exit with success
