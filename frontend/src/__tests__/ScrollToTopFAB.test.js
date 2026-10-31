import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ScrollToTopFAB from '../components/ScrollToTopFAB';

describe('ScrollToTopFAB Component', () => {
  beforeEach(() => {
    window.scrollTo = jest.fn();
    window.scrollY = 0;
  });

  test('does not render when scrollY is at top', () => {
    const { container } = render(<ScrollToTopFAB />);
    expect(container.firstChild).toBeNull();
  });

  test('renders when scrolled down and scrolls smoothly to top on click', () => {
    render(<ScrollToTopFAB />);

    act(() => {
      window.scrollY = 350;
      window.dispatchEvent(new Event('scroll'));
    });

    const fab = screen.getByRole('button', { name: /scroll to top/i });
    expect(fab).toBeInTheDocument();

    fireEvent.click(fab);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});
