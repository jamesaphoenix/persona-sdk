#!/bin/bash

# Direct npm publish script
# Usage: NPM_TOKEN=your-token ./publish-to-npm.sh

if [ -z "$NPM_TOKEN" ]; then
    echo "❌ Error: NPM_TOKEN environment variable not set"
    echo "Usage: NPM_TOKEN=your-npm-token ./publish-to-npm.sh"
    exit 1
fi

echo "📦 Publishing @jamesaphoenix/persona-sdk to npm..."

# Navigate to the package directory
cd packages/persona-sdk

# Clean previous builds
echo "🧹 Cleaning previous builds..."
pnpm clean

# Install dependencies
echo "📥 Installing dependencies..."
pnpm install

# Build the package
echo "🔨 Building package..."
pnpm build

# Run tests
echo "🧪 Running tests..."
pnpm test

# Create .npmrc with auth token
echo "🔐 Setting up npm authentication..."
echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > ~/.npmrc

# Publish to npm
echo "🚀 Publishing to npm..."
npm publish --access public

# Clean up
rm ~/.npmrc

echo "✅ Package published successfully!"
echo "📦 View at: https://www.npmjs.com/package/@jamesaphoenix/persona-sdk"
echo ""
echo "To install: npm install @jamesaphoenix/persona-sdk"