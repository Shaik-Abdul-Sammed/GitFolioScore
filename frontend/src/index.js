import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import './i18n';

// Pre-mount mock window.anna when ?test=1 is present
if (typeof window !== 'undefined') {
  const params = new URLSearchParams(window.location.search);
  if (params.get('test') === '1' && !window.anna) {
    // eslint-disable-next-line no-console
    console.log('Test harness activated via ?test=1 (pre-mount)');
    const mockStorage = new Map();
    window.anna = {
      llm: {
        complete: async () => {
          await new Promise((r) => setTimeout(r, 800));
          return {
            content: {
              type: 'text',
              text: JSON.stringify({
                summary:
                  'Your portfolio demonstrates solid foundational discipline and architectural promise. Elevating documentation depth and project impact will position you well for senior opportunities.',
                actions: [
                  {
                    action: 'Add comprehensive architecture diagrams and setup guides to your top repos.',
                    rationale: 'Detailed READMEs directly increase recruiter evaluation scores and repo clarity.',
                  },
                  {
                    action: 'Tag repositories with relevant ecosystem topics and technologies.',
                    rationale: 'Topic tags improve repository discovery and signal specialization.',
                  },
                  {
                    action: 'Feature 2-3 high-impact capstone projects prominently in your bio and pinned repos.',
                    rationale: 'Recruiters spend <60 seconds scanning; clear anchors drive immediate engagement.',
                  },
                ],
                shareText:
                  'I scored my GitHub portfolio on GitFolioScore! Scored across code quality, documentation, and impact.',
              }),
            },
            model: 'mock-model',
            stopReason: 'endTurn',
            usage: { inputTokens: 250, outputTokens: 180, totalTokens: 430 },
          };
        },
      },
      storage: {
        get: async ({ key }) => ({ exists: mockStorage.has(key), value: mockStorage.get(key) || null }),
        set: async ({ key, value }) => {
          mockStorage.set(key, value);
          return { etag: 'mock-etag', generation: 1, size_bytes: 512 };
        },
      },
    };
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js');
  });
}
