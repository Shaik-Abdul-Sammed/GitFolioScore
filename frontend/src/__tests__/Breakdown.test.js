import React from 'react';
import { render, screen } from '@testing-library/react';
import Breakdown from '../components/Breakdown';

describe('Breakdown Component', () => {
  const dummyBreakdown = {
    profile: 12,
    repoQuality: 20,
    activity: 18,
    impact: 15,
    diversity: 8,
    docs: 14,
  };

  it('renders null when breakdown is missing', () => {
    const { container } = render(<Breakdown breakdown={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders breakdown items with standard category denominators', () => {
    render(<Breakdown breakdown={dummyBreakdown} />);
    expect(screen.getByText(/Score Breakdown/i)).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Repo Quality')).toBeInTheDocument();
  });

  it('respects custom role weights as denominator for category limits', () => {
    const customWeights = {
      profile: 10,
      repoQuality: 25,
      activity: 25,
      impact: 15,
      diversity: 10,
      docs: 15,
    };
    render(<Breakdown breakdown={dummyBreakdown} weights={customWeights} />);
    // Docs value 14 with max 15 and impact with max 15 should render /15
    expect(screen.getAllByText('/15').length).toBeGreaterThan(0);
  });
});
