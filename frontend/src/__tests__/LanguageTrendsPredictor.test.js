import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LanguageTrendsPredictor from '../components/LanguageTrendsPredictor';

describe('LanguageTrendsPredictor', () => {
  const repos = [
    { name: 'repo-js', language: 'JavaScript' },
    { name: 'repo-py', language: 'Python' },
  ];

  it('renders tech stack and predict button', () => {
    render(<LanguageTrendsPredictor repos={repos} username="octocat" />);

    expect(screen.getByText(/Predictive 3-Year Language Trends/i)).toBeInTheDocument();
    expect(screen.getByText(/Forecast Tech Trends/i)).toBeInTheDocument();
  });

  it('forecasts trends and highlights recommended language', async () => {
    window.anna = {
      llm: {
        complete: jest.fn().mockResolvedValue({
          text: JSON.stringify({
            obsolescenceRisk: 'Plain script tags declining.',
            surgingSkill: 'Rust and WebAssembly surging.',
            recommendedNext: 'Rust',
            recommendedReason: 'Provides memory safety and high throughput.',
            marketValueForecast: 'High growth in cloud infra.',
          }),
        }),
      },
    };

    render(<LanguageTrendsPredictor repos={repos} username="octocat" />);

    const forecastBtn = screen.getByText(/Forecast Tech Trends/i);
    fireEvent.click(forecastBtn);

    await waitFor(() => {
      expect(screen.getByText(/Rust and WebAssembly surging/i)).toBeInTheDocument();
    });

    expect(screen.getByText('Rust')).toBeInTheDocument();
    expect(screen.getByText(/Provides memory safety/i)).toBeInTheDocument();
  });
});
