import { fetchProfile, fetchRepos } from './github';

describe('github.js - API Fetching', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  describe('Happy Path', () => {
    it('fetches profile successfully and returns parsed JSON', async () => {
      const mockProfile = {
        login: 'octocat',
        name: 'The Octocat',
        bio: 'Open source enthusiast',
        public_repos: 8,
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockProfile),
      });

      const profile = await fetchProfile('octocat');

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.github.com/users/octocat',
        expect.objectContaining({
          method: 'GET',
          headers: { Accept: 'application/vnd.github+json' },
        })
      );
      expect(profile).toEqual(mockProfile);
    });

    it('fetches repos successfully and returns parsed JSON array', async () => {
      const mockRepos = [
        { id: 1, name: 'repo-one', stargazers_count: 10 },
        { id: 2, name: 'repo-two', stargazers_count: 25 },
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockRepos),
      });

      const repos = await fetchRepos('octocat');

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.github.com/users/octocat/repos?per_page=100&sort=updated',
        expect.objectContaining({
          method: 'GET',
          headers: { Accept: 'application/vnd.github+json' },
        })
      );
      expect(repos).toEqual(mockRepos);
    });
  });

  describe('Rate Limited User', () => {
    it('throws error with code RATE_LIMIT on HTTP 403 response for fetchProfile', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: jest.fn().mockResolvedValue({ message: 'API rate limit exceeded' }),
      });

      await expect(fetchProfile('octocat')).rejects.toMatchObject({
        code: 'RATE_LIMIT',
        message: expect.stringMatching(/rate limit/i),
      });
    });

    it('throws error with code RATE_LIMIT on HTTP 403 response for fetchRepos', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: jest.fn().mockResolvedValue({ message: 'API rate limit exceeded' }),
      });

      await expect(fetchRepos('octocat')).rejects.toMatchObject({
        code: 'RATE_LIMIT',
        message: expect.stringMatching(/rate limit/i),
      });
    });
  });

  describe('Non-Existent User', () => {
    it('throws error with code NOT_FOUND on HTTP 404 response for fetchProfile', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: jest.fn().mockResolvedValue({ message: 'Not Found' }),
      });

      await expect(fetchProfile('nonexistent_user_9999')).rejects.toMatchObject({
        code: 'NOT_FOUND',
        message: expect.stringMatching(/user not found/i),
      });
    });

    it('throws error with code NOT_FOUND on HTTP 404 response for fetchRepos', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: jest.fn().mockResolvedValue({ message: 'Not Found' }),
      });

      await expect(fetchRepos('nonexistent_user_9999')).rejects.toMatchObject({
        code: 'NOT_FOUND',
        message: expect.stringMatching(/user not found/i),
      });
    });
  });

  describe('Network Failure', () => {
    it('throws error with code NETWORK when fetch rejects for fetchProfile', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Failed to fetch'));

      await expect(fetchProfile('octocat')).rejects.toMatchObject({
        code: 'NETWORK',
        message: expect.stringMatching(/network error/i),
      });
    });

    it('throws error with code NETWORK when fetch rejects for fetchRepos', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('DNS resolution error'));

      await expect(fetchRepos('octocat')).rejects.toMatchObject({
        code: 'NETWORK',
        message: expect.stringMatching(/network error/i),
      });
    });
  });
});
