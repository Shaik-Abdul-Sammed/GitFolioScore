import React from 'react';
import { render, screen } from '@testing-library/react';
import PortfolioWebGraph from '../components/PortfolioWebGraph';

describe('PortfolioWebGraph', () => {
  const dummyRepos = [
    { name: 'web-app', language: 'TypeScript', stars: 40 },
    { name: 'api-service', language: 'Python', stars: 15 },
  ];
  const dummyLangs = [['TypeScript', 10], ['Python', 5]];

  it('renders node graph container and nodes', () => {
    render(<PortfolioWebGraph repos={dummyRepos} languages={dummyLangs} />);
    expect(screen.getByText('Portfolio Web Connectivity')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
  });

  it('returns null when empty', () => {
    const { container } = render(<PortfolioWebGraph repos={[]} languages={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
