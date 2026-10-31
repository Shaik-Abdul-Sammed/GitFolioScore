import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TimeMachineView from '../components/TimeMachineView';

describe('TimeMachineView', () => {
  const oldDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 450).toISOString();
  const repos = [
    { name: 'old-repo', created_at: oldDate, stargazers_count: 8, language: 'Python' },
    { name: 'new-repo', created_at: new Date().toISOString(), stargazers_count: 20, language: 'TypeScript' },
  ];

  it('renders side-by-side annual growth metrics', () => {
    render(<TimeMachineView repos={repos} profile={{}} weights={{}} currentScore={84} />);

    expect(screen.getByText(/The "Time Machine" Growth View/i)).toBeInTheDocument();
    expect(screen.getByText(/1 Year Ago Snapshot/i)).toBeInTheDocument();
    expect(screen.getByText(/Today's Verified Score/i)).toBeInTheDocument();
    expect(screen.getByText(/Annual Growth Velocity/i)).toBeInTheDocument();
  });

  it('allows switching tabs to inspect historical vs present repositories', () => {
    render(<TimeMachineView repos={repos} profile={{}} weights={{}} currentScore={84} />);

    const pastTab = screen.getByText('1 Year Ago');
    fireEvent.click(pastTab);

    expect(screen.getByText(/old-repo/i)).toBeInTheDocument();
    expect(screen.queryByText(/new-repo/i)).not.toBeInTheDocument();
  });
});
