import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LinkedInSync, { evaluateDeterministicLinkedIn, validateLinkedInInput } from '../components/LinkedInSync';

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

  test('switches to No LinkedIn mode and generates profile kickstart from GitHub', () => {
    render(<LinkedInSync report={mockReport} />);
    const trigger = screen.getByRole('button', { name: /Expand LinkedIn Sync/i });
    fireEvent.click(trigger);

    const noLinkedInBtn = screen.getByRole('button', { name: /No LinkedIn\? Target Role Mode/i });
    expect(noLinkedInBtn).toBeInTheDocument();
    fireEvent.click(noLinkedInBtn);

    expect(screen.getByText(/No LinkedIn account\? No problem!/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Frontend Engineer, Cloud Architect/i)).toBeInTheDocument();

    const generateProfileBtn = screen.getByRole('button', { name: /Launch: Generate LinkedIn from GitHub/i });
    expect(generateProfileBtn).toBeInTheDocument();
    fireEvent.click(generateProfileBtn);

    expect(screen.getByText(/Your Generated LinkedIn Profile Presence:/i)).toBeInTheDocument();
    expect(screen.getByText(/Suggested Headline:/i)).toBeInTheDocument();
    expect(screen.getByText(/Suggested About Summary:/i)).toBeInTheDocument();
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

  describe('validateLinkedInInput & Gibberish Protection', () => {
    test('catches keyboard mashing and vowel-free strings like gjvnszvbcjxz', () => {
      const roleCheck = validateLinkedInInput('gjvnszvbcjxz', '');
      expect(roleCheck.valid).toBe(false);
      expect(roleCheck.message).toContain('Invalid role text');

      const textCheck = validateLinkedInInput('', 'gjvnszvbcjxz');
      expect(textCheck.valid).toBe(false);
      expect(textCheck.message).toContain('unreadable or random characters');
    });

    test('rejects empty input when not in no-LinkedIn mode', () => {
      const emptyCheck = validateLinkedInInput('', '', false);
      expect(emptyCheck.valid).toBe(false);
      expect(emptyCheck.message).toContain('Please provide either');
    });

    test('allows legitimate professional job titles and bios', () => {
      const validRole = validateLinkedInInput('Frontend Engineer', '');
      expect(validRole.valid).toBe(true);

      const validSummary = validateLinkedInInput('', 'Software engineer with 4 years experience building React and Node.js applications.');
      expect(validSummary.valid).toBe(true);

      const validBoth = validateLinkedInInput('DevOps & Cloud Engineer', 'Passionate about Kubernetes, Docker, and automated CI/CD pipelines.');
      expect(validBoth.valid).toBe(true);
    });

    test('displays error message in UI and blocks step 2 when gibberish is entered', () => {
      render(<LinkedInSync report={mockReport} />);
      const trigger = screen.getByRole('button', { name: /Expand LinkedIn Sync/i });
      fireEvent.click(trigger);

      const input = screen.getByPlaceholderText(/Senior Fullstack Engineer/i);
      fireEvent.change(input, { target: { value: 'gjvnszvbcjxz' } });

      const auditBtn = screen.getByRole('button', { name: /Audit Consistency Score/i });
      fireEvent.click(auditBtn);

      expect(screen.getByText(/Invalid role text/i)).toBeInTheDocument();
      // Verifies Step 2 is blocked (Consistency Score breakdown is not rendered)
      expect(screen.queryByText(/Consistency Score/i)).not.toBeInTheDocument();
    });
  });
});
