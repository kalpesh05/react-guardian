# GitHub Setup Guide for React Guardian

This guide will help you set up your GitHub repository and publish your React Guardian package to npm.

## 🚀 Step 1: Create GitHub Repository

### Option A: Using GitHub CLI (Recommended)
```bash
# Install GitHub CLI if you haven't already
# https://cli.github.com/

# Create repository
gh repo create react-guardian --public --description "A comprehensive React error boundary and monitoring package with automatic DOM/layout anomaly detection, smart recovery, and event reporting"

# Add remote origin
git remote add origin https://github.com/your-username/react-guardian.git
```

### Option B: Using GitHub Web Interface
1. Go to [GitHub](https://github.com)
2. Click "New repository"
3. Name: `react-guardian`
4. Description: "A comprehensive React error boundary and monitoring package with automatic DOM/layout anomaly detection, smart recovery, and event reporting"
5. Make it public
6. Don't initialize with README (we already have one)

## 🔧 Step 2: Initial Git Setup

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "feat: initial release of React Guardian

- Smart error boundaries with recovery strategies
- Automatic layout monitoring and anomaly detection
- Auto-correct system for white pages and page breaks
- Performance monitoring capabilities
- Comprehensive TypeScript support
- Extensive documentation and examples"

# Add remote origin (replace with your username)
git remote add origin https://github.com/your-username/react-guardian.git

# Push to GitHub
git push -u origin main
```

## 🔑 Step 3: Set Up GitHub Secrets

### For NPM Publishing
1. Go to your repository on GitHub
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Name: `NPM_TOKEN`
5. Value: Your npm access token (get from npmjs.com → Access Tokens)

### For Code Coverage (Optional)
1. Go to [Codecov](https://codecov.io)
2. Sign in with GitHub
3. Add your repository
4. Copy the token and add as `CODECOV_TOKEN` secret

## 🚀 Step 4: First Release

```bash
# Make sure you're logged into npm
npm login

# Run the publish script
chmod +x scripts/publish.sh
./scripts/publish.sh
```

## 📦 Step 5: NPM Publishing

### Prerequisites
1. Create npm account at [npmjs.com](https://npmjs.com)
2. Verify your email
3. Create access token:
   - Go to npmjs.com → Access Tokens
   - Create "Automation" token
   - Copy the token

### Publish to NPM
```bash
# Login to npm
npm login

# Run pre-publish checks
npm run lint
npm run type-check
npm test
npm run build

# Publish (this will create version 1.0.0)
npm publish
```

## 🔄 Step 6: Set Up Automated Publishing

The GitHub Actions workflow will automatically publish to npm when you push to the main branch.

### Manual Publishing
```bash
# Update version
npm version patch  # or minor, major

# Push to GitHub (this triggers automatic publish)
git push origin main --tags
```

## 📊 Step 7: Set Up Repository Features

### 1. Enable Issues and Discussions
- Go to repository Settings
- Scroll to "Features"
- Enable "Issues" and "Discussions"

### 2. Set Up Branch Protection
- Go to Settings → Branches
- Add rule for `main` branch
- Require pull request reviews
- Require status checks to pass

### 3. Add Repository Topics
- Go to repository main page
- Click the gear icon next to "About"
- Add topics: `react`, `error-boundary`, `monitoring`, `typescript`, `npm-package`

## 🏷️ Step 8: Create First Release

```bash
# Create a release
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Or use GitHub CLI
gh release create v1.0.0 --title "v1.0.0" --notes "Initial release of React Guardian"
```

## 📈 Step 9: Monitor and Maintain

### Check Package Status
- Visit your package on npm: `https://www.npmjs.com/package/react-guardian`
- Check download statistics
- Monitor for issues and PRs

### Regular Maintenance
- Update dependencies regularly
- Respond to issues and PRs
- Release new versions as needed
- Update documentation

## 🔧 Troubleshooting

### Common Issues

**GitHub Actions not running:**
- Check if workflows are enabled in repository settings
- Ensure you have the correct permissions

**NPM publish fails:**
- Check if you're logged in: `npm whoami`
- Verify your access token
- Check if package name is available

**Build fails:**
- Check Node.js version in workflow
- Ensure all dependencies are installed
- Check for TypeScript errors

### Getting Help
- Check GitHub Actions logs
- Review npm publish logs
- Check repository issues
- Ask for help in discussions

## 🎉 Success!

Once everything is set up, you should have:
- ✅ GitHub repository with CI/CD
- ✅ NPM package published
- ✅ Automated testing and publishing
- ✅ Comprehensive documentation
- ✅ Issue templates and contribution guidelines

Your React Guardian package is now ready for the world! 🚀
