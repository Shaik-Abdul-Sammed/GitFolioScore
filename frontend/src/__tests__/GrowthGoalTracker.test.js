import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GrowthGoalTracker from '../components/GrowthGoalTracker';

describe('GrowthGoalTracker', () => {
  const defaultProps = {
    score: 45,
    username: 'testuser',
    onReAudit: jest.fn(),
    onToast: jest.fn(),
  };

  it('renders current score and growth goal UI', () => {
    render(<GrowthGoalTracker {...defaultProps} />);
    expect(screen.getByText('Track My Growth')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('Current Score')).toBeInTheDocument();
    expect(screen.getByText('Your Goal')).toBeInTheDocument();
  });

  it('shows the re-audit button and calls onReAudit when clicked', () => {
    render(<GrowthGoalTracker {...defaultProps} />);
    const btn = screen.getByText('Re-audit Now');
    fireEvent.click(btn);
    expect(defaultProps.onReAudit).toHaveBeenCalledTimes(1);
  });

  it('shows reminder button and fires onToast when clicked', () => {
    render(<GrowthGoalTracker {...defaultProps} />);
    const btn = screen.getByText(/Remind me to re-audit/i);
    fireEvent.click(btn);
    expect(defaultProps.onToast).toHaveBeenCalled();
  });

  it('allows selecting a goal option', () => {
    render(<GrowthGoalTracker {...defaultProps} />);
    // The "+20 pts" button text matches the goal option button
    const opts = screen.getAllByText(/\+20 pts/i);
    // Click the first match (the goal button)
    fireEvent.click(opts[0]);
    // Target score (45 + 20 = 65) should be displayed in the goal box
    const goalBoxes = screen.getAllByText('65');
    expect(goalBoxes.length).toBeGreaterThanOrEqual(1);
  });
});
