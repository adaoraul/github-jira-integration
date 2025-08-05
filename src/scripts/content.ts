import { api } from '../utils/browser-api';
import { Storage, StorageData } from '../utils/storage';
import { replaceTemplateVariables, TemplateVariables } from '../templates/pr-template';
import { JIRA_TICKET_REGEX } from '../config/defaults';

// DOM Selectors
const SELECTORS = {
  PR_TITLE: 'h1 > .js-issue-title',
  PR_BRANCH: '#partial-discussion-header .head-ref span',
  PR_HEADER: '#partial-discussion-header',
  PR_BODY_TEXTAREA: 'textarea#pull_request_body',
  PR_TITLE_INPUT: 'input#pull_request_title',
} as const;

// Jira API interfaces
interface JiraSession {
  name: string;
  self: string;
}

interface JiraIssue {
  key: string;
  fields: {
    summary: string;
    description?: string;
    status?: {
      name: string;
    };
    issuetype?: {
      name: string;
    };
    assignee?: {
      displayName: string;
    };
    reporter?: {
      displayName: string;
    };
  };
}

interface JiraResponse {
  error?: string;
}

class GitHubJiraIntegration {
  private config: StorageData | null = null;

  constructor() {
    // Constructor
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('Initializing GitHub Jira Integration');

      // Load configuration
      this.config = await Storage.getAll();

      if (!this.config.jiraUrl) {
        console.warn('GitHub Jira Integration: Jira URL is not set');
        return false;
      }

      // Check session
      try {
        const response = (await api.runtime.sendMessage({
          query: 'getSession',
          jiraUrl: this.config.jiraUrl,
        })) as JiraSession | null;

        if (!response?.name) {
          console.warn(
            `GitHub Jira Integration: Not logged in to Jira. Please log into Jira at https://${this.config.jiraUrl}`
          );
          return false;
        }

        console.log('GitHub Jira Integration: Connected as', response.name);
      } catch (error) {
        console.warn(
          `GitHub Jira Integration: Could not check Jira session. Make sure you're logged into Jira at https://${this.config.jiraUrl}`
        );
        console.warn('Error details:', error);
        // Continue anyway - let individual requests fail with better error messages
      }

      // Set up monitoring
      this.setupPageMonitoring();

      // Initialization complete
      console.log('GitHub Jira Integration initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize:', error);
      return false;
    }
  }

  private setupPageMonitoring(): void {
    let lastRefresh = 0;
    const REFRESH_TIMEOUT = 1000; // Debounce timeout

    // Simple timeout-based approach
    const checkPageDebounced = (): void => {
      const now = Date.now();
      if (now - lastRefresh < REFRESH_TIMEOUT) {
        return;
      }
      lastRefresh = now;
      // Add longer delay to ensure GitHub's DOM is fully initialized
      setTimeout(() => this.checkPage(), 500);
    };

    // Initial check with delay
    setTimeout(checkPageDebounced, 1000);

    // Listen for GitHub's navigation events
    document.addEventListener('pjax:end', checkPageDebounced);
    document.addEventListener('turbo:load', checkPageDebounced);

    // Simple URL change detection
    let lastUrl = window.location.href;
    setInterval(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        checkPageDebounced();
      }
    }, 1000);
  }

  private checkPage(): void {
    const url = window.location.href;

    // Only run on specific PR-related pages
    if (url.includes('/pull/') && !url.includes('/pull/new')) {
      // This is a PR view page
      this.enhancePullRequest();
    } else if (url.includes('/compare/') || url.includes('/pull/new')) {
      // This is a PR creation page
      // Wait a bit for GitHub's dynamic content to load
      setTimeout(() => {
        // Check if we're on the right step of PR creation
        const bodyTextarea = document.querySelector(SELECTORS.PR_BODY_TEXTAREA);
        const titleInput = document.querySelector(SELECTORS.PR_TITLE_INPUT);

        // Only proceed if we can see the PR form fields
        if (bodyTextarea || titleInput) {
          this.enhancePullRequestCreate();
        }
      }, 500);
    }
  }

  private async enhancePullRequest(): Promise<void> {
    console.log('GitHub Jira Integration: Checking PR page for enhancement');

    // Check if we've already processed this page
    if (document.querySelector('.jira-ticket-info')) {
      console.log('GitHub Jira Integration: Page already processed');
      return;
    }

    const ticketNumber = this.extractTicketNumber();
    if (!ticketNumber) {
      console.log('GitHub Jira Integration: No ticket number found');
      return;
    }

    console.log('GitHub Jira Integration: Found ticket number:', ticketNumber);

    // Don't mark the title element to avoid any DOM mutations
    // Skip badge insertion - just add ticket info below header
    await this.addTicketInfo(ticketNumber);
  }

  private async enhancePullRequestCreate(): Promise<void> {
    // More defensive checks for PR creation pages
    const bodyEl = document.querySelector(SELECTORS.PR_BODY_TEXTAREA) as HTMLTextAreaElement;
    const titleInput = document.querySelector(SELECTORS.PR_TITLE_INPUT) as HTMLInputElement;

    // If neither element exists, we're not on the right page/step
    if (!bodyEl && !titleInput) {
      return;
    }

    const ticketNumber = this.extractTicketNumber();
    if (!ticketNumber || !this.config) {
      return;
    }

    try {
      const ticketData = await this.fetchJiraData(ticketNumber);

      // Set PR title if enabled and input exists
      if (this.config.prTitleEnabled && titleInput && !titleInput.value) {
        titleInput.value = `${ticketNumber}: ${ticketData.fields.summary}`;
        // Trigger change event so GitHub recognizes the value
        titleInput.dispatchEvent(new Event('input', { bubbles: true }));
      }

      // Set PR body if enabled and textarea exists
      if (this.config.prTemplateEnabled && bodyEl && !bodyEl.value) {
        const acceptanceText = await this.extractAcceptanceCriteria(ticketData);
        const jiraUrl = `https://${this.config.jiraUrl}/browse/${ticketNumber}`;

        const variables: TemplateVariables = {
          TICKETNUMBER: ticketNumber,
          TICKETURL: jiraUrl,
          ACCEPTANCE: acceptanceText || 'No acceptance criteria found',
        };

        bodyEl.value = replaceTemplateVariables(this.config.prTemplate, variables);
        // Trigger change event
        bodyEl.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } catch (error) {
      console.error('Failed to fetch Jira data:', error);
    }
  }

  private extractTicketNumber(): string | null {
    // Check PR title
    const titleEl = document.querySelector(SELECTORS.PR_TITLE) as HTMLElement;
    if (titleEl) {
      const titleMatch = titleEl.textContent?.match(JIRA_TICKET_REGEX);
      if (titleMatch) {
        return titleMatch[0];
      }
    }

    // Check branch name
    const branchEl = document.querySelector(SELECTORS.PR_BRANCH) as HTMLElement;
    if (branchEl) {
      const branchMatch = branchEl.textContent?.match(JIRA_TICKET_REGEX);
      if (branchMatch) {
        return branchMatch[0];
      }
    }

    // Check page title
    const pageTitleMatch = document.title.match(JIRA_TICKET_REGEX);
    if (pageTitleMatch) {
      return pageTitleMatch[0];
    }

    // Check URL for branch names in compare URLs
    const urlMatch = window.location.href.match(JIRA_TICKET_REGEX);
    if (urlMatch) {
      return urlMatch[0];
    }

    return null;
  }

  private async fetchJiraData(ticketNumber: string): Promise<JiraIssue> {
    if (!this.config?.jiraUrl) {
      throw new Error('Jira URL not configured');
    }

    console.log('GitHub Jira Integration: Fetching data for', ticketNumber);

    const response = await api.runtime.sendMessage({
      query: 'getJiraTicket',
      ticketNumber,
      jiraUrl: this.config.jiraUrl,
    });

    console.log('GitHub Jira Integration: Received response', response);

    if (!response || (response as JiraResponse).error) {
      throw new Error((response as JiraResponse)?.error || 'Failed to fetch Jira data');
    }

    return response as JiraIssue;
  }

  private async extractAcceptanceCriteria(ticket: JiraIssue): Promise<string> {
    if (!ticket.fields.description || !this.config) {
      return '';
    }

    const { acceptanceStartString, acceptanceEndString } = this.config;
    const description = ticket.fields.description;

    const startIndex = description.indexOf(acceptanceStartString);
    if (startIndex === -1) {
      return '';
    }

    const endIndex = description.indexOf(acceptanceEndString, startIndex);
    const acceptanceText =
      endIndex === -1
        ? description.substring(startIndex + acceptanceStartString.length)
        : description.substring(startIndex + acceptanceStartString.length, endIndex);

    return acceptanceText.trim();
  }

  private async addTicketInfo(ticketNumber: string): Promise<void> {
    if (!this.config?.jiraUrl) {
      console.log('GitHub Jira Integration: No Jira URL configured');
      return;
    }

    const headerEl = document.querySelector(SELECTORS.PR_HEADER);
    if (!headerEl) {
      console.log('GitHub Jira Integration: PR header element not found');
      return;
    }

    console.log('GitHub Jira Integration: Adding ticket info for', ticketNumber);

    // Create container with styling context
    const container = document.createElement('div');
    container.className = 'jira-ticket-info';

    // Add loading state
    container.innerHTML = this.createLoadingState(ticketNumber);

    // Insert after header
    headerEl.insertAdjacentElement('afterend', container);

    try {
      const ticketData = await this.fetchJiraData(ticketNumber);
      const jiraUrl = `https://${this.config.jiraUrl}/browse/${ticketNumber}`;

      // Update with ticket info
      container.innerHTML = this.createTicketInfo(
        ticketNumber,
        jiraUrl,
        ticketData.fields.summary,
        ticketData.fields.status?.name || 'Unknown',
        ticketData.fields.reporter?.displayName || 'Unknown',
        ticketData.fields.assignee?.displayName || 'Unassigned'
      );

      // Add close button functionality if needed
      const closeButton = container.querySelector('.jira-close-button');
      if (closeButton) {
        closeButton.addEventListener('click', (e) => {
          e.preventDefault();
          container.remove();
        });
      }

      // Add link click handler
      const issueLink = container.querySelector('.jira-issue-link');
      if (issueLink) {
        issueLink.addEventListener('click', (e) => {
          e.preventDefault();
          window.open(jiraUrl, '_blank');
        });
      }
    } catch (error) {
      // Update with error state
      container.innerHTML = this.createErrorState(ticketNumber, error);
      console.error('GitHub Jira Integration: Failed to fetch Jira data:', error);
    }
  }

  private createLoadingState(ticketNumber: string): string {
    return `
      <div class="flex items-center gap-2">
        <div class="jira-badge w-5 h-5 rounded flex items-center justify-center">
          <span class="text-white text-xs font-bold">J</span>
        </div>
        <span class="text-slate-500">Loading Jira ticket ${ticketNumber}...</span>
      </div>
    `;
  }

  private createErrorState(ticketNumber: string, error: unknown): string {
    return `
      <div class="flex items-center gap-2">
        <div class="w-5 h-5 bg-red-600 rounded flex items-center justify-center">
          <span class="text-white text-xs font-bold">!</span>
        </div>
        <span class="text-red-600">Failed to load Jira ticket ${ticketNumber}: ${error instanceof Error ? error.message : 'Unknown error'}</span>
      </div>
    `;
  }

  private createTicketInfo(
    issueKey: string,
    _jiraUrl: string,
    title: string,
    status: string,
    reporter: string,
    assignee: string
  ): string {
    const getStatusVariant = (status: string) => {
      switch (status.toLowerCase()) {
        case 'done':
          return 'default';
        case 'in progress':
          return 'secondary';
        case 'blocked':
          return 'destructive';
        case 'todo':
          return 'outline';
        default:
          return 'secondary';
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status.toLowerCase()) {
        case 'in progress':
          return '🔄';
        case 'done':
          return '✅';
        case 'todo':
          return '📋';
        case 'blocked':
          return '🚫';
        default:
          return '📋';
      }
    };

    const getInitials = (name: string) =>
      name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

    // Get status variant classes
    const statusVariant = getStatusVariant(status);
    const statusClasses = {
      default: 'bg-primary text-primary-foreground',
      secondary: 'bg-secondary text-secondary-foreground',
      destructive: 'bg-destructive text-destructive-foreground',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    }[statusVariant];

    // Inject minimal styles if not already present
    if (!document.querySelector('#jira-integration-styles')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'jira-integration-styles';
      styleSheet.textContent = `
        .jira-ticket-info {
          --background: 255 255 255;
          --foreground: 9 9 11;
          --primary: 9 9 11;
          --primary-foreground: 250 250 250;
          --secondary: 244 244 245;
          --secondary-foreground: 24 24 27;
          --destructive: 239 68 68;
          --destructive-foreground: 254 242 242;
          --muted: 244 244 245;
          --muted-foreground: 113 113 122;
          --accent: 244 244 245;
          --accent-foreground: 24 24 27;
          --border: 228 228 231;
          --input: 228 228 231;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        
        @media (prefers-color-scheme: dark) {
          .jira-ticket-info {
            --background: 9 9 11;
            --foreground: 250 250 250;
            --primary: 250 250 250;
            --primary-foreground: 9 9 11;
            --secondary: 39 39 42;
            --secondary-foreground: 250 250 250;
            --destructive: 127 29 29;
            --destructive-foreground: 254 242 242;
            --muted: 39 39 42;
            --muted-foreground: 161 161 170;
            --accent: 39 39 42;
            --accent-foreground: 250 250 250;
            --border: 39 39 42;
            --input: 39 39 42;
          }
        }
        
        /* Base styles */
        .jira-ticket-info .border { border: 1px solid rgb(var(--border)); }
        .jira-ticket-info .rounded-lg { border-radius: 0.5rem; }
        .jira-ticket-info .p-3 { padding: 0.75rem; }
        .jira-ticket-info .flex { display: flex; }
        .jira-ticket-info .inline-flex { display: inline-flex; }
        .jira-ticket-info .items-center { align-items: center; }
        .jira-ticket-info .justify-center { justify-content: center; }
        .jira-ticket-info .gap-1 { gap: 0.25rem; }
        .jira-ticket-info .gap-2 { gap: 0.5rem; }
        .jira-ticket-info .gap-3 { gap: 0.75rem; }
        .jira-ticket-info .flex-wrap { flex-wrap: wrap; }
        .jira-ticket-info .flex-1 { flex: 1 1 0%; }
        .jira-ticket-info .min-w-0 { min-width: 0; }
        .jira-ticket-info .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        
        /* Text styles */
        .jira-ticket-info .text-xs { font-size: 0.75rem; line-height: 1rem; }
        .jira-ticket-info .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
        .jira-ticket-info .font-semibold { font-weight: 600; }
        .jira-ticket-info .font-medium { font-weight: 500; }
        
        /* Spacing */
        .jira-ticket-info .px-2\\.5 { padding-left: 0.625rem; padding-right: 0.625rem; }
        .jira-ticket-info .py-0\\.5 { padding-top: 0.125rem; padding-bottom: 0.125rem; }
        .jira-ticket-info .p-0\\.5 { padding: 0.125rem; }
        .jira-ticket-info .ml-1 { margin-left: 0.25rem; }
        
        /* Shape */
        .jira-ticket-info .rounded-md { border-radius: 0.375rem; }
        .jira-ticket-info .rounded { border-radius: 0.25rem; }
        .jira-ticket-info .rounded-full { border-radius: 9999px; }
        
        /* Size */
        .jira-ticket-info .h-3 { height: 0.75rem; }
        .jira-ticket-info .w-3 { width: 0.75rem; }
        .jira-ticket-info .h-5 { height: 1.25rem; }
        .jira-ticket-info .w-5 { width: 1.25rem; }
        
        /* Colors */
        .jira-ticket-info .bg-primary { background-color: rgb(var(--primary)); }
        .jira-ticket-info .text-primary-foreground { color: rgb(var(--primary-foreground)); }
        .jira-ticket-info .bg-secondary { background-color: rgb(var(--secondary)); }
        .jira-ticket-info .text-secondary-foreground { color: rgb(var(--secondary-foreground)); }
        .jira-ticket-info .bg-destructive { background-color: rgb(var(--destructive)); }
        .jira-ticket-info .text-destructive-foreground { color: rgb(var(--destructive-foreground)); }
        .jira-ticket-info .bg-background { background-color: rgb(var(--background)); }
        .jira-ticket-info .text-muted-foreground { color: rgb(var(--muted-foreground)); }
        .jira-ticket-info .bg-muted { background-color: rgb(var(--muted)); }
        .jira-ticket-info .border-input { border-color: rgb(var(--input)); }
        .jira-ticket-info .text-blue-600 { color: #2563eb; }
        .jira-ticket-info .text-blue-500 { color: #3b82f6; }
        
        /* Hover states */
        .jira-ticket-info .hover\\:bg-accent:hover { background-color: rgb(var(--accent)); }
        .jira-ticket-info .hover\\:text-accent-foreground:hover { color: rgb(var(--accent-foreground)); }
        .jira-ticket-info .hover\\:bg-white\\/20:hover { background-color: rgba(255, 255, 255, 0.2); }
        .jira-ticket-info .hover\\:text-blue-800:hover { color: #1e40af; }
        
        /* Cursor */
        .jira-ticket-info .cursor-pointer { cursor: pointer; }
        
        /* Button reset */
        .jira-ticket-info button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          margin: 0;
          font: inherit;
          color: inherit;
        }
      `;
      document.head.appendChild(styleSheet);
    }

    return `
      <div class="border rounded-lg p-3">
        <div class="flex items-center gap-3 flex-wrap">
          <!-- Jira Badge -->
          <div class="bg-primary text-primary-foreground inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold">
            <span>J</span>
            <span>Jira</span>
            <button class="jira-close-button ml-1 hover:bg-white/20 rounded p-0.5">
              <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Status Badge -->
          <div class="${statusClasses} inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold">
            <span>${getStatusIcon(status)}</span>
            <span>${this.escapeHtml(status)}</span>
          </div>

          <!-- Issue Key -->
          <div class="jira-issue-link flex items-center gap-1">
            <span class="text-blue-600 hover:text-blue-800 cursor-pointer">
              ${issueKey}
            </span>
            <svg class="h-3 w-3 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </div>

          <!-- Title -->
          <span class="flex-1 min-w-0 truncate">
            ${this.escapeHtml(title)}
          </span>

          <!-- Reporter -->
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1 text-muted-foreground">
              <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span class="text-sm">Reporter</span>
            </div>
            <div class="flex items-center gap-1">
              <div class="h-5 w-5 rounded-full bg-muted flex items-center justify-center">
                <span class="text-xs">${getInitials(reporter)}</span>
              </div>
              <span class="text-sm">${this.escapeHtml(reporter)}</span>
            </div>
          </div>

          <!-- Assignee -->
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1 text-muted-foreground">
              <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="5" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span class="text-sm">Assignee</span>
            </div>
            <div class="flex items-center gap-1">
              <div class="h-5 w-5 rounded-full bg-muted flex items-center justify-center">
                <span class="text-xs">${getInitials(assignee)}</span>
              </div>
              <span class="text-sm">${this.escapeHtml(assignee)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const integration = new GitHubJiraIntegration();
    integration.initialize();
  });
} else {
  const integration = new GitHubJiraIntegration();
  integration.initialize();
}
