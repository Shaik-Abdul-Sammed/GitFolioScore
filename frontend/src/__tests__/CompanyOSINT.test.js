import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CompanyOSINT from '../components/CompanyOSINT';

describe('CompanyOSINT', () => {
  const mockData = { score: 82, totalStars: 24 };
  const mockRepos = [
    { name: 'app-engine', language: 'TypeScript', stargazers_count: 14 },
  ];

  it('renders initial company selector', () => {
    render(<CompanyOSINT username="octocat" data={mockData} repos={mockRepos} />);

    expect(screen.getByText(/AI Target Company OSINT & Gap Analysis/i)).toBeInTheDocument();
    expect(screen.getByText(/Run OSINT Audit/i)).toBeInTheDocument();
  });

  it('runs analysis and displays company match and gaps', async () => {
    window.anna = {
      llm: {
        complete: jest.fn().mockResolvedValue({
          text: JSON.stringify({
            matchPercent: 78,
            barVerdict: 'Strong frontend skills, needs CI/CD testing pipeline.',
            companyFits: ['Clean TypeScript usage'],
            criticalGaps: ['Missing unit test coverage in repo'],
            actionPlan30Days: ['Add Jest test suite'],
          }),
        }),
      },
    };

    render(<CompanyOSINT username="octocat" data={mockData} repos={mockRepos} />);

    const runBtn = screen.getByText(/Run OSINT Audit/i);
    fireEvent.click(runBtn);

    await waitFor(() => {
      expect(screen.getByText(/Strong frontend skills/i)).toBeInTheDocument();
    });

    expect(screen.getByText('78%')).toBeInTheDocument();
    expect(screen.getByText(/Missing unit test coverage in repo/i)).toBeInTheDocument();
  });
});
