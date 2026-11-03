import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GamifiedXP from '../components/GamifiedXP';

describe('GamifiedXP', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to Level 1 (0 XP) for fresh user', () => {
    render(<GamifiedXP />);

    expect(screen.getByText(/LVL 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Code Initiate/i)).toBeInTheDocument();
    expect(screen.getByText(/0 XP/i)).toBeInTheDocument();
  });

  it('renders level badge with current XP', () => {
    render(<GamifiedXP xp={120} />);

    expect(screen.getByText(/LVL 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Terminal Apprentice/i)).toBeInTheDocument();
    expect(screen.getByText(/120 XP/i)).toBeInTheDocument();
  });

  it('opens modal with progression ladder and closes via X button', () => {
    render(<GamifiedXP xp={210} />);

    const badge = screen.getByTitle(/View Gamified Developer Rank & XP/i);
    fireEvent.click(badge);

    expect(screen.getByText(/Developer XP & Ranks/i)).toBeInTheDocument();
    expect(screen.getByText(/How to Earn Developer XP/i)).toBeInTheDocument();
    expect(screen.getByText(/Progression Ladder/i)).toBeInTheDocument();

    // Prominent X close button
    const closeBtn = screen.getByLabelText(/Close Progression Ladder/i);
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn);

    expect(screen.queryByText(/Developer XP & Ranks/i)).not.toBeInTheDocument();
  });

  it('closes modal when clicking anywhere on the dark backdrop', () => {
    render(<GamifiedXP xp={210} />);

    const badge = screen.getByTitle(/View Gamified Developer Rank & XP/i);
    fireEvent.click(badge);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog.className).toContain('fixed');
    expect(dialog.className).toContain('inset-0');
    expect(dialog.className).toContain('bg-black/60');
    expect(dialog.className).toContain('backdrop-blur-sm');
    expect(dialog.className).toContain('z-50');
    expect(dialog.className).toContain('flex items-center justify-center');

    // Click backdrop
    fireEvent.click(dialog);
    expect(screen.queryByText(/Developer XP & Ranks/i)).not.toBeInTheDocument();
  });

  it('closes modal when pressing Escape', () => {
    render(<GamifiedXP xp={210} />);

    const badge = screen.getByTitle(/View Gamified Developer Rank & XP/i);
    fireEvent.click(badge);
    expect(screen.getByText(/Developer XP & Ranks/i)).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByText(/Developer XP & Ranks/i)).not.toBeInTheDocument();
  });
});
