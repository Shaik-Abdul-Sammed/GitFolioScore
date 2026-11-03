import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FeatureHub from '../components/FeatureHub/FeatureHub';

const mockData = {
  score: 88,
  profile: {
    login: 'torvalds',
    name: 'Linus Torvalds',
    bio: 'Linux and Git creator',
    avatar_url: 'https://avatars.githubusercontent.com/u/1024025?v=4',
    followers: 200000,
    public_repos: 12,
  },
  topRepos: [
    {
      name: 'linux',
      description: 'Linux kernel source tree',
      language: 'C',
      stargazers_count: 175000,
      forks_count: 53000,
      default_branch: 'master',
      has_issues: true,
      open_issues_count: 120,
    },
    {
      name: 'git',
      description: 'Fast version control system',
      language: 'C',
      stargazers_count: 52000,
      forks_count: 25000,
      default_branch: 'master',
      has_issues: true,
      open_issues_count: 35,
    },
  ],
  mostUsedLanguages: [
    { name: 'C', percentage: 85 },
    { name: 'Shell', percentage: 15 },
  ],
};

describe('FeatureHub Component', () => {
  beforeEach(() => {
    window.anna = {
      llm: {
        complete: jest.fn().mockResolvedValue({
          text: JSON.stringify({
            estimatedBand: '$180,000 - $240,000',
            marketPercentile: 'Top 5%',
            title: 'Staff Systems Engineer',
          }),
        }),
      },
    };
  });

  afterEach(() => {
    delete window.anna;
  });

  it('renders Feature Hub header and all category tabs', () => {
    render(
      <FeatureHub
        data={mockData}
        username="torvalds"
        topRepos={mockData.topRepos}
        languages={mockData.mostUsedLanguages}
        onToast={jest.fn()}
        onRewardXP={jest.fn()}
      />
    );

    expect(screen.getByText(/DEVELOPER COMMAND CENTER · 25 PRO TOOLS/i)).toBeInTheDocument();
    expect(screen.getByText(/Feature Hub & Career Suite/i)).toBeInTheDocument();
    expect(screen.getByText(/Career & Interview Prep/i)).toBeInTheDocument();
    expect(screen.getByText(/Code & Repo Health/i)).toBeInTheDocument();
    expect(screen.getByText(/Portfolio & Branding/i)).toBeInTheDocument();
    expect(screen.getByText(/Community & Open Source/i)).toBeInTheDocument();
    expect(screen.getByText(/Advanced Analytics/i)).toBeInTheDocument();
  });

  it('allows switching tabs and displays relevant tools', () => {
    render(
      <FeatureHub
        data={mockData}
        username="torvalds"
        topRepos={mockData.topRepos}
        languages={mockData.mostUsedLanguages}
        onToast={jest.fn()}
        onRewardXP={jest.fn()}
      />
    );

    // Initial tab: Career (Mock Interviewer should be visible)
    expect(screen.getByText(/AI Mock Interviewer/i)).toBeInTheDocument();

    // Click "Code & Repo Health" tab
    const codeHealthTab = screen.getByText(/Code & Repo Health/i);
    fireEvent.click(codeHealthTab);
    expect(screen.getByText(/Dependency Vulnerability Checker/i)).toBeInTheDocument();
    expect(screen.getByText(/Open Source License Auditor/i)).toBeInTheDocument();

    // Click "Portfolio & Branding" tab
    const portfolioTab = screen.getByText(/Portfolio & Branding/i);
    fireEvent.click(portfolioTab);
    expect(screen.getByText(/Portfolio Website Generator/i)).toBeInTheDocument();

    // Click "Community & Open Source" tab
    const communityTab = screen.getByText(/Community & Open Source/i);
    fireEvent.click(communityTab);
    expect(screen.getByText(/Good First Issue Matcher/i)).toBeInTheDocument();

    // Click "Advanced Analytics" tab
    const analyticsTab = screen.getByText(/Advanced Analytics/i);
    fireEvent.click(analyticsTab);
    expect(screen.getByText(/Code Churn & Refactor Radar/i)).toBeInTheDocument();
    expect(screen.getByText(/Bus Factor Risk Calculator/i)).toBeInTheDocument();
  });

  it('filters tools based on search query', () => {
    render(
      <FeatureHub
        data={mockData}
        username="torvalds"
        topRepos={mockData.topRepos}
        languages={mockData.mostUsedLanguages}
        onToast={jest.fn()}
        onRewardXP={jest.fn()}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Search 25 tools.../i);
    fireEvent.change(searchInput, { target: { value: 'Cover Letter' } });

    expect(screen.getByText(/Tailored Cover Letter/i)).toBeInTheDocument();
    expect(screen.queryByText(/AI Mock Interviewer/i)).not.toBeInTheDocument();
  });

  it('opens and closes tool modal dialog', async () => {
    const handleRewardXP = jest.fn();
    render(
      <FeatureHub
        data={mockData}
        username="torvalds"
        topRepos={mockData.topRepos}
        languages={mockData.mostUsedLanguages}
        onToast={jest.fn()}
        onRewardXP={handleRewardXP}
      />
    );

    // Click on "Salary Band Estimator"
    const salaryCard = screen.getByText(/Salary Band Estimator/i);
    fireEvent.click(salaryCard);

    // Modal should open
    await waitFor(() => {
      expect(screen.getByText(/Market Salary & Equity Band Estimator/i)).toBeInTheDocument();
    });

    // Close modal
    const closeBtn = screen.getByLabelText(/Close modal/i);
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByText(/Market Salary & Equity Band Estimator/i)).not.toBeInTheDocument();
    });
  });
});
