import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TerminalEasterEgg from '../components/TerminalEasterEgg';

describe('TerminalEasterEgg', () => {
  it('renders floating terminal button and opens on click', () => {
    render(<TerminalEasterEgg username="octocat" score={85} />);
    const btn = screen.getByTitle('Open Developer Terminal Easter Egg');
    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);
    expect(screen.getByText(/GitFolioScore Interactive Terminal/i)).toBeInTheDocument();
  });

  it('handles help command', () => {
    render(<TerminalEasterEgg username="octocat" score={85} />);
    fireEvent.click(screen.getByTitle('Open Developer Terminal Easter Egg'));

    const input = screen.getByPlaceholderText(/type a command/i);
    fireEvent.change(input, { target: { value: 'help' } });
    fireEvent.submit(input.closest('form'));

    expect(screen.getByText(/Available commands:/i)).toBeInTheDocument();
  });

  it('handles sudo make me a sandwich command', async () => {
    window.anna = {
      llm: {
        complete: jest.fn().mockResolvedValue({
          text: 'Okay. 🥪 [AI Sandwich Created with root permissions!]',
        }),
      },
    };

    render(<TerminalEasterEgg username="octocat" score={85} />);
    fireEvent.click(screen.getByTitle('Open Developer Terminal Easter Egg'));

    const input = screen.getByPlaceholderText(/type a command/i);
    fireEvent.change(input, { target: { value: 'sudo make me a sandwich' } });
    fireEvent.submit(input.closest('form'));

    await waitFor(() => {
      expect(screen.getByText(/AI Sandwich/i)).toBeInTheDocument();
    });
  });
});
