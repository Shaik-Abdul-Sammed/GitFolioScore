import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ToastContainer from '../components/Toast';

describe('ToastContainer Component', () => {
  test('renders nothing when toasts array is empty', () => {
    const { container } = render(<ToastContainer toasts={[]} onDismiss={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  test('renders toast messages and triggers onDismiss when close clicked', () => {
    const handleDismiss = jest.fn();
    const toasts = [
      { id: '1', message: 'Copied to clipboard!', type: 'success' },
      { id: '2', message: 'Network error occurred', type: 'error' },
    ];

    render(<ToastContainer toasts={toasts} onDismiss={handleDismiss} />);

    expect(screen.getByText('Copied to clipboard!')).toBeInTheDocument();
    expect(screen.getByText('Network error occurred')).toBeInTheDocument();

    const dismissButtons = screen.getAllByRole('button', { name: /dismiss notification/i });
    fireEvent.click(dismissButtons[0]);
    expect(handleDismiss).toHaveBeenCalledWith('1');
  });
});
