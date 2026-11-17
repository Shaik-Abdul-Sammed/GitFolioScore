import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LinkedInSync, { evaluateDeterministicLinkedIn } from '../components/LinkedInSync';

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

  describe('evaluateDeterministicLinkedIn alignment logic', () => {
    test('correctly recognizes Frontend Engineer with JavaScript as strong alignment', () => {
      const res = evaluateDeterministicLinkedIn(
        'Frontend Engineer',
        'Building responsive React web applications',
        ['JavaScript', 'TypeScript'],
        [{ name: 'my-react-app' }],
        false
      );

      expect(res.consistencyScore).toBeGreaterThanOrEqual(85);
      expect(res.verdict).toContain('Strong technical alignment');
      expect(res.verdict).not.toContain('You claim to be a Frontend Engineer on LinkedIn, but the majority of your GitHub code is in JavaScript');
    });

    test('correctly recognizes Backend Engineer with Python as strong alignment', () => {
      const res = evaluateDeterministicLinkedIn(
        'Backend Developer',
        'Designing scalable microservices and APIs',
        ['Python', 'Go'],
        [{ name: 'fast-api-service' }],
        false
      );

      expect(res.consistencyScore).toBeGreaterThanOrEqual(85);
      expect(res.verdict).toContain('Strong technical alignment');
    });

    test('provides constructive polyglot analysis when role and primary stack diverge', () => {
      const res = evaluateDeterministicLinkedIn(
        'iOS Swift Specialist',
        'Creating mobile apps for iOS and iPadOS',
        ['Rust', 'Go'],
        [{ name: 'rust-engine' }],
        false
      );

      expect(res.consistencyScore).toBeLessThan(85);
      expect(res.verdict).toContain('Broad polyglot profile');
      expect(res.recommendations.length).toBeGreaterThan(0);
    });

    test('supports roast mode with clever, non-insulting satire', () => {
      const res = evaluateDeterministicLinkedIn(
        'Fullstack Engineer',
        'Senior architect at stealth startup',
        ['TypeScript', 'JavaScript'],
        [{ name: 'flagship-saas' }],
        true
      );

      expect(res.verdict).toContain('claims "Fullstack Engineer"');
      expect(res.consistencyScore).toBe(82);
    });
  });
});
