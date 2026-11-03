import React from 'react';
import { render, screen } from '@testing-library/react';
import Trophies from '../components/Trophies';

describe('Trophies Component', () => {
  it('renders trophy cabinet with title and badges', () => {
    const mockData = {
      score: 85,
      profile: { public_repos: 12 },
      topRepos: [{ name: 'repo-1', stars: 25, hasReadme: true }],
      mostUsedLanguages: ['JavaScript', 'TypeScript', 'Python', 'Go', 'Rust'],
      redFlags: [],
      scoreBreakdown: { docs: 9 },
    };

    render(<Trophies data={mockData} />);

    expect(screen.getByText(/RPG Achievements & Trophies/i)).toBeInTheDocument();
    expect(screen.getByText('First Blood')).toBeInTheDocument();
    expect(screen.getByText('Centurion')).toBeInTheDocument();
    expect(screen.getByText('Polyglot')).toBeInTheDocument();
    expect(screen.getByText('Dragon Slayer')).toBeInTheDocument();
    expect(screen.getByText('Star Lord')).toBeInTheDocument();
    expect(screen.getByText('Doc Paladin')).toBeInTheDocument();
    expect(screen.getByText(/6 \/ 6 UNLOCKED/i)).toBeInTheDocument();
  });

  it('renders locked state when metrics are lower', () => {
    const lowData = {
      score: 45,
      profile: { public_repos: 0 },
      topRepos: [],
      mostUsedLanguages: ['JavaScript'],
      redFlags: ['Missing README'],
      scoreBreakdown: { docs: 3 },
    };

    render(<Trophies data={lowData} />);

    expect(screen.getByText(/0 \/ 6 UNLOCKED/i)).toBeInTheDocument();
  });
});
