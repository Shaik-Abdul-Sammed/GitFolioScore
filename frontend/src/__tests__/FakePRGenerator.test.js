import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FakePRGenerator from '../components/FakePRGenerator';

describe('FakePRGenerator', () => {
  const repos = [
    { name: 'awesome-lib', description: 'Utility library', language: 'JavaScript' },
  ];

  it('renders generated README preview and GitHub PR link', () => {
    render(<FakePRGenerator username="octocat" repos={repos} />);

    expect(screen.getByText(/Instant "1-Click PR" README Generator/i)).toBeInTheDocument();
    expect(screen.getByText(/Open Pre-filled Pull Request on GitHub/i)).toBeInTheDocument();
    expect(screen.getByText(/Copy Raw Markdown/i)).toBeInTheDocument();
  });

  it('copies generated README markdown to clipboard', () => {
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue() },
    });
    const onToast = jest.fn();

    render(<FakePRGenerator username="octocat" repos={repos} onToast={onToast} />);

    const copyBtn = screen.getByText(/Copy Raw Markdown/i);
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('# awesome-lib')
    );
    expect(onToast).toHaveBeenCalled();
  });
});
