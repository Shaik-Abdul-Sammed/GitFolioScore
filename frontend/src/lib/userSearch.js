/**
 * User search utility with caching, rate-limit resilience, and curated fallback.
 * Ensures username autocomplete works smoothly even when GitHub search API rate limits.
 */

export const POPULAR_USERS = [
  { id: 1024025, login: 'torvalds', name: 'Linus Torvalds', avatar_url: 'https://avatars.githubusercontent.com/u/1024025?v=4', type: 'User' },
  { id: 810438, login: 'gaearon', name: 'Dan Abramov', avatar_url: 'https://avatars.githubusercontent.com/u/810438?v=4', type: 'User' },
  { id: 170270, login: 'sindresorhus', name: 'Sindre Sorhus', avatar_url: 'https://avatars.githubusercontent.com/u/170270?v=4', type: 'User' },
  { id: 96645398, login: 'SHAIKMUZKEER', name: 'Shaik Muzkeer', avatar_url: 'https://avatars.githubusercontent.com/u/96645398?v=4', type: 'User' },
  { id: 11831885, login: 'suffiyan', name: 'Suffiyan', avatar_url: 'https://avatars.githubusercontent.com/u/11831885?v=4', type: 'User' },
  { id: 129618451, login: 'syedfarhana2456', name: 'Syed Farhana', avatar_url: 'https://avatars.githubusercontent.com/u/129618451?v=4', type: 'User' },
  { id: 35930281, login: 'kala', name: 'Kala Organization', avatar_url: 'https://avatars.githubusercontent.com/u/35930281?v=4', type: 'Organization' },
  { id: 1555092, login: 'kalasoo', name: 'Kalasoo', avatar_url: 'https://avatars.githubusercontent.com/u/1555092?v=4', type: 'User' },
  { id: 1424084, login: 'kalaspuffar', name: 'Kalaspuffar', avatar_url: 'https://avatars.githubusercontent.com/u/1424084?v=4', type: 'User' },
  { id: 61664693, login: 'kalayciburak', name: 'Burak Kalayci', avatar_url: 'https://avatars.githubusercontent.com/u/61664693?v=4', type: 'User' },
  { id: 124599, login: 'shadcn', name: 'shadcn', avatar_url: 'https://avatars.githubusercontent.com/u/124599?v=4', type: 'User' },
  { id: 11247099, login: 'antfu', name: 'Anthony Fu', avatar_url: 'https://avatars.githubusercontent.com/u/11247099?v=4', type: 'User' },
  { id: 499550, login: 'yyx990803', name: 'Evan You', avatar_url: 'https://avatars.githubusercontent.com/u/499550?v=4', type: 'User' },
  { id: 1162160, login: 'rich-harris', name: 'Rich Harris', avatar_url: 'https://avatars.githubusercontent.com/u/1162160?v=4', type: 'User' },
  { id: 1500684, login: 'kentcdodds', name: 'Kent C. Dodds', avatar_url: 'https://avatars.githubusercontent.com/u/1500684?v=4', type: 'User' },
  { id: 25254, login: 'tj', name: 'TJ Holowaychuk', avatar_url: 'https://avatars.githubusercontent.com/u/25254?v=4', type: 'User' },
  { id: 110953, login: 'addyosmani', name: 'Addy Osmani', avatar_url: 'https://avatars.githubusercontent.com/u/110953?v=4', type: 'User' },
  { id: 150330, login: 'getify', name: 'Kyle Simpson', avatar_url: 'https://avatars.githubusercontent.com/u/150330?v=4', type: 'User' },
  { id: 583231, login: 'octocat', name: 'The Octocat', avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4', type: 'User' },
  { id: 69631, login: 'facebook', name: 'Meta', avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4', type: 'Organization' },
  { id: 1342004, login: 'google', name: 'Google', avatar_url: 'https://avatars.githubusercontent.com/u/1342004?v=4', type: 'Organization' },
  { id: 14985020, login: 'vercel', name: 'Vercel', avatar_url: 'https://avatars.githubusercontent.com/u/14985020?v=4', type: 'Organization' }
];

const memoryCache = new Map();

/**
 * Filter local matching users from popular and recent lists
 */
export function getLocalUserMatches(query, recentProfiles = []) {
  const clean = (query || '').trim().toLowerCase().replace(/^@+/, '');
  if (!clean || clean.length < 1) return [];

  const seen = new Set();
  const results = [];

  // 1. Check recent profiles first
  if (Array.isArray(recentProfiles)) {
    recentProfiles.forEach((p) => {
      const uname = (p.username || p.login || '').trim();
      if (!uname) return;
      const key = uname.toLowerCase();
      if (key.includes(clean) && !seen.has(key)) {
        seen.add(key);
        results.push({
          id: p.id || `recent-${key}`,
          login: uname,
          name: p.name || `Score: ${p.score || 0}`,
          avatar_url: p.avatar_url || `https://avatars.githubusercontent.com/${uname}`,
          type: p.type || 'User',
          isRecent: true,
        });
      }
    });
  }

  // 2. Check curated popular developers
  POPULAR_USERS.forEach((user) => {
    const loginLower = user.login.toLowerCase();
    const nameLower = (user.name || '').toLowerCase();
    if ((loginLower.includes(clean) || nameLower.includes(clean)) && !seen.has(loginLower)) {
      seen.add(loginLower);
      results.push(user);
    }
  });

  return results;
}

/**
 * Fetch GitHub users with cache & fallback.
 */
export async function searchGitHubUsers(query, { signal, recentProfiles = [] } = {}) {
  const clean = (query || '').trim().replace(/^@+/, '');
  if (!clean || clean.length < 2) {
    return [];
  }

  const cacheKey = clean.toLowerCase();
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey);
  }

  const localMatches = getLocalUserMatches(clean, recentProfiles);

  try {
    const res = await fetch(
      `https://api.github.com/search/users?q=${encodeURIComponent(clean)}&per_page=6`,
      {
        headers: { Accept: 'application/vnd.github.v3+json' },
        signal,
      }
    );

    if (res.ok) {
      const data = await res.json();
      const apiItems = Array.isArray(data.items) ? data.items : [];

      // Merge API items with local matches
      const seen = new Set();
      const merged = [];

      // API items first
      apiItems.forEach((item) => {
        const key = item.login.toLowerCase();
        seen.add(key);
        // Enrich with local name if available
        const local = localMatches.find((l) => l.login.toLowerCase() === key);
        merged.push({
          ...item,
          name: local?.name || item.name || '',
        });
      });

      // Add remaining local matches
      localMatches.forEach((item) => {
        const key = item.login.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          merged.push(item);
        }
      });

      const finalResults = merged.slice(0, 8);
      memoryCache.set(cacheKey, finalResults);
      return finalResults;
    }
  } catch (err) {
    if (err.name === 'AbortError') throw err;
  }

  // Fallback: If API was rate limited or failed, return local matches + typed username
  const fallback = [...localMatches];
  const hasExact = fallback.some((u) => u.login.toLowerCase() === clean.toLowerCase());
  if (!hasExact && clean.length >= 2) {
    fallback.unshift({
      id: `query-${clean.toLowerCase()}`,
      login: clean,
      name: '',
      avatar_url: `https://avatars.githubusercontent.com/${clean}`,
      type: 'User',
    });
  }

  return fallback.slice(0, 8);
}
