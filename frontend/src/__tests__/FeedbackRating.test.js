import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FeedbackRating from '../components/FeedbackRating';

describe('FeedbackRating Component', () => {
  beforeEach(() => {
    localStorage.clear();
    window.anna = {
      storage: {
        get: jest.fn().mockResolvedValue({ value: null }),
        set: jest.fn().mockResolvedValue({ success: true }),
      },
    };
  });

  afterEach(() => {
    delete window.anna;
  });

  it('renders rating header, glowing star buttons, and feedback input', () => {
    render(<FeedbackRating username="octocat" onToast={jest.fn()} onRewardXP={jest.fn()} />);

    expect(screen.getByText(/Rate this Analysis/i)).toBeInTheDocument();
    expect(screen.getByText(/\+50 XP REWARD/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/How can we improve\?/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit Rating/i })).toBeInTheDocument();

    const starBtns = screen.getAllByRole('button', { name: /Rate \d star/i });
    expect(starBtns).toHaveLength(5);
  });

  it('allows selecting 5 stars and submitting feedback with XP reward and storage persistence', async () => {
    const handleToast = jest.fn();
    const handleRewardXP = jest.fn();

    render(
      <FeedbackRating
        username="octocat"
        onToast={handleToast}
        onRewardXP={handleRewardXP}
      />
    );

    // Select 5th star
    const fiveStarBtn = screen.getByRole('button', { name: /Rate 5 stars/i });
    fireEvent.click(fiveStarBtn);

    expect(screen.getByText(/S-Rank! Legendary Analysis/i)).toBeInTheDocument();

    // Fill in feedback
    const textarea = screen.getByPlaceholderText(/How can we improve\?/i);
    fireEvent.change(textarea, { target: { value: 'Great breakdown of my GitHub commits!' } });

    // Submit
    const submitBtn = screen.getByRole('button', { name: /Submit Rating/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleToast).toHaveBeenCalledWith('Thanks for the feedback! +50 XP', 'success');
    });

    expect(handleRewardXP).toHaveBeenCalledWith(50, 'Provided Analysis Feedback');
    expect(window.anna.storage.set).toHaveBeenCalled();

    // Verify confirmation view rendered
    expect(screen.getByText(/Feedback Received · Level Up!/i)).toBeInTheDocument();
    expect(screen.getByText(/5 \/ 5 stars/i)).toBeInTheDocument();
  });

  it('loads previously stored rating and displays confirmation state', async () => {
    window.anna.storage.get.mockResolvedValueOnce({
      value: JSON.stringify({ rating: 4, comment: 'Very useful insights' }),
    });

    render(<FeedbackRating username="octocat" onToast={jest.fn()} onRewardXP={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/Feedback Received · Level Up!/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/4 \/ 5 stars/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Update Rating/i })).toBeInTheDocument();
  });
});
