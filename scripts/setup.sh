#!/bin/bash

# React Guardian Setup Script
echo "🛡️ Setting up React Guardian..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run linting
echo "🔍 Running linter..."
npm run lint

# Run type checking
echo "🔧 Running type check..."
npm run type-check

# Run tests
echo "🧪 Running tests..."
npm test -- --watchAll=false

# Build package
echo "🏗️ Building package..."
npm run build

echo "✅ Setup complete! You can now:"
echo "  - Run 'npm run dev' to start development"
echo "  - Run 'npm test' to run tests"
echo "  - Run 'npm run build' to build the package"
echo "  - Run 'npm publish' to publish to npm (after login)"
