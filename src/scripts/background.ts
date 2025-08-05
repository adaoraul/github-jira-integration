import { api, isFirefox } from '../utils/browser-api';
import { Storage } from '../utils/storage';

// Background script for handling extension events
console.log('GitHub Jira Integration - Background script loaded');

// Handle extension installation or update
api.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Extension installed');
    // Open options page on first install
    api.runtime.openOptionsPage();
  } else if (details.reason === 'update') {
    console.log('Extension updated to version', api.runtime.getManifest().version);
  }
});

// Function to make authenticated Jira API requests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function makeJiraRequest(url: string, _jiraUrl: string): Promise<any> {
  const config = await Storage.getAll();

  // For Firefox, use API token authentication
  if (isFirefox() && config.jiraEmail && config.jiraApiToken) {
    const headers: HeadersInit = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + btoa(`${config.jiraEmail}:${config.jiraApiToken}`),
    };

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } else {
    // For Chrome/Edge, use cookies (user must be logged in)
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Not authenticated. Please log in to Jira.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

// Message types
interface JiraRequest {
  action?: string;
  query?: string;
  jiraUrl?: string;
  ticketNumber?: string;
}

// Handle messages from content scripts
api.runtime.onMessage.addListener((request: unknown, _sender, sendResponse) => {
  const req = request as JiraRequest;

  if (req.action === 'openOptions') {
    api.runtime.openOptionsPage();
    return false as any;
  }

  // Handle async requests
  (async () => {
    try {
      if (req.query === 'getSession' && req.jiraUrl) {
        const url = `https://${req.jiraUrl}/rest/auth/1/session`;
        try {
          const data = await makeJiraRequest(url, req.jiraUrl);
          sendResponse(data);
        } catch (error) {
          // Session check failed, but we can still try API token auth
          const config = await Storage.getAll();
          if (isFirefox() && config.jiraEmail && config.jiraApiToken) {
            // Return a fake session to indicate we have auth
            sendResponse({ name: config.jiraEmail });
          } else {
            sendResponse({ error: error instanceof Error ? error.message : 'Unknown error' });
          }
        }
      } else if (req.query === 'getJiraTicket' && req.jiraUrl && req.ticketNumber) {
        const url = `https://${req.jiraUrl}/rest/api/latest/issue/${req.ticketNumber}`;
        const data = await makeJiraRequest(url, req.jiraUrl);
        sendResponse(data);
      } else {
        sendResponse({ error: 'Unknown query type' });
      }
    } catch (error) {
      console.error('Background script error:', error);
      sendResponse({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  })();

  // Return true to indicate async response
  return true as any;
});
