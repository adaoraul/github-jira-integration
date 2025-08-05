import React from 'react';
import { createRoot } from 'react-dom/client';
import { PopupApp } from '../components/popup/PopupApp';
import '../styles/globals.css';

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <PopupApp />
      </React.StrictMode>
    );
  }
});
