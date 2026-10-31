import React from 'react';
import { render, screen } from '@testing-library/react';
import HiringReadinessGauge from '../components/HiringReadinessGauge';

describe('HiringReadinessGauge Component', () => {
  test('renders readiness index with default baseline calculation', () => {
    render(<HiringReadinessGauge githubScore={90} linkedInScore={null} />);
    expect(screen.getByText(/Hiring Readiness Index/i)).toBeInTheDocument();
    expect(screen.getByText(/GitHub Code & Repo Quality/i)).toBeInTheDocument();
    expect(screen.getByText(/LinkedIn Consistency Alignment/i)).toBeInTheDocument();
  });

  test('calculates readiness accurately when linkedInScore is provided', () => {
    // 80 * 0.7 = 56, 100 * 0.3 = 30 => readiness = 86 => "🔥 Ready to Apply"
    render(<HiringReadinessGauge githubScore={80} linkedInScore={100} />);
    expect(screen.getByText('86%')).toBeInTheDocument();
    expect(screen.getByText(/Ready to Apply/i)).toBeInTheDocument();
  });
});
