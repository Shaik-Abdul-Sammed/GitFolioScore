import React from 'react';
import { render, screen } from '@testing-library/react';
import HackerRankResume from '../components/HackerRankResume';

describe('HackerRankResume Component', () => {
  const mockReport = {
    profile: {
      login: 'alice',
      name: 'Alice Developer',
      bio: 'Fullstack engineer building great things',
      location: 'San Francisco, CA',
      public_repos: 24,
    },
    topRepos: [
      { name: 'repo-one', language: 'JavaScript', stargazers_count: 50, description: 'Awesome JS tool' },
    ],
    mostUsedLanguages: ['JavaScript', 'Python'],
    score: 88,
  };

  test('renders the HackerRank resume card and download button', () => {
    render(<HackerRankResume report={mockReport} advice={{ summary: 'Strong skills' }} />);
    expect(screen.getByText(/HackerRank-Style Resume/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download HackerRank Resume \(PDF\)/i })).toBeInTheDocument();
  });
});
