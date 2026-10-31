import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FriendCompareInput from '../components/FriendCompareInput';

describe('FriendCompareInput Component', () => {
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
});
