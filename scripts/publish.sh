#!/bin/bash

# React Guardian Publish Script
echo "🚀 Publishing React Guardian to npm..."

# Check if logged in to npm
if ! npm whoami &> /dev/null; then
    echo "❌ Not logged in to npm. Please run 'npm login' first."
    exit 1
fi

echo "✅ Logged in as: $(npm whoami)"

# Check if package exists
if npm view react-guardian &> /dev/null; then
    echo "⚠️  Package already exists on npm. This will update the version."
    read -p "Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Publishing cancelled."
        exit 1
    fi
fi

# Run pre-publish checks
echo "🔍 Running pre-publish checks..."

# Lint
echo "  - Running linter..."
npm run lint

# Type check
echo "  - Running type check..."
npm run type-check

# Tests
echo "  - Running tests..."
npm test -- --watchAll=false

# Build
echo "  - Building package..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed. dist directory not found."
    exit 1
fi

echo "✅ Pre-publish checks passed!"

# Publish
echo "📦 Publishing to npm..."
npm publish

if [ $? -eq 0 ]; then
    echo "🎉 Successfully published to npm!"
    echo "📦 Package: https://www.npmjs.com/package/react-guardian"
else
    echo "❌ Publishing failed."
    exit 1
fi
