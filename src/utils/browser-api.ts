import Browser from 'webextension-polyfill';

/**
 * Cross-browser API wrapper using webextension-polyfill
 * This provides a consistent API across Chrome, Firefox, and Edge
 */
export const api = Browser;

// Type exports for convenience
export type { Browser } from 'webextension-polyfill';

// Helper functions for common operations
export const getBrowserInfo = () => {
  if (typeof (globalThis as any).browser !== 'undefined' && (globalThis as any).browser.runtime) {
    return 'firefox';
  } else if (
    typeof (globalThis as any).chrome !== 'undefined' &&
    (globalThis as any).chrome.runtime
  ) {
    return 'chrome';
  }
  return 'unknown';
};

export const isFirefox = () => getBrowserInfo() === 'firefox';
export const isChrome = () => getBrowserInfo() === 'chrome';
