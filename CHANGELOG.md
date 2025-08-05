# Changelog

All notable changes to the GitHub Jira Integration extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-08-04

### Added

- Initial release of GitHub Jira Integration as a cross-browser extension
- Built with Extension.js framework for Chrome, Firefox, and Edge compatibility
- Automatic detection of Jira ticket numbers in PR titles and branch names
- Display of Jira ticket information directly in GitHub pull requests
- Auto-fill PR templates with Jira ticket details
- Extraction and formatting of acceptance criteria from Jira tickets
- Browser action popup with connection status and quick settings access
- Options page for configuring Jira URL and PR templates
- Support for both Manifest V2 (Firefox) and Manifest V3 (Chrome/Edge)
- Modern ES6+ JavaScript implementation
- Responsive design that matches GitHub's UI

### Security

- No external data collection or analytics
- All data stored locally in browser storage
- Uses existing browser session for Jira authentication
- No credentials stored by the extension

### Technical

- Zero-configuration setup with Extension.js
- Hot reload in development mode
- Optimized production builds
- Cross-browser API compatibility layer
- Clean modular architecture

### Browser Support

- Chrome 88+
- Firefox 57+
- Microsoft Edge 88+
