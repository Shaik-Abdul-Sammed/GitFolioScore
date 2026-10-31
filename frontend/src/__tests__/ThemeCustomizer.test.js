import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeCustomizer from '../components/ThemeCustomizer';

describe('ThemeCustomizer Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders theme customizer trigger button', () => {
    render(<ThemeCustomizer />);
    const trigger = screen.getByRole('button', { name: /Customize Theme Accent/i });
    expect(trigger).toBeInTheDocument();
  });

  test('opens palette dropdown and allows selecting an accent', () => {
    render(<ThemeCustomizer />);
    const trigger = screen.getByRole('button', { name: /Customize Theme Accent/i });
    fireEvent.click(trigger);

    expect(screen.getByTitle('Indigo')).toBeInTheDocument();
    expect(screen.getByTitle('Emerald')).toBeInTheDocument();
    expect(screen.getByTitle('Rose')).toBeInTheDocument();
    expect(screen.getByTitle('Amber')).toBeInTheDocument();

    fireEvent.click(screen.getByTitle('Emerald'));
    expect(localStorage.getItem('gitfolio_theme_accent')).toBe('emerald');
  });
});
