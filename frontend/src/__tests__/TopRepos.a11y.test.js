import React from 'react';
import { render, act } from '@testing-library/react';
import TopRepos from '../components/TopRepos';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

const repos = [
  { name: 'repo1', description: 'desc', stars: 1, forks: 1, language: 'JS' },
  { name: 'repo2', description: 'desc', stars: 2, forks: 2, language: 'TS' }
];

describe('TopRepos accessibility', () => {
  it('has no a11y violations', async () => {
    let container;
    await act(async () => {
      const res = render(<TopRepos repos={repos} />);
      container = res.container;
    });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
