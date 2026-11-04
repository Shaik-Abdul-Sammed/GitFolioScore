import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResumeGenerator from '../components/ResumeGenerator';

jest.mock('../lib/llm', () => ({
  waitForAnna: jest.fn().mockResolvedValue(true),
}));

describe('ResumeGenerator Component', () => {
  const originalRevoke = URL.revokeObjectURL;
  const originalCreate = URL.createObjectURL;
  const originalAnchorClick = HTMLAnchorElement.prototype.click;

  beforeEach(() => {
    window.URL.revokeObjectURL = jest.fn();
    window.URL.createObjectURL = jest.fn(() => 'blob:https://mock-domain/mock-resume-uuid');
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
      login: 'janedoe',
      name: 'Jane Doe',
      bio: 'Senior Cloud Engineer & Architect',
      location: 'Seattle, WA',
      public_repos: 30,
    },
    topRepos: [
      { name: 'cloud-infra', language: 'Go', stargazers_count: 120, description: 'Terraform & Kubernetes automation' },
    ],
    mostUsedLanguages: ['Go', 'TypeScript', 'Python'],
    score: 92,
  };

  const mockAdvice = {
    actions: [
      { action: 'Add more unit tests' },
      { action: 'Publish architecture design RFCs' },
    ],
  };

  test('renders AI Resume Generator card and generate button', () => {
    render(<ResumeGenerator report={mockReport} advice={mockAdvice} />);
    expect(screen.getByText(/AI Resume Generator/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generate & Download PDF Resume/i })).toBeInTheDocument();
  });

  test('opens preview modal before download and confirms download', async () => {
    const onToast = jest.fn();
    render(<ResumeGenerator report={mockReport} advice={mockAdvice} onToast={onToast} />);

    const generateBtn = screen.getByRole('button', { name: /Generate & Download PDF Resume/i });
    fireEvent.click(generateBtn);

    // Verify preview modal opens
    await waitFor(() => {
      expect(screen.getByText(/Preview Before Download/i)).toBeInTheDocument();
      expect(screen.getByText(/PDF DOCUMENT/i)).toBeInTheDocument();
    });

    const confirmDownloadBtn = screen.getByRole('button', { name: /Download File/i });
    expect(confirmDownloadBtn).toBeInTheDocument();

    fireEvent.click(confirmDownloadBtn);

    await waitFor(() => {
      expect(onToast).toHaveBeenCalledWith('PDF Resume downloaded successfully!');
    });
  });
});
