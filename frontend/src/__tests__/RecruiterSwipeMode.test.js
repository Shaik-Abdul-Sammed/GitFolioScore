import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RecruiterSwipeMode from '../components/RecruiterSwipeMode';

describe('RecruiterSwipeMode', () => {
  const repos = [
    { name: 'repo-one', description: 'React application', stargazers_count: 12, language: 'JavaScript' },
    { name: 'repo-two', description: 'Python utility', stargazers_count: 4, language: 'Python' },
  ];

  it('renders card deck with first repo', () => {
    render(<RecruiterSwipeMode repos={repos} username="octocat" />);

    expect(screen.getByText(/Recruiter "Tinder" Mode/i)).toBeInTheDocument();
    expect(screen.getByText('repo-one')).toBeInTheDocument();
    expect(screen.getByText('React application')).toBeInTheDocument();
  });

  it('swipes card right and features repo', async () => {
    render(<RecruiterSwipeMode repos={repos} username="octocat" />);

    const featureBtn = screen.getByLabelText('Feature repository');
    fireEvent.click(featureBtn);

    await waitFor(() => {
      expect(screen.getByText('repo-two')).toBeInTheDocument();
    });
  });
});
