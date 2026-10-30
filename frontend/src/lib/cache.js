/**
 * Best-effort client cache using Anna Host API Persistent Storage (APS).
 * Keys are auto-namespaced per-(user, App).
 */

const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Retrieve cached user analysis if present and within 24h freshness.
 * @param {string} username - GitHub username.
 * @returns {Promise<{profile: object, repos: Array, report: object, cachedAt: number}|null>}
 */
export async function cacheGet(username) {
  if (!username || !window.anna?.storage?.get) {
    return null;
  }

  const cleanKey = username.trim().toLowerCase();

  try {
    const res = await window.anna.storage.get({ key: cleanKey });
    if (!res || !res.exists || !res.value) {
      return null;
    }

    const data = res.value;
    const now = Date.now();

    // Check 24-hour expiration
    if (!data.cachedAt || now - data.cachedAt > TTL_MS) {
      return null; // Expired; let subsequent set overwrite it
    }

    return data;
  } catch (err) {
    console.warn('Anna storage.get failed (continuing without cache):', err);
    return null;
  }
}

/**
 * Save user analysis result to Anna Persistent Storage.
 * @param {string} username - GitHub username.
 * @param {object} data - Object containing { profile, repos, report }.
 * @returns {Promise<void>}
 */
export async function cacheSet(username, data) {
  if (!username || !window.anna?.storage?.set) {
    return;
  }

  const cleanKey = username.trim().toLowerCase();

  try {
    const payload = {
      profile: data.profile,
      repos: data.repos,
      report: data.report,
      cachedAt: Date.now(),
    };

    await window.anna.storage.set({
      key: cleanKey,
      value: payload,
      ttl_seconds: 86400, // 24h auto-expiry in APS
    });
  } catch (err) {
    console.warn('Anna storage.set failed (non-blocking):', err);
  }
}
