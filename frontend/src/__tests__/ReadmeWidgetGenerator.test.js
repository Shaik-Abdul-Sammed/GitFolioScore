import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ReadmeWidgetGenerator from '../components/ReadmeWidgetGenerator';

describe('ReadmeWidgetGenerator', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue() },
    });
  });

  it('renders badge preview and markdown snippet', () => {
    render(<ReadmeWidgetGenerator username="octocat" score={92} tier="Senior Builder" />);

    expect(screen.getByText(/"Hype" README Widget Generator/i)).toBeInTheDocument();
    expect(screen.getByText(/GitFolioScore Verified/i)).toBeInTheDocument();
    expect(screen.getByText('92')).toBeInTheDocument();
  });

  it('copies markdown snippet when clicked', () => {
    const onToast = jest.fn();
    render(<ReadmeWidgetGenerator username="octocat" score={92} onToast={onToast} />);

    const copyBtn = screen.getAllByText('Copy')[0];
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('img.shields.io/badge/GitFolioScore-92%2F100')
    );
    expect(onToast).toHaveBeenCalled();
  });
});
