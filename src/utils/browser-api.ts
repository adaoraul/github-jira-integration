import Browser from 'webextension-polyfill';

/**
 * Cross-browser API wrapper using webextension-polyfill
 * This provides a consistent API across Chrome, Firefox, and Edge
 */
export const api = Browser;

// Type exports for convenience
export type { Browser } from 'webextension-polyfill';

// Define a more specific type for the global object
interface BrowserGlobal {
  browser?: {
    runtime?: unknown;
  };
  chrome?: {
    runtime?: unknown;
  };
}

// Helper functions for common operations
export const getBrowserInfo = () => {
  const global = globalThis as unknown as BrowserGlobal;
  if (typeof global.browser !== 'undefined' && global.browser.runtime) {
    return 'firefox';
  } else if (typeof global.chrome !== 'undefined' && global.chrome.runtime) {
    return 'chrome';
  }
  return 'unknown';
};

export const isFirefox = () => getBrowserInfo() === 'firefox';
export const isChrome = () => getBrowserInfo() === 'chrome';
