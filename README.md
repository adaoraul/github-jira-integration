# GitHub Jira Integration - Cross-Browser Extension

A browser extension that shows contents of linked Jira tasks directly in GitHub. Built with Extension.js for cross-browser compatibility.

## Features

- 🔗 **Automatic Detection** - Finds Jira ticket numbers (e.g., PROJ-123) in PR titles, branch names, and page titles
- 📋 **Rich Ticket Display** - Shows ticket status, title, reporter, and assignee in a clean card UI
- 📝 **Smart PR Templates** - Auto-fills PR descriptions with ticket info and acceptance criteria
- 🎯 **Acceptance Criteria** - Extracts and formats acceptance criteria from Jira descriptions
- 🌐 **Cross-Browser** - Works with Chrome, Firefox, and Edge
- 🔒 **Secure** - Credentials stored locally in browser's secure storage
- 🎨 **Modern UI** - Built with React and shadcn/ui components
- ⚡ **Fast** - Instant ticket information with efficient caching

## Installation

### Development

1. Clone this repository:

```bash
git clone https://github.com/adaoraul/github-jira-extension.git
cd github-jira-extension
```

2. Install dependencies:

```bash
npm install
```

3. Run in development mode:

```bash
# For Chrome
npm run dev

# For Firefox
npm run dev -- --browser=firefox

# For Edge
npm run dev -- --browser=edge
```

### Building for Production

```bash
# Build for all browsers
npm run build

# Build for specific browser
npm run build -- --browser=firefox
```

The built extensions will be in the `dist` directory.

## Configuration

1. Click the extension icon in your browser toolbar
2. Click "Settings"
3. Enter your Jira URL (e.g., `company.atlassian.net`)
4. Configure PR template and other options as needed

### Authentication

To access Jira data, you'll need to provide authentication credentials:

1. **Username**: Your Jira username (usually your email address)
2. **API Token**: Generate an API token from your Atlassian account:
   - Go to [https://id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
   - Click "Create API token"
   - Give it a descriptive name (e.g., "GitHub Jira Integration")
   - Copy the generated token

⚠️ **Security Note**: The extension stores your credentials locally in your browser's secure storage. Never share your API token with anyone.

## Usage

1. Configure the extension through the options page (click extension icon → Settings)
2. For Chrome/Edge: Make sure you're logged into your Jira instance
3. For Firefox: Use your email and API token for authentication
4. Navigate to any GitHub PR that has a Jira ticket number (e.g., PROJ-123) in:
   - PR title
   - Branch name
   - Page title
5. The extension will automatically:
   - Display a card with Jira ticket information below the PR header
   - Show ticket status, title, reporter, and assignee
   - Provide a direct link to the Jira ticket
   - Auto-fill PR templates when creating new PRs (if enabled)

## Tech Stack

This extension is built with modern web technologies:

- 🚀 [Extension.js](https://extension.js.org/) - Cross-browser extension framework
- ⚛️ React 19 - UI components
- 🎨 [shadcn/ui](https://ui.shadcn.com/) - UI component library
- 🎯 TypeScript - Type safety
- 💨 Tailwind CSS - Styling
- 📦 Extension.js bundler - Fast builds with HMR

### Project Structure

```
src/
├── assets/             # Extension icons
├── components/         # React components
│   ├── options/       # Options page components
│   ├── popup/         # Popup components
│   └── ui/            # Shared UI components (shadcn/ui)
├── config/            # Configuration files
├── lib/               # Utility functions
├── pages/             # HTML entry points
│   ├── popup.html
│   └── options.html
├── scripts/           # Main extension scripts
│   ├── background.ts  # Background service worker
│   ├── content.ts     # Content script
│   ├── popup.tsx      # Popup React app
│   └── options.tsx    # Options React app
├── styles/            # CSS files
│   ├── globals.css    # Global styles & Tailwind
│   └── content.css    # Content script styles
├── templates/         # PR template management
└── utils/             # Shared utilities
    ├── browser-api.ts # Cross-browser API wrapper
    └── storage.ts     # Type-safe storage wrapper
```

## Browser Compatibility

| Browser | Minimum Version | Manifest Version |
| ------- | --------------- | ---------------- |
| Chrome  | 88+             | v3               |
| Firefox | 57+             | v2               |
| Edge    | 88+             | v3               |

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Development

### Scripts

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check

# Run all checks
npm run check

# Version management
npm run version:current          # Show current version
npm run version:bump:patch       # Bump patch version
npm run version:bump:minor       # Bump minor version
npm run version:bump:major       # Bump major version
npm run version:set 1.2.3        # Set specific version
```

### Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Workflow

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run checks: `npm run check`
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- TypeScript with strict mode
- ESLint with recommended rules
- Prettier for formatting
- Follow existing patterns in the codebase

## Credits

Originally based on [chrome-github-jira](https://github.com/RobQuistNL/chrome-github-jira) by Rob Quist.
