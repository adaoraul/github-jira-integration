#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Helper function to copy files
function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
}

// Helper function to copy directory
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  }
}

// Main postbuild process
function postbuild() {
  console.log('Running postbuild script...');
  
  // Create directories
  const dirs = [
    'dist/firefox',
    'dist/chrome/icons',
    'dist/chrome/action'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  // Copy PNG files to Chrome directories
  const pngFiles = fs.readdirSync('src/assets').filter(file => file.endsWith('.png'));
  pngFiles.forEach(file => {
    const srcPath = path.join('src/assets', file);
    copyFile(srcPath, path.join('dist/chrome/icons', file));
    copyFile(srcPath, path.join('dist/chrome/action', file));
  });
  
  // Copy Chrome build to Firefox
  copyDir('dist/chrome', 'dist/firefox');
  
  // Copy PNG files to Firefox directories
  pngFiles.forEach(file => {
    const srcPath = path.join('src/assets', file);
    copyFile(srcPath, path.join('dist/firefox/icons', file));
    copyFile(srcPath, path.join('dist/firefox/action', file));
  });
  
  // Replace Chrome manifest with Firefox manifest
  if (fs.existsSync('dist/firefox/manifest.json')) {
    fs.unlinkSync('dist/firefox/manifest.json');
  }
  copyFile('manifest.firefox.json', 'dist/firefox/manifest.json');
  
  // Update Chrome manifest icon paths
  const chromeManifestPath = 'dist/chrome/manifest.json';
  if (fs.existsSync(chromeManifestPath)) {
    let manifestContent = fs.readFileSync(chromeManifestPath, 'utf8');
    manifestContent = manifestContent.replace(/src\/assets\/jira\.png/g, 'icons/jira.png');
    fs.writeFileSync(chromeManifestPath, manifestContent);
  }
  
  console.log('Postbuild completed successfully!');
}

// Run the script
try {
  postbuild();
} catch (error) {
  console.error('Postbuild failed:', error);
  process.exit(1);
}