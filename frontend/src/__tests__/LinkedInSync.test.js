import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LinkedInSync from '../components/LinkedInSync';

describe('LinkedInSync Component', () => {
  const mockReport = {
    profile: {
      login: 'bob',
      name: 'Bob Coder',
      bio: 'Open source lover',
    },
    topRepos: [
      { name: 'fast-api', language: 'Python', stargazers_count: 100 },
    ],
    mostUsedLanguages: ['Python', 'Go'],
    score: 82,
  };

  test('renders collapsible header trigger', () => {
    render(<LinkedInSync report={mockReport} />);
    expect(screen.getByText(/LinkedIn Sync & Consistency Audit/i)).toBeInTheDocument();
  });

  test('expands to show text area and actions', () => {
    render(<LinkedInSync report={mockReport} />);
    const trigger = screen.getByRole('button', { name: /Expand LinkedIn Sync/i });
    fireEvent.click(trigger);

    expect(screen.getByPlaceholderText(/Passionate full-stack/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Audit Consistency Score/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Auto-Generate Headlines/i })).toBeInTheDocument();
  });
});
