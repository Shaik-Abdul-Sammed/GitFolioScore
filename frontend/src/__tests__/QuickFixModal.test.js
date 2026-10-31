import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import QuickFixModal from '../components/QuickFixModal';

describe('QuickFixModal', () => {
  it('renders quick fix modal with issue and PR templates', () => {
    const handleClose = jest.fn();
    render(
      <QuickFixModal
        redFlag="Missing README"
        username="octocat"
        topRepos={[{ name: 'hello-world' }]}
        onClose={handleClose}
      />
    );

    expect(screen.getByText(/Quick Fix ·/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Missing README/i).length).toBeGreaterThan(0);

    // Click PR template tab
    fireEvent.click(screen.getByText('PR Description Template'));
    expect(screen.getByText(/Resolves GitFolioScore audit recommendation/i)).toBeInTheDocument();
  });
});
