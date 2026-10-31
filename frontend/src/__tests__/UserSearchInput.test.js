import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserSearchInput from '../components/UserSearchInput';

describe('UserSearchInput Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders input with placeholder and keyboard shortcut', () => {
    render(<UserSearchInput value="" onChange={jest.fn()} />);
    const input = screen.getByPlaceholderText(/GitHub username/i);
    expect(input).toBeInTheDocument();
    expect(screen.getByText('/')).toBeInTheDocument();
  });

  test('calls onChange when typing', () => {
    const handleChange = jest.fn();
    render(<UserSearchInput value="" onChange={handleChange} />);
    const input = screen.getByPlaceholderText(/GitHub username/i);
    fireEvent.change(input, { target: { value: 'gaearon' } });
    expect(handleChange).toHaveBeenCalledWith('gaearon');
  });

  test('displays autocomplete suggestions with z-50 styling when results are fetched', async () => {
    const mockUsers = [
      { id: 1, login: 'gaearon', avatar_url: 'https://avatar.test/1', type: 'User' },
    ];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: mockUsers }),
    });

    const handleSelect = jest.fn();
    const { container } = render(
      <UserSearchInput value="gaearon" onChange={jest.fn()} onSelect={handleSelect} />
    );

    await waitFor(() => {
      expect(screen.getByText('@gaearon')).toBeInTheDocument();
    });

    const dropdown = container.querySelector('.z-50');
    expect(dropdown).toBeInTheDocument();
    expect(dropdown.className).toContain('absolute');
    expect(dropdown.className).toContain('max-h-60');
    expect(dropdown.className).toContain('overflow-y-auto');

    fireEvent.click(screen.getByText('@gaearon'));
    expect(handleSelect).toHaveBeenCalledWith('gaearon');
  });
});
