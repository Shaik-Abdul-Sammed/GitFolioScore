/**
 * GitHub API client using native fetch for browser runtime.
 */

const GITHUB_API_BASE = 'https://api.github.com';

const HEADERS = {
  Accept: 'application/vnd.github+json',
};

/**
 * Custom error helper to attach error codes.
 */
function createGitHubError(message, code, originalError = null) {
  const error = new Error(message);
  error.code = code;
  if (originalError) {
    error.cause = originalError;
  }
  return error;
}

/**
 * Handle HTTP status codes and map to domain error codes.
 */
async function handleResponse(response) {
  if (response.ok) {
    return response.json();
  }

  if (response.status === 403) {
    throw createGitHubError('GitHub API rate limit exceeded. Please wait or try again later.', 'RATE_LIMIT');
  }

  if (response.status === 404) {
    throw createGitHubError('GitHub user not found.', 'NOT_FOUND');
  }

  let errorDetails = '';
  try {
    const data = await response.json();
    if (data && data.message) {
      errorDetails = `: ${data.message}`;
    }
  } catch {
    // Ignore JSON parse error on non-OK responses
  }

  throw createGitHubError(`GitHub API error (${response.status})${errorDetails}`, 'UNKNOWN');
}

/**
 * Fetch GitHub user profile.
 * @param {string} username - GitHub username.
 * @returns {Promise<object>} Parsed profile JSON.
 */
export async function fetchProfile(username) {
  const cleanUsername = username.trim();
  const url = `${GITHUB_API_BASE}/users/${encodeURIComponent(cleanUsername)}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: HEADERS,
    });
    return await handleResponse(response);
  } catch (err) {
    if (err.code) {
      throw err;
    }
    throw createGitHubError(
      'Network error connecting to GitHub API. Please check your internet connection.',
      'NETWORK',
      err
    );
  }
}

/**
 * Fetch up to 100 repositories for a user, sorted by last updated.
 * @param {string} username - GitHub username.
 * @returns {Promise<Array<object>>} Parsed repos JSON.
 */
export async function fetchRepos(username) {
  const cleanUsername = username.trim();
  const url = `${GITHUB_API_BASE}/users/${encodeURIComponent(cleanUsername)}/repos?per_page=100&sort=updated`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: HEADERS,
    });
    return await handleResponse(response);
  } catch (err) {
    if (err.code) {
      throw err;
    }
    throw createGitHubError(
      'Network error connecting to GitHub API. Please check your internet connection.',
      'NETWORK',
      err
    );
  }
}
