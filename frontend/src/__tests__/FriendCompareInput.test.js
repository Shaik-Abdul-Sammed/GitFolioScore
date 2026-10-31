import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FriendCompareInput from '../components/FriendCompareInput';

describe('FriendCompareInput Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders input with placeholder', () => {
    const handleChange = jest.fn();
    render(<FriendCompareInput value="" onChange={handleChange} />);
    const input = screen.getByPlaceholderText(/Friend's username/i);
    expect(input).toBeInTheDocument();
  });

  test('calls onChange when typing', () => {
    const handleChange = jest.fn();
    render(<FriendCompareInput value="" onChange={handleChange} />);
    const input = screen.getByPlaceholderText(/Friend's username/i);
    fireEvent.change(input, { target: { value: 'torvalds' } });
    expect(handleChange).toHaveBeenCalledWith('torvalds');
  });

  test('displays autocomplete suggestions with z-50 styling when results are fetched', async () => {
    const mockUsers = [
      { id: 2, login: 'torvalds', avatar_url: 'https://avatar.test/2', type: 'User' },
    ];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: mockUsers }),
    });

    const handleSelect = jest.fn();
    const { container } = render(
      <FriendCompareInput value="torvalds" onChange={jest.fn()} onSelect={handleSelect} />
    );

    await waitFor(() => {
      expect(screen.getByText('@torvalds')).toBeInTheDocument();
    });

    const dropdown = container.querySelector('.z-50');
    expect(dropdown).toBeInTheDocument();
    expect(dropdown.className).toContain('absolute');
    expect(dropdown.className).toContain('max-h-60');
    expect(dropdown.className).toContain('overflow-y-auto');

    fireEvent.click(screen.getByText('@torvalds'));
    expect(handleSelect).toHaveBeenCalledWith('torvalds');
  });
});
