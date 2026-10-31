import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ScoreSimulator from '../components/ScoreSimulator';

describe('ScoreSimulator', () => {
  const mockData = {
    score: 75,
    repos: [
      { name: 'repo-1', stargazers_count: 5, description: 'test repo' },
      { name: 'repo-2', stargazers_count: 10, description: 'second repo' },
    ],
    profile: { bio: 'developer', avatar_url: 'http://test' },
    readmeCount: 1,
    detailedReadmeCount: 1,
  };

  it('renders simulator with initial score and sliders', () => {
    render(<ScoreSimulator data={mockData} weights={{ profile: 15, repoQuality: 25, activity: 20, impact: 20, diversity: 10, docs: 10 }} />);

    expect(screen.getByText(/"What-If" Score Simulator/i)).toBeInTheDocument();
    expect(screen.getByText('Current Score')).toBeInTheDocument();
    expect(screen.getAllByText('75').length).toBeGreaterThanOrEqual(1);
  });

  it('updates projected score when dragging stars slider', () => {
    render(<ScoreSimulator data={mockData} weights={{ profile: 15, repoQuality: 25, activity: 20, impact: 20, diversity: 10, docs: 10 }} />);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '50' } });

    expect(screen.getByText(/Projected Score/i)).toBeInTheDocument();
    expect(screen.getByText(/\+50 ⭐/i)).toBeInTheDocument();
  });

  it('resets simulator state when reset button is clicked', () => {
    render(<ScoreSimulator data={mockData} />);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '80' } });
    expect(screen.getByText(/\+80 ⭐/i)).toBeInTheDocument();

    const resetBtn = screen.getByText('Reset');
    fireEvent.click(resetBtn);

    expect(screen.getByText(/\+0 ⭐/i)).toBeInTheDocument();
  });
});
