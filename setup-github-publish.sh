#!/bin/bash

# Setup script for GitHub repository and npm publishing

echo "🚀 Setting up jamesaphoenix/persona-sdk repository..."

# Check if gh is authenticated
if ! gh auth status &>/dev/null; then
    echo "❌ GitHub CLI not authenticated. Please run: gh auth login"
    exit 1
fi

# Create the repository if it doesn't exist
echo "📦 Creating GitHub repository..."
gh repo create jamesaphoenix/persona-sdk --public --description "TypeScript SDK for generating personas from statistical distributions" --homepage "https://www.npmjs.com/package/@jamesaphoenix/persona-sdk" || echo "Repository may already exist"

# Add NPM token as secret
echo "🔐 Adding NPM_TOKEN to GitHub secrets..."
echo "Please add your NPM token as a GitHub secret manually or via:"
echo "gh secret set NPM_TOKEN --body \"your-npm-token\" --repo jamesaphoenix/persona-sdk"

# Initialize git if not already done
if [ ! -d .git ]; then
    echo "📝 Initializing git repository..."
    git init
fi

# Add all files
echo "📁 Adding files to git..."
git add .

# Create initial commit
echo "💾 Creating initial commit..."
git commit -m "Initial commit: Persona SDK v0.1.0

- TypeScript SDK for persona generation
- Statistical distributions support
- AI-powered insights with LangChain
- Comprehensive test coverage
- Full TypeDoc documentation"

# Add remote
echo "🔗 Adding remote origin..."
git remote add origin https://github.com/jamesaphoenix/persona-sdk.git || git remote set-url origin https://github.com/jamesaphoenix/persona-sdk.git

# Push to main branch
echo "⬆️ Pushing to GitHub..."
git branch -M main
git push -u origin main --force

echo "✅ Repository setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. The GitHub Actions workflow will automatically run tests"
echo "2. To publish to npm manually, run: cd packages/persona-sdk && npm publish --access public"
echo "3. To trigger automated publishing, create a release on GitHub"
echo ""
echo "🔗 Repository: https://github.com/jamesaphoenix/persona-sdk"
echo "📦 NPM Package: https://www.npmjs.com/package/@jamesaphoenix/persona-sdk"