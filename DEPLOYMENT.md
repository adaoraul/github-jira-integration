# Deployment Guide

This guide explains how to deploy the GitHub Jira Integration extension to Chrome Web Store and Firefox Add-ons.

## Prerequisites

- Node.js 18.x or 20.x
- npm
- Git
- GitHub repository with Actions enabled
- Store developer accounts (Chrome/Firefox)

## Version Management

### Check Current Version
```bash
npm run version:current
```

### Bump Version
```bash
# Patch release (1.0.0 → 1.0.1)
npm run version:bump:patch

# Minor release (1.0.0 → 1.1.0)
npm run version:bump:minor

# Major release (1.0.0 → 2.0.0)
npm run version:bump:major

# Set specific version
npm run version:set 1.2.3
```

## Local Build

```bash
# Install dependencies
npm install

# Run all checks
npm run check

# Build extensions
npm run build
```

## Automated Deployment

### 1. Create a Release

```bash
# After bumping version
git add -A
git commit -m "Bump version to 1.0.1"
git tag v1.0.1
git push origin main
git push origin v1.0.1
```

This triggers the `release.yml` workflow which:
- Builds both extensions
- Creates a GitHub release
- Uploads packaged extensions
- Publishes to stores (if configured)

### 2. Manual Deployment

Use the GitHub Actions UI:
1. Go to Actions tab
2. Select "Manual Store Publish"
3. Click "Run workflow"
4. Select target and version

## Store Configuration

### Chrome Web Store Setup

1. **Create Developer Account**
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard)
   - Pay one-time $5 fee

2. **First-time Setup**
   - Create new item
   - Upload initial ZIP manually
   - Fill in store listing details
   - Submit for review

3. **API Setup** (for automation)
   - Enable Chrome Web Store API in Google Cloud Console
   - Create OAuth 2.0 credentials
   - Add secrets to GitHub:
     - `CHROME_EXTENSION_ID`
     - `CHROME_CLIENT_ID`
     - `CHROME_CLIENT_SECRET`
     - `CHROME_REFRESH_TOKEN`

### Firefox Add-ons Setup

1. **Create Developer Account**
   - Go to [Firefox Add-ons Developer Hub](https://addons.mozilla.org/developers/)
   - Create account (free)

2. **First-time Setup**
   - Submit new add-on
   - Upload initial ZIP
   - Fill in listing details
   - Submit for review

3. **API Setup** (for automation)
   - Generate API credentials
   - Add secrets to GitHub:
     - `FIREFOX_API_KEY`
     - `FIREFOX_API_SECRET`

## Manual Store Submission

If automated publishing isn't configured:

### Chrome
1. Build: `npm run build`
2. Package: `cd dist/chrome && zip -r ../chrome-extension.zip .`
3. Upload to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard)

### Firefox
1. Build: `npm run build`
2. Package: `cd dist/firefox && zip -r ../firefox-extension.zip .`
3. Upload to [Firefox Add-ons Developer Hub](https://addons.mozilla.org/developers/)

## Review Process

### Chrome Web Store
- Review time: 1-3 business days
- Common issues:
  - Missing privacy policy
  - Unclear permissions justification
  - Policy violations

### Firefox Add-ons
- Review time: Usually within 24 hours
- Common issues:
  - Missing source code (if minified)
  - Security concerns
  - API usage violations

## Post-Deployment

1. **Monitor Reviews**
   - Check store dashboards
   - Respond to user feedback
   - Monitor crash reports

2. **Update Store Listings**
   - Screenshots
   - Description
   - Promotional images

3. **Announce Release**
   - GitHub release notes
   - Social media
   - User documentation

## Rollback

If issues are found:

1. **Immediate Action**
   - Unpublish from stores if critical
   - Create hotfix branch

2. **Fix and Re-deploy**
   ```bash
   git checkout -b hotfix/1.0.2
   # Make fixes
   npm run version:bump:patch
   git add -A
   git commit -m "Fix: critical bug"
   git tag v1.0.2
   git push origin hotfix/1.0.2
   git push origin v1.0.2
   ```

## Troubleshooting

### Build Failures
- Check Node.js version
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall

### Store Rejections
- Review store policies
- Check permissions justification
- Ensure privacy policy is accessible

### API Credential Issues
- Regenerate tokens if expired
- Check secret names in GitHub
- Verify API is enabled in console