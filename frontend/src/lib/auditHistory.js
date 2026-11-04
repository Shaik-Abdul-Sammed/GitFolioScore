/**
 * Persistent Audit History & Portfolio Ownership Manager.
 * Stores chronological audit events with CRUD capabilities, notes, tags, and timeline delta tracking.
 */

const HISTORY_STORAGE_KEY = 'gitfolioscore_audit_history_v2';
const MY_PORTFOLIO_KEY = 'gitfolioscore_my_portfolio_username';

/**
 * Load the claimed portfolio username if any.
 */
export async function getClaimedPortfolio() {
  try {
    if (window.anna?.storage?.get) {
      const res = await window.anna.storage.get({ key: MY_PORTFOLIO_KEY });
      if (res?.value) return String(res.value).trim();
    }
  } catch {
    // Fall back to localStorage
  }

  try {
    if (typeof localStorage !== 'undefined') {
      const val = localStorage.getItem(MY_PORTFOLIO_KEY);
      if (val) return val.trim();
    }
  } catch {
    // Ignore
  }
  return null;
}

/**
 * Claim or unclaim a GitHub profile as the user's primary portfolio.
 */
export async function setClaimedPortfolio(username) {
  const clean = username ? String(username).trim().replace(/^@+/, '') : null;
  try {
    if (window.anna?.storage?.set) {
      if (clean) {
        await window.anna.storage.set({ key: MY_PORTFOLIO_KEY, value: clean });
      } else if (window.anna?.storage?.delete) {
        await window.anna.storage.delete({ key: MY_PORTFOLIO_KEY });
      }
    }
  } catch {
    // Fall back to localStorage
  }

  try {
    if (typeof localStorage !== 'undefined') {
      if (clean) {
        localStorage.setItem(MY_PORTFOLIO_KEY, clean);
      } else {
        localStorage.removeItem(MY_PORTFOLIO_KEY);
      }
    }
  } catch {
    // Ignore
  }
  return clean;
}

/**
 * Load all audit history records.
 */
export async function loadAuditHistory() {
  let list = [];
  try {
    if (window.anna?.storage?.get) {
      const res = await window.anna.storage.get({ key: HISTORY_STORAGE_KEY });
      if (res?.value && Array.isArray(res.value)) {
        list = res.value;
      }
    }
  } catch {
    // Fall back to localStorage
  }

  if (list.length === 0 && typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) list = parsed;
      }
    } catch {
      // Ignore parse errors
    }
  }

  return list;
}

/**
 * Save full list to storage.
 */
async function persistAuditHistory(list) {
  try {
    if (window.anna?.storage?.set) {
      await window.anna.storage.set({ key: HISTORY_STORAGE_KEY, value: list });
    }
  } catch {
    // Ignore
  }

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(list));
    }
  } catch {
    // Ignore
  }
}

/**
 * Record a new audit entry into history.
 */
export async function recordAuditEntry({
  username,
  profile,
  report,
  targetRole = 'Fullstack Engineer',
  roastMode = false,
  persona = 'Friendly Mentor',
  isMyPortfolio = false,
}) {
  if (!username) return null;
  const history = await loadAuditHistory();
  const cleanUsername = username.trim().replace(/^@+/, '');

  // Find previous audit for this user to compute score delta
  const previousAudit = history.find(
    (h) => (h.username || '').toLowerCase() === cleanUsername.toLowerCase()
  );
  const currentScore = report?.score || 0;
  const scoreDelta = previousAudit ? currentScore - (previousAudit.score || 0) : 0;

  const newEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    username: cleanUsername,
    name: profile?.name || cleanUsername,
    avatar_url: profile?.avatar_url || `https://avatars.githubusercontent.com/${cleanUsername}`,
    score: currentScore,
    openSourceScore: report?.openSourceScore || 0,
    targetRole: targetRole || report?.targetRole || 'Fullstack Engineer',
    roleFitScore: report?.roleFitScore || 100,
    roleFitLabel: report?.roleFitLabel || 'General Alignment',
    scoreBreakdown: report?.scoreBreakdown || {},
    roastMode: Boolean(roastMode),
    persona: persona || 'Friendly Mentor',
    isMyPortfolio: Boolean(isMyPortfolio),
    timestamp: Date.now(),
    scoreDelta,
    notes: '',
    tags: isMyPortfolio ? ['My Portfolio'] : [],
  };

  const updatedHistory = [newEntry, ...history].slice(0, 100); // keep last 100 audits
  await persistAuditHistory(updatedHistory);
  return { newEntry, history: updatedHistory, previousAudit };
}

/**
 * Update an existing audit entry's notes, tags, or portfolio claim status.
 */
export async function updateAuditEntry(id, updates = {}) {
  const history = await loadAuditHistory();
  const updated = history.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        ...updates,
        tags: Array.isArray(updates.tags) ? updates.tags : item.tags,
      };
    }
    return item;
  });
  await persistAuditHistory(updated);
  return updated;
}

/**
 * Delete a specific audit entry.
 */
export async function deleteAuditEntry(id) {
  const history = await loadAuditHistory();
  const filtered = history.filter((item) => item.id !== id);
  await persistAuditHistory(filtered);
  return filtered;
}

/**
 * Clear all audit history records.
 */
export async function clearAuditHistory() {
  await persistAuditHistory([]);
  return [];
}
