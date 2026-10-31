import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GamifiedXP from '../components/GamifiedXP';

describe('GamifiedXP', () => {
  it('renders level badge with current XP', () => {
    render(<GamifiedXP xp={120} />);

    expect(screen.getByText(/LVL 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Terminal Apprentice/i)).toBeInTheDocument();
    expect(screen.getByText(/120 XP/i)).toBeInTheDocument();
  });

  it('opens modal with progression ladder when clicked', () => {
    render(<GamifiedXP xp={210} />);

    const badge = screen.getByTitle(/View Gamified Developer Rank & XP/i);
    fireEvent.click(badge);

    expect(screen.getByText(/Developer XP & Ranks/i)).toBeInTheDocument();
    expect(screen.getByText(/How to Earn Developer XP/i)).toBeInTheDocument();
    expect(screen.getByText(/Progression Ladder/i)).toBeInTheDocument();
  });
});
