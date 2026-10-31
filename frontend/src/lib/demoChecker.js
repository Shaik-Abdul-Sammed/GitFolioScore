/**
 * Live Demo Link Checker for repositories.
 * Checks the `homepage` URL of top repos using HEAD/GET request.
 */
export async function checkDemoLink(url) {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return { url: url || null, isLive: false, checked: false };
  }

  try {
    const res = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
    // In browser with no-cors, res.type is 'opaque' with status 0, which means network reached successfully
    const isLive = res.ok || res.type === 'opaque' || (res.status >= 200 && res.status < 400);
    return { url, isLive: !!isLive, status: res.status || 200, checked: true };
  } catch {
    // If HEAD fails due to CORS or network, attempt GET or report offline
    try {
      const res = await fetch(url, { method: 'GET', mode: 'no-cors' });
      return { url, isLive: true, status: res.status || 200, checked: true };
    } catch (err) {
      return { url, isLive: false, error: err.message, checked: true };
    }
  }
}

/**
 * Checks all demo links for a list of repositories.
 * @param {Array<object>} repos
 * @returns {Promise<Record<string, { url: string, isLive: boolean, checked: boolean }>>}
 */
export async function checkRepoDemoLinks(repos = []) {
  const results = {};
  if (!Array.isArray(repos)) return results;

  const topWithDemo = repos.slice(0, 8).filter((r) => r.homepage && r.homepage.trim() !== '');

  await Promise.all(
    topWithDemo.map(async (repo) => {
      const check = await checkDemoLink(repo.homepage);
      results[repo.name] = check;
    })
  );

  return results;
}
