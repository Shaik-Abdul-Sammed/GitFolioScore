import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TechDebtGraveyard from '../components/TechDebtGraveyard';

describe('TechDebtGraveyard', () => {
  const oldDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 400).toISOString();
  const freshDate = new Date().toISOString();

  it('renders abandoned repos with tombstone', () => {
    const repos = [
      { name: 'abandoned-repo', pushed_at: oldDate, stargazers_count: 0, html_url: 'http://test' },
      { name: 'active-repo', pushed_at: freshDate, stargazers_count: 10, html_url: 'http://test2' },
    ];

    render(<TechDebtGraveyard repos={repos} username="octocat" />);

    expect(screen.getByText(/Tech Debt Graveyard 🪦/i)).toBeInTheDocument();
    expect(screen.getByText(/1 Ghost Repo/i)).toBeInTheDocument();
    expect(screen.getByText('abandoned-repo')).toBeInTheDocument();
    expect(screen.queryByText('active-repo')).not.toBeInTheDocument();
  });

  it('allows copying CLI archive command', () => {
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue() },
    });
    const onToast = jest.fn();
    const repos = [
      { name: 'dead-project', pushed_at: oldDate, stargazers_count: 0 },
    ];

    render(<TechDebtGraveyard repos={repos} username="octocat" onToast={onToast} />);

    const copyBtn = screen.getByText(/Copy CLI Archive/i);
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('gh repo archive octocat/dead-project -y');
    expect(onToast).toHaveBeenCalledWith(expect.stringContaining('Copied archive command'), 'success');
  });
});
