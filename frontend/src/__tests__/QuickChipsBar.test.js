import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import QuickChipsBar from '../components/QuickChipsBar';

describe('QuickChipsBar Component', () => {
  const recentProfiles = [
    { username: 'alice', score: 88 },
    { username: 'bob', score: 75 },
  ];
  const famousUsers = ['torvalds', 'gaearon'];

  test('renders chips for both recent profiles and famous usernames', () => {
    const handleSelect = jest.fn();
    render(
      <QuickChipsBar
        recentProfiles={recentProfiles}
        famousUsers={famousUsers}
        onSelect={handleSelect}
      />
    );

    expect(screen.getByText('@alice')).toBeInTheDocument();
    expect(screen.getByText('88')).toBeInTheDocument();
    expect(screen.getByText('@torvalds')).toBeInTheDocument();

    fireEvent.click(screen.getByText('@torvalds'));
    expect(handleSelect).toHaveBeenCalledWith('torvalds');
  });

  test('returns null when no profiles or famous users', () => {
    const { container } = render(<QuickChipsBar recentProfiles={[]} famousUsers={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
