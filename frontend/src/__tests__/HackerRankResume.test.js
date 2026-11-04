import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HackerRankResume from '../components/HackerRankResume';

describe('HackerRankResume Component', () => {
  const originalRevoke = URL.revokeObjectURL;
  const originalCreate = URL.createObjectURL;
  const originalAnchorClick = HTMLAnchorElement.prototype.click;

  beforeEach(() => {
    window.URL.revokeObjectURL = jest.fn();
    window.URL.createObjectURL = jest.fn(() => 'blob:https://mock-domain/mock-blob-uuid');
    if (typeof global.URL !== 'undefined') {
      global.URL.revokeObjectURL = window.URL.revokeObjectURL;
      global.URL.createObjectURL = window.URL.createObjectURL;
    }
    HTMLAnchorElement.prototype.click = jest.fn();
  });

  afterAll(() => {
    window.URL.revokeObjectURL = originalRevoke;
    window.URL.createObjectURL = originalCreate;
    if (typeof global.URL !== 'undefined') {
      global.URL.revokeObjectURL = originalRevoke;
      global.URL.createObjectURL = originalCreate;
    }
    HTMLAnchorElement.prototype.click = originalAnchorClick;
  });

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

  test('opens preview modal before download and handles download confirmation', async () => {
    const onToast = jest.fn();
    render(<HackerRankResume report={mockReport} advice={{ summary: 'Strong skills' }} onToast={onToast} />);

    const downloadBtn = screen.getByRole('button', { name: /Download HackerRank Resume \(PDF\)/i });
    fireEvent.click(downloadBtn);

    // Verify preview modal opens
    await waitFor(() => {
      expect(screen.getByText(/Preview Before Download/i)).toBeInTheDocument();
      expect(screen.getByText(/PDF DOCUMENT/i)).toBeInTheDocument();
    });

    // Verify download file button inside preview modal
    const confirmDownloadBtn = screen.getByRole('button', { name: /Download File/i });
    expect(confirmDownloadBtn).toBeInTheDocument();

    fireEvent.click(confirmDownloadBtn);

    await waitFor(() => {
      expect(onToast).toHaveBeenCalledWith('HackerRank Resume PDF downloaded successfully!');
    });
  });
});
