# NPM Publishing Guide for React Guardian

This guide will help you publish your React Guardian package to npm and maintain it.

## 🚀 Prerequisites

### 1. NPM Account
- Create account at [npmjs.com](https://npmjs.com)
- Verify your email address
- Complete profile information

### 2. NPM Access Token
1. Go to [npmjs.com](https://npmjs.com) → Access Tokens
2. Click "Generate New Token"
3. Select "Automation" type
4. Copy the token (you'll need it for GitHub Actions)

### 3. Package Name Availability
- Check if `react-guardian` is available: `npm view react-guardian`
- If taken, consider alternatives like `@your-org/react-guardian`

## 📦 Publishing Process

### Step 1: Prepare Package

```bash
# Make sure you're in the project directory
cd react-guardian

# Install dependencies
npm install

# Run all checks
npm run lint
npm run type-check
npm test
npm run build
```

### Step 2: Login to NPM

```bash
# Login to npm
npm login

# Verify you're logged in
npm whoami
```

### Step 3: Check Package Configuration

```bash
# Check package.json
npm pack --dry-run

# This will show what files will be included
```

### Step 4: Publish

```bash
# Option 1: Use the publish script
chmod +x scripts/publish.sh
./scripts/publish.sh

# Option 2: Manual publish
npm publish
```

## 🔄 Automated Publishing

### GitHub Actions Setup

1. **Add NPM Token to GitHub Secrets:**
   - Go to your repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Your npm access token

2. **The workflow will automatically:**
   - Run tests and linting
   - Build the package
   - Publish to npm when you push to main branch

### Manual Publishing

```bash
# Update version
npm version patch  # for bug fixes
npm version minor  # for new features
npm version major  # for breaking changes

# Push to GitHub (triggers automatic publish)
git push origin main --tags
```

## 📊 Package Management

### Version Management

```bash
# Check current version
npm version

# Update version
npm version patch   # 1.0.0 → 1.0.1
npm version minor   # 1.0.0 → 1.1.0
npm version major   # 1.0.0 → 2.0.0

# Publish new version
npm publish
```

### Deprecating Versions

```bash
# Deprecate a specific version
npm deprecate react-guardian@1.0.0 "This version has security issues"

# Deprecate a range
npm deprecate "react-guardian@<1.1.0" "Please upgrade to 1.1.0 or later"
```

### Unpublishing

```bash
# Unpublish a version (within 24 hours)
npm unpublish react-guardian@1.0.0

# Unpublish entire package (within 24 hours)
npm unpublish react-guardian --force
```

## 🔍 Package Quality

### NPM Score

Check your package score:
```bash
# Install npm-score globally
npm install -g npm-score

# Check score
npm-score react-guardian
```

### Improving Package Score

1. **Add README.md** ✅ (We have this)
2. **Add keywords** ✅ (We have this)
3. **Add repository URL** ✅ (We have this)
4. **Add homepage** ✅ (We have this)
5. **Add license** ✅ (We have this)
6. **Add description** ✅ (We have this)
7. **Add author** ✅ (We have this)
8. **Add proper files field** ✅ (We have this)

### Package Health

```bash
# Check package health
npm audit

# Fix vulnerabilities
npm audit fix
```

## 📈 Monitoring

### Download Statistics

- Visit your package page: `https://www.npmjs.com/package/react-guardian`
- Check download statistics
- Monitor weekly/monthly downloads

### Package Analytics

```bash
# Install npm-analytics
npm install -g npm-analytics

# Check analytics
npm-analytics react-guardian
```

## 🛠️ Maintenance

### Regular Updates

1. **Dependencies:**
   ```bash
   # Check outdated packages
   npm outdated
   
   # Update dependencies
   npm update
   ```

2. **Security:**
   ```bash
   # Check for vulnerabilities
   npm audit
   
   # Fix vulnerabilities
   npm audit fix
   ```

3. **Documentation:**
   - Keep README.md updated
   - Update examples
   - Add new features to documentation

### Release Process

1. **Development:**
   ```bash
   # Work on feature branch
   git checkout -b feature/new-feature
   # Make changes
   git commit -m "feat: add new feature"
   ```

2. **Testing:**
   ```bash
   # Run tests
   npm test
   npm run lint
   npm run type-check
   ```

3. **Release:**
   ```bash
   # Merge to main
   git checkout main
   git merge feature/new-feature
   
   # Update version
   npm version minor
   
   # Push to GitHub (triggers publish)
   git push origin main --tags
   ```

## 🚨 Troubleshooting

### Common Issues

**"Package already exists":**
```bash
# Check if package exists
npm view react-guardian

# If it exists, you need to update version
npm version patch
npm publish
```

**"Insufficient permissions":**
```bash
# Check if you're logged in
npm whoami

# Login again if needed
npm login
```

**"Package name too similar":**
- Consider using scoped package: `@your-org/react-guardian`
- Or choose a different name

**"Build fails":**
```bash
# Check for TypeScript errors
npm run type-check

# Check for linting errors
npm run lint

# Check if all dependencies are installed
npm install
```

### Getting Help

- Check npm documentation
- Check GitHub Actions logs
- Ask for help in repository issues
- Check npm support

## 🎉 Success!

Once published, your package will be available at:
- **NPM:** `https://www.npmjs.com/package/react-guardian`
- **GitHub:** `https://github.com/your-username/react-guardian`

Users can install it with:
```bash
npm install react-guardian
```

## 📚 Next Steps

1. **Monitor downloads and usage**
2. **Respond to issues and PRs**
3. **Keep documentation updated**
4. **Release new versions regularly**
5. **Engage with the community**

Your React Guardian package is now live on npm! 🚀
