import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GamifiedXP from '../components/GamifiedXP';
import { loadXP, clearStoredXP, DEFAULT_INITIAL_STATE } from '../lib/xpStorage';

describe('GamifiedXP', () => {
  beforeEach(() => {
    localStorage.clear();
    delete window.anna;
  });

  it('defaults to Level 0 (0 XP) for fresh user', () => {
    render(<GamifiedXP />);

    expect(screen.getByText(/LVL 0/i)).toBeInTheDocument();
    expect(screen.getByText(/Code Initiate/i)).toBeInTheDocument();
    expect(screen.getByText(/0 XP/i)).toBeInTheDocument();
  });

  it('renders level badge at 10 XP after an audit without jumping to Level 1', () => {
    render(<GamifiedXP xp={10} />);

    expect(screen.getByText(/LVL 0/i)).toBeInTheDocument();
    expect(screen.getByText(/Code Initiate/i)).toBeInTheDocument();
    expect(screen.getByText(/10 XP/i)).toBeInTheDocument();
    expect(screen.queryByText(/LVL 1/i)).not.toBeInTheDocument();
  });

  it('transitions to Level 1 only when exact 50 XP threshold is reached', () => {
    const { rerender } = render(<GamifiedXP xp={49} />);
    expect(screen.getByText(/LVL 0/i)).toBeInTheDocument();
    expect(screen.getByText(/Code Initiate/i)).toBeInTheDocument();

    rerender(<GamifiedXP xp={50} />);
    expect(screen.getByText(/LVL 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Terminal Apprentice/i)).toBeInTheDocument();
    expect(screen.getByText(/50 XP/i)).toBeInTheDocument();
  });

  it('loadXP fallback returns Level 0 default state on fresh install', async () => {
    const state = await loadXP();
    expect(state.xp).toBe(0);
    expect(state.level).toBe(0);
    expect(state.title).toBe('Code Initiate');
    expect(Number(state)).toBe(0);
    expect(DEFAULT_INITIAL_STATE).toEqual({ xp: 0, level: 0, title: 'Code Initiate' });
  });

  it('resets XP back to 0 using clearStoredXP or modal reset button', async () => {
    const onRewardXP = jest.fn();
    render(<GamifiedXP xp={75} onRewardXP={onRewardXP} />);

    const badge = screen.getByTitle(/View Gamified Developer Rank & XP/i);
    fireEvent.click(badge);

    const resetBtn = screen.getByText(/Reset XP \(Dev Test\)/i);
    expect(resetBtn).toBeInTheDocument();
    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(onRewardXP).toHaveBeenCalledWith(0, 'Reset XP');
    });

    const cleared = await clearStoredXP();
    expect(cleared).toBe(0);
  });

  it('renders level badge with current XP', () => {
    render(<GamifiedXP xp={120} />);

    expect(screen.getByText(/LVL 1/i)).toBeInTheDocument();
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
