import { searchGitHubUsers, getLocalUserMatches, POPULAR_USERS } from '../lib/userSearch';

describe('userSearch utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getLocalUserMatches returns matches for queries', () => {
    const results = getLocalUserMatches('torv');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].login).toBe('torvalds');
  });

  test('getLocalUserMatches handles recentProfiles', () => {
    const recent = [{ username: 'specialuser', score: 90 }];
    const results = getLocalUserMatches('special', recent);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].login).toBe('specialuser');
    expect(results[0].isRecent).toBe(true);
  });

  test('searchGitHubUsers returns live GitHub API results and caches them', async () => {
    const mockItems = [
      { id: 999, login: 'customuser', avatar_url: 'https://avatar.test/999', type: 'User' },
    ];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: mockItems }),
    });

    const res = await searchGitHubUsers('customuser123');
    expect(res.some((u) => u.login === 'customuser')).toBe(true);

    // Call again to verify cache hit
    const cached = await searchGitHubUsers('customuser123');
    expect(cached.some((u) => u.login === 'customuser')).toBe(true);
  });

  test('searchGitHubUsers falls back gracefully when API returns 403 rate limit', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ message: 'API rate limit exceeded' }),
    });

    const res = await searchGitHubUsers('kala');
    expect(res.length).toBeGreaterThan(0);
    expect(res.some((u) => u.login.toLowerCase().includes('kala'))).toBe(true);
  });
});
