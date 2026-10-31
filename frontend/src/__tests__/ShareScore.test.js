import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ShareScore from '../components/ShareScore';

describe('ShareScore', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
    });
    window.open = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders share buttons', () => {
    render(<ShareScore score={88} username="octocat" />);
    expect(screen.getByText('𝕏 Share')).toBeInTheDocument();
    expect(screen.getByText('in Share')).toBeInTheDocument();
    expect(screen.getByText(/Copy/)).toBeInTheDocument();
  });

  it('handles LinkedIn share by copying pre-filled post, opening feed, and showing toast', async () => {
    const onToast = jest.fn();
    render(<ShareScore score={92} username="octocat" onToast={onToast} />);

    const linkedInBtn = screen.getByText('in Share');
    fireEvent.click(linkedInBtn);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('I just scored 92/100 on GitFolioScore! 🚀')
      );
    });
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('https://anna.partners/apps/gitfolioscore')
    );
    expect(window.open).toHaveBeenCalledWith(
      'https://www.linkedin.com/feed/?shareActive=true',
      '_blank',
      'noopener,noreferrer'
    );
    expect(onToast).toHaveBeenCalledWith(
      'Professional LinkedIn post copied to clipboard! Just press Ctrl+V to paste.',
      'success'
    );
  });

  it('handles Copy button by copying text and showing toast', async () => {
    const onToast = jest.fn();
    render(<ShareScore score={75} username="octocat" onToast={onToast} />);

    const copyBtn = screen.getByText(/Copy/);
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('I just scored 75/100 on GitFolioScore!')
      );
    });
    expect(onToast).toHaveBeenCalledWith('Score link copied to clipboard!', 'success');
  });
});

