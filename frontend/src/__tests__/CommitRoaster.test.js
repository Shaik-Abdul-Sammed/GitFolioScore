import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CommitRoaster from '../components/CommitRoaster';

describe('CommitRoaster', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          type: 'PushEvent',
          payload: {
            commits: [{ message: 'fixed bug' }, { message: 'wip' }],
          },
        },
      ],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders initial roast prompt card', () => {
    render(<CommitRoaster username="octocat" repos={[{ name: 'octo-app' }]} />);
    expect(screen.getByText(/AI Commit Message Roaster/i)).toBeInTheDocument();
    expect(screen.getByText(/Roast My Commits/i)).toBeInTheDocument();
  });

  it('triggers commit fetching and displays roast verdict', async () => {
    window.anna = {
      llm: {
        complete: jest.fn().mockResolvedValue({
          text: JSON.stringify({
            hygieneScore: 38,
            headline: 'Git Commit Disaster Zone',
            roastComment: 'Writing fixed bug 40 times is not a git strategy.',
            worstOffenders: [{ commit: 'fixed bug', critique: 'Zero context.' }],
            improvedSuggestion: 'feat(core): enhance token refresh logic',
          }),
        }),
      },
    };

    render(<CommitRoaster username="octocat" repos={[{ name: 'octo-app' }]} />);

    const roastBtn = screen.getByText(/Roast My Commits/i);
    fireEvent.click(roastBtn);

    await waitFor(() => {
      expect(screen.getByText('Git Commit Disaster Zone')).toBeInTheDocument();
    });

    expect(screen.getByText('38')).toBeInTheDocument();
    expect(screen.getByText(/Writing fixed bug 40 times/i)).toBeInTheDocument();
  });
});
