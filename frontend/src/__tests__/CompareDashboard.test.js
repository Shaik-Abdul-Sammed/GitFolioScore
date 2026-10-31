import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CompareDashboard from '../components/CompareDashboard';

describe('CompareDashboard', () => {
  const user1 = {
    username: 'alice',
    report: {
      score: 88,
      profile: { name: 'Alice Smith', followers: 120, public_repos: 15 },
      topRepos: [{ name: 'r1', stars: 50 }, { name: 'r2', stars: 20 }],
    },
  };

  const user2 = {
    username: 'bob',
    report: {
      score: 72,
      profile: { name: 'Bob Jones', followers: 80, public_repos: 10 },
      topRepos: [{ name: 'b1', stars: 15 }],
    },
  };

  it('renders null if either user is missing', () => {
    const { container } = render(<CompareDashboard user1={null} user2={user2} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders side-by-side comparison and calculates winner correctly', () => {
    const onClose = jest.fn();
    render(<CompareDashboard user1={user1} user2={user2} onClose={onClose} />);

    expect(screen.getByText('Head-to-Head Developer Comparison')).toBeInTheDocument();
    expect(screen.getByText('Winner: @alice')).toBeInTheDocument();
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    expect(screen.getByText('88')).toBeInTheDocument();
    expect(screen.getByText('72')).toBeInTheDocument();

    const closeBtn = screen.getByLabelText('Close Comparison');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });
});
