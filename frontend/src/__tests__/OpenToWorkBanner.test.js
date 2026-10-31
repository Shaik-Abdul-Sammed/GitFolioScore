import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import OpenToWorkBanner from '../components/OpenToWorkBanner';

describe('OpenToWorkBanner', () => {
  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
      createLinearGradient: jest.fn().mockReturnValue({
        addColorStop: jest.fn(),
      }),
      createRadialGradient: jest.fn().mockReturnValue({
        addColorStop: jest.fn(),
      }),
      fillRect: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      roundRect: jest.fn(),
      fill: jest.fn(),
      arc: jest.fn(),
      fillText: jest.fn(),
    });
    HTMLCanvasElement.prototype.toDataURL = jest.fn().mockReturnValue('data:image/png;base64,mock');
  });

  it('renders banner preview and download button', () => {
    render(
      <OpenToWorkBanner
        username="octocat"
        score={94}
        profile={{ name: 'The Octocat', bio: 'Senior Infrastructure Engineer' }}
        repos={[{ language: 'TypeScript' }, { language: 'Go' }]}
      />
    );

    expect(screen.getByText(/"Open to Work" LinkedIn Banner Generator/i)).toBeInTheDocument();
    expect(screen.getAllByText(/OPEN TO WORK/i).length).toBeGreaterThan(0);
    expect(screen.getByText('The Octocat')).toBeInTheDocument();
    expect(screen.getByText('94')).toBeInTheDocument();
  });

  it('downloads PNG when button is clicked', () => {
    const onToast = jest.fn();
    render(
      <OpenToWorkBanner
        username="octocat"
        score={94}
        onToast={onToast}
      />
    );

    const downloadBtn = screen.getByText(/Download Banner PNG/i);
    fireEvent.click(downloadBtn);

    expect(onToast).toHaveBeenCalledWith(
      expect.stringContaining('LinkedIn banner downloaded'),
      'success'
    );
  });
});
