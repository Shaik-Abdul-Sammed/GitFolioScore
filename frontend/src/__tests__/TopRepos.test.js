import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import TopRepos from '../components/TopRepos';

const repos = Array.from({ length: 12 }, (_, i) => ({
  name: `repo${i + 1}`,
  description: `desc${i + 1}`,
  stars: i,
  forks: i,
  language: 'JS',
}));

describe('TopRepos', () => {
  it('renders pagination and filtering', async () => {
    await act(async () => {
      render(<TopRepos repos={repos} />);
    });
    expect(screen.getByText('Top Repositories')).toBeInTheDocument();
    // Check pagination exists by finding Next button
    expect(screen.getByText('Next →')).toBeInTheDocument();
    // Click Next and verify it works (no errors)
    fireEvent.click(screen.getByText('Next →'));
    // Test search filter
    fireEvent.change(screen.getByPlaceholderText('Search repos...'), { target: { value: 'repo10' } });
    expect(screen.getByText('repo10')).toBeInTheDocument();
  });
});
