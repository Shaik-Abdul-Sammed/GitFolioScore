import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import WeightsForm, { DEFAULT_WEIGHTS } from '../components/WeightsForm';

describe('WeightsForm', () => {
  it('renders all weight fields and updates values', () => {
    const initialWeights = {
      profile: 15,
      repoQuality: 25,
      activity: 20,
      impact: 20,
      diversity: 10,
      docs: 10,
    };
    const setWeights = jest.fn();
    render(<WeightsForm weights={initialWeights} setWeights={setWeights} />);

    // Check that the component renders by checking for labels using exact text
    expect(screen.getByLabelText(/Profile/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Repo Quality/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Activity/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Impact/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Diversity/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Documentation/)).toBeInTheDocument();

    // Simulate change on profile field
    const input = screen.getByLabelText(/Profile/);
    fireEvent.change(input, { target: { value: '30' } });
    expect(setWeights).toHaveBeenCalled();
  });

  it('renders in modal mode with backdrop and closes when close button clicked', () => {
    const onClose = jest.fn();
    render(
      <WeightsForm
        weights={DEFAULT_WEIGHTS}
        setWeights={jest.fn()}
        isModal={true}
        onClose={onClose}
      />
    );

    expect(screen.getByText('Custom Scoring Weights')).toBeInTheDocument();
    const closeBtn = screen.getByLabelText('Close weights modal');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('resets weights to default when reset button is clicked', () => {
    const setWeights = jest.fn();
    render(
      <WeightsForm
        weights={{ profile: 30, repoQuality: 10, activity: 10, impact: 20, diversity: 10, docs: 20 }}
        setWeights={setWeights}
      />
    );

    const resetBtn = screen.getByText('Reset to Default');
    fireEvent.click(resetBtn);
    expect(setWeights).toHaveBeenCalledWith(DEFAULT_WEIGHTS);
  });
});
