import React from 'react';
import { render, screen } from '@testing-library/react';
import SkeletonLoader from '../components/SkeletonLoader';

describe('SkeletonLoader Component', () => {
  test('renders skeleton screen with accessible label', () => {
    render(<SkeletonLoader />);
    expect(screen.getByLabelText(/loading portfolio analysis/i)).toBeInTheDocument();
  });
});
