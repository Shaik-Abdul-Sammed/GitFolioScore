/**
 * Leaderboard persistence helpers using window.anna.storage with localStorage fallback.
 */

const LEADERBOARD_KEY = 'gitfolio_leaderboard_v1';
const NETWORK_KEY = 'gitfolio_my_network_v1';

async function storageGet(key) {
  try {
    if (window.anna?.storage?.get) {
      const res = await window.anna.storage.get({ key });
      return res?.value ?? null;
    }
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function storageSet(key, value) {
  try {
    if (window.anna?.storage?.set) {
      await window.anna.storage.set({ key, value });
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    // best effort
  }
}

/**
 * Add or update a leaderboard entry for a user.
 */
export async function addLeaderboardEntry(username, score, languages = []) {
  const current = (await storageGet(LEADERBOARD_KEY)) || [];
  const filtered = current.filter((e) => e.username.toLowerCase() !== username.toLowerCase());
  const updated = [
    { username, score, languages, analyzedAt: Date.now() },
    ...filtered,
  ].slice(0, 50); // keep last 50
  await storageSet(LEADERBOARD_KEY, updated);
  return updated;
}

/**
 * Load the full leaderboard, sorted by score descending.
 */
export async function loadLeaderboard() {
  const data = (await storageGet(LEADERBOARD_KEY)) || [];
  return [...data].sort((a, b) => b.score - a.score);
}

/**
 * Add a username to "My Network" list.
 */
export async function addToNetwork(username, score = null) {
  const current = (await storageGet(NETWORK_KEY)) || [];
  if (current.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    return current;
  }
  const updated = [{ username, score, addedAt: Date.now() }, ...current].slice(0, 30);
  await storageSet(NETWORK_KEY, updated);
  return updated;
}

/**
 * Load the "My Network" list.
 */
export async function loadNetwork() {
  return (await storageGet(NETWORK_KEY)) || [];
}

/**
 * Remove a username from "My Network".
 */
export async function removeFromNetwork(username) {
  const current = (await storageGet(NETWORK_KEY)) || [];
  const updated = current.filter((u) => u.username.toLowerCase() !== username.toLowerCase());
  await storageSet(NETWORK_KEY, updated);
  return updated;
}
