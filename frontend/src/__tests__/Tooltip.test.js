import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Tooltip from '../components/Tooltip';

describe('Tooltip Component', () => {
  test('renders children and displays tooltip on mouse enter', () => {
    render(
      <Tooltip content="Helpful explanation text">
        <button>Hover me</button>
      </Tooltip>
    );

    const trigger = screen.getByText('Hover me');
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    fireEvent.mouseEnter(trigger.parentElement);
    expect(screen.getByRole('tooltip')).toHaveTextContent('Helpful explanation text');

    fireEvent.mouseLeave(trigger.parentElement);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
