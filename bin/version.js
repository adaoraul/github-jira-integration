#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const VERSION_REGEX = /^\d+\.\d+\.\d+$/;

function updateVersion(version) {
  if (!VERSION_REGEX.test(version)) {
    console.error('Invalid version format. Please use semantic versioning (e.g., 1.0.0)');
    process.exit(1);
  }

  // Update package.json
  const packagePath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  packageJson.version = version;
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`✅ Updated package.json to version ${version}`);

  // Update manifest.json (Chrome)
  const chromeManifestPath = path.join(__dirname, '..', 'manifest.json');
  const chromeManifest = JSON.parse(fs.readFileSync(chromeManifestPath, 'utf8'));
  chromeManifest.version = version;
  fs.writeFileSync(chromeManifestPath, JSON.stringify(chromeManifest, null, 2) + '\n');
  console.log(`✅ Updated manifest.json to version ${version}`);

  // Update manifest.firefox.json
  const firefoxManifestPath = path.join(__dirname, '..', 'manifest.firefox.json');
  const firefoxManifest = JSON.parse(fs.readFileSync(firefoxManifestPath, 'utf8'));
  firefoxManifest.version = version;
  fs.writeFileSync(firefoxManifestPath, JSON.stringify(firefoxManifest, null, 2) + '\n');
  console.log(`✅ Updated manifest.firefox.json to version ${version}`);
}

function getCurrentVersion() {
  const packagePath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  return packageJson.version;
}

function bumpVersion(type) {
  const currentVersion = getCurrentVersion();
  const [major, minor, patch] = currentVersion.split('.').map(Number);

  let newVersion;
  switch (type) {
    case 'major':
      newVersion = `${major + 1}.0.0`;
      break;
    case 'minor':
      newVersion = `${major}.${minor + 1}.0`;
      break;
    case 'patch':
      newVersion = `${major}.${minor}.${patch + 1}`;
      break;
    default:
      console.error('Invalid bump type. Use: major, minor, or patch');
      process.exit(1);
  }

  return newVersion;
}

// CLI handling
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  console.log(`
GitHub Jira Integration - Version Management

Usage:
  node scripts/version.js <version>          Set specific version (e.g., 1.2.3)
  node scripts/version.js bump <type>        Bump version (major|minor|patch)
  node scripts/version.js current            Show current version
  node scripts/version.js --help             Show this help

Examples:
  node scripts/version.js 1.0.0
  node scripts/version.js bump patch
  node scripts/version.js current
  `);
  process.exit(0);
}

if (args[0] === 'current') {
  console.log(`Current version: ${getCurrentVersion()}`);
  process.exit(0);
}

if (args[0] === 'bump' && args[1]) {
  const newVersion = bumpVersion(args[1]);
  console.log(`Bumping from ${getCurrentVersion()} to ${newVersion}`);
  updateVersion(newVersion);
  console.log('\n🎉 Version bump complete!');
  console.log(`\nNext steps:`);
  console.log(`  1. Commit changes: git add -A && git commit -m "Bump version to ${newVersion}"`);
  console.log(`  2. Create tag: git tag v${newVersion}`);
  console.log(`  3. Push changes: git push && git push --tags`);
} else if (VERSION_REGEX.test(args[0])) {
  updateVersion(args[0]);
  console.log('\n🎉 Version update complete!');
} else {
  console.error('Invalid command. Use --help for usage information.');
  process.exit(1);
}
