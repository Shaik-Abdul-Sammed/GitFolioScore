import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import './i18n';

describe('App.js - UI & Integration Tests', () => {
  const dummyProfile = {
    login: 'octocat',
    name: 'The Octocat',
    bio: 'GitHub mascot and open source contributor',
    avatar_url: 'https://avatars.githubusercontent.com/u/583231',
    location: 'San Francisco, CA',
    company: 'GitHub',
    public_repos: 5,
    created_at: '2011-01-25T18:44:36Z',
  };

  const dummyRepos = [
    {
      name: 'hello-world',
      description: 'First repository for beginners',
      stargazers_count: 85,
      forks_count: 25,
      language: 'JavaScript',
      topics: ['octocat', 'demo'],
      hasReadme: true,
      readmeSize: 2000,
      size: 150,
      updated_at: new Date().toISOString(),
    },
    {
      name: 'spoon-knife',
      description: 'Clone and fork practice repository',
      stargazers_count: 120,
      forks_count: 40,
      language: 'TypeScript',
      topics: ['tutorial'],
      hasReadme: true,
      readmeSize: 1800,
      size: 200,
      updated_at: new Date().toISOString(),
    },
  ];

  const dummyAdvice = {
    summary: 'Strong foundational portfolio with high documentation hygiene.',
    actions: [
      { action: 'Pin key repositories', rationale: 'Directs recruiters to your best code' },
      { action: 'Add test coverage badges', rationale: 'Demonstrates enterprise code quality' },
      { action: 'Expand topic tags', rationale: 'Improves discovery across GitHub search' },
    ],
    shareText: 'Scored high on GitFolioScore with verified GitHub metrics!',
  };

  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    delete window.anna;

    // Default mock for window.anna
    window.anna = {
      llm: {
        complete: jest.fn().mockResolvedValue({
          content: {
            type: 'text',
            text: JSON.stringify(dummyAdvice),
          },
        }),
      },
      storage: {
        get: jest.fn().mockResolvedValue({ exists: false, value: null }),
        set: jest.fn().mockResolvedValue({ etag: 'mock-etag' }),
      },
    };

    // Default mock for fetch
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes('/repos')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(dummyRepos),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(dummyProfile),
      });
    });
  });

  afterAll(() => {
    global.fetch = originalFetch;
    delete window.anna;
  });

  describe('Initial State', () => {
    it('renders the search input and the "Analyze & Coach" button', () => {
      render(<App />);

      const searchInput = screen.getByPlaceholderText(/GitHub username/i);
      const submitButton = screen.getByRole('button', { name: /Analyze & Coach/i });

      expect(searchInput).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe('Empty Submit', () => {
    it('disables the submit button when input is empty', async () => {
      const user = userEvent.setup();
      render(<App />);

      const searchInput = screen.getByPlaceholderText(/GitHub username/i);
      const submitButton = screen.getByRole('button', { name: /Analyze & Coach/i });

      expect(searchInput).toHaveValue('');
      expect(submitButton).toBeDisabled();

      // Try typing spaces only
      await user.type(searchInput, '   ');
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Full Success Flow', () => {
    it('fetches profile, calculates score, and displays AI advice recommendations', async () => {
      const user = userEvent.setup();
      render(<App />);

      const searchInput = screen.getByPlaceholderText(/GitHub username/i);
      const submitButton = screen.getByRole('button', { name: /Analyze & Coach/i });

      await user.type(searchInput, 'octocat');
      expect(submitButton).toBeEnabled();

      await user.click(submitButton);

      // Verify ScoreCard renders with /100 score marker and username
      expect(await screen.findByText('/100')).toBeInTheDocument();
      expect(screen.getAllByText('@octocat')[0]).toBeInTheDocument();

      // Verify AI Career Coach analysis section renders
      expect(await screen.findByText(/Top 3 Prioritized Actions/i)).toBeInTheDocument();
      expect(screen.getByText('Pin key repositories')).toBeInTheDocument();
      expect(screen.getByText('Add test coverage badges')).toBeInTheDocument();
      expect(screen.getByText('Expand topic tags')).toBeInTheDocument();
      expect(screen.getByText(dummyAdvice.summary)).toBeInTheDocument();
    });
  });

  describe('LLM Fails but Fetch Succeeds', () => {
    let consoleSpy;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('displays the calculated score while showing the AI Analysis Notice and Retry button', async () => {
      const user = userEvent.setup();

      // Mock LLM to reject with quota exceeded error
      window.anna.llm.complete = jest.fn().mockRejectedValue({
        code: 'APP_QUOTA_EXCEEDED',
        message: 'No credits remaining',
      });

      render(<App />);

      const searchInput = screen.getByPlaceholderText(/GitHub username/i);
      const submitButton = screen.getByRole('button', { name: /Analyze & Coach/i });

      await user.type(searchInput, 'octocat');
      await user.click(submitButton);

      // Score still succeeds and renders
      expect(await screen.findByText('/100')).toBeInTheDocument();
      expect(screen.getAllByText('@octocat')[0]).toBeInTheDocument();

      // AI Analysis Notice is displayed with error description
      expect(await screen.findByText('AI Analysis Notice')).toBeInTheDocument();
      expect(
        screen.getByText(/You're out of Anna credits\. Top up in Anna settings, then retry\./i)
      ).toBeInTheDocument();

      // Retry button is available
      const retryButton = screen.getByRole('button', { name: /Retry AI Analysis/i });
      expect(retryButton).toBeInTheDocument();
    });
  });
});
