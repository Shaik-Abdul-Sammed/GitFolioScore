import React from 'react';
import { render, screen } from '@testing-library/react';
import RepoInsights from '../components/RepoInsights';

describe('RepoInsights', () => {
  it('renders issues, PRs, and contributors', () => {
    const insights = {
      issues: [{ number: 1, title: 'Bug', url: 'url1' }],
      prs: [{ number: 2, title: 'Fix', url: 'url2' }, { number: 3, title: 'Feat', url: 'url3' }],
      contributors: [{ login: 'octocat', url: 'url3', avatar_url: 'avatar' }]
    };
    render(<RepoInsights repo={{ name: 'repo' }} insights={insights} />);
    expect(screen.getByText(/repo/)).toBeInTheDocument();
    expect(screen.getByText(/Open Issues/)).toBeInTheDocument();
    expect(screen.getAllByText(/1/).length).toBeGreaterThan(0); // Issues, PRs, Contributors all have length 1
    expect(screen.getByText(/Open PRs/)).toBeInTheDocument();
    expect(screen.getByText(/2/)).toBeInTheDocument();
    expect(screen.getByTitle('octocat')).toBeInTheDocument();
  });

  it('hides zero metrics and displays Stars and Forks when issues/prs/contributors are empty', () => {
    const emptyInsights = { issues: [], prs: [], contributors: [] };
    const repo = { name: 'linux', stargazers_count: 175000, forks_count: 53000 };
    render(<RepoInsights repo={repo} insights={emptyInsights} />);

    expect(screen.queryByText(/0 Open Issues/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/0 Open PRs/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/0 Contributors/i)).not.toBeInTheDocument();
    expect(screen.getByText(/75.*000/)).toBeInTheDocument();
    expect(screen.getByText(/53.*000/)).toBeInTheDocument();
    expect(screen.getByText(/Stars/i)).toBeInTheDocument();
    expect(screen.getByText(/Forks/i)).toBeInTheDocument();
  });
});
