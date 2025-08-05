# Privacy Policy

## GitHub Jira Integration Browser Extension

**Last Updated: December 2024**

### Overview

GitHub Jira Integration is a browser extension that enhances your GitHub experience by displaying Jira ticket information. We are committed to protecting your privacy and being transparent about our data practices.

### Data Collection

This extension does **NOT** collect, store, or transmit any personal data to external servers or third parties. We do not use analytics, telemetry, or any tracking mechanisms.

### Data Storage

The extension stores the following data locally in your browser's secure storage:

#### All Browsers:
- Your Jira domain URL (e.g., `company.atlassian.net`)
- Extension settings and preferences:
  - PR template configuration
  - Acceptance criteria extraction markers
  - Feature toggles (auto-fill PR title/description)

#### Firefox Only:
Due to Firefox's security restrictions on cross-origin cookies, Firefox users must additionally provide:
- Jira account email address
- Jira API token (not your password)

This data is stored using the browser's sync storage API, encrypted by your browser, and is never transmitted to any external servers other than your configured Jira instance.

### Permissions

The extension requires the following permissions:

- **Storage**: To save your settings locally
- **Host permissions for Jira domains**: To fetch ticket information from your Jira instance
- **GitHub access**: To display information on GitHub pages

### Network Requests

The extension makes requests only to:

- Your configured Jira instance (to fetch ticket information)
- GitHub.com (to inject UI elements and read PR information)
- No other external servers or third-party services

### Authentication & Security

#### Chrome/Edge:
- Uses your existing Jira browser session (cookies)
- No credentials are stored by the extension
- You must be logged into Jira in the same browser

#### Firefox:
- Uses API token authentication due to browser restrictions
- Credentials are stored in Firefox's encrypted sync storage
- API tokens are sent only to your configured Jira instance
- We recommend using API tokens with minimal required permissions

### Data Security Best Practices

- All data is stored locally in your browser's secure storage
- API tokens (Firefox) are never logged or exposed in the UI
- All communication with Jira uses HTTPS
- No data is ever sent to third-party servers
- The extension is open source for security auditing

### Data Deletion

You can delete all stored data at any time by:

1. **Removing the extension**: This will delete all associated data
2. **Using browser settings**: Clear extension data through your browser's privacy settings
3. **Through the extension**: Click "Reset to Defaults" in the options page (note: this resets settings but keeps credentials)

For Firefox users who want to remove stored credentials:
- Uninstall and reinstall the extension, or
- Clear Firefox's sync storage for this extension

### User Rights

You have the right to:
- Know what data is stored (see Data Storage section above)
- Delete your data at any time (see Data Deletion section)
- Review the source code to verify our practices
- Fork the project and modify it for your needs

### Changes to This Policy

Any changes to this privacy policy will be reflected in the extension's changelog and repository.

### Contact

If you have any questions about this privacy policy, please open an issue on our [GitHub repository](https://github.com/adaoraul/github-jira-extension/issues).

### Open Source

This extension is open source. You can review the entire source code at: https://github.com/adaoraul/github-jira-extension
