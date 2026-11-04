/**
 * Gamified Developer XP management backed by window.anna.storage with localStorage fallback.
 * Defaults to Level 1 (0 XP) for all fresh users or cleared caches.
 */

const STORAGE_KEY = 'gitfolioscore_xp';
const RESET_FLAG = 'gitfolioscore_xp_reset_to_zero_v2';

export const LEVELS = [
  { level: 1, title: 'Code Initiate', minXP: 0, maxXP: 50, icon: '🌱', perk: 'Basic Profile Audits' },
  { level: 2, title: 'Terminal Apprentice', minXP: 50, maxXP: 150, icon: '⚡', perk: 'Role Benchmarking' },
  { level: 3, title: 'Code Craftsperson', minXP: 150, maxXP: 300, icon: '🛠️', perk: 'ATS Resume Generator' },
  { level: 4, title: 'Senior Repo Architect', minXP: 300, maxXP: 500, icon: '🏛️', perk: '1v1 VS Battle Mode' },
  { level: 5, title: 'Lead Tech Evaluator', minXP: 500, maxXP: 750, icon: '🔮', perk: 'Audit Timeline & CRUD' },
  { level: 6, title: 'Legendary Open Sourcerer', minXP: 750, maxXP: 1200, icon: '👑', perk: 'Recruiter Badge Sync' },
  { level: 7, title: 'Mythic Code Sage', minXP: 1200, maxXP: 2500, icon: '🌌', perk: 'Grandmaster Auditor' },
];

export function getLevelInfo(xp) {
  const currentXP = Math.max(0, parseInt(xp, 10) || 0);
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (currentXP >= LEVELS[i].minXP) {
      const lvl = LEVELS[i];
      const nextXP = lvl.maxXP;
      const progress = Math.min(100, Math.round(((currentXP - lvl.minXP) / (lvl.maxXP - lvl.minXP)) * 100));
      return {
        ...lvl,
        currentXP,
        nextXP,
        progress,
      };
    }
  }
  return { ...LEVELS[0], currentXP, nextXP: 50, progress: 0 };
}

export async function clearStoredXP() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
  try {
    if (window?.anna?.storage?.set) {
      await window.anna.storage.set(STORAGE_KEY, 0);
    }
  } catch {
    // Ignore storage errors
  }
  return 0;
}

export async function loadXP() {
  // One-time cleanup: force-clear any old cached XP key so user resets to Level 1 (0 XP)
  try {
    if (typeof localStorage !== 'undefined' && !localStorage.getItem(RESET_FLAG)) {
      localStorage.setItem(RESET_FLAG, 'true');
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(STORAGE_KEY, '0');
      if (window?.anna?.storage?.set) {
        window.anna.storage.set(STORAGE_KEY, 0).catch(() => {});
      }
      return 0;
    }
  } catch {
    // Ignore
  }

  try {
    if (window?.anna?.storage?.get) {
      const stored = await window.anna.storage.get(STORAGE_KEY);
      if (stored !== null && stored !== undefined) {
        return Math.max(0, parseInt(stored, 10) || 0);
      }
    }
  } catch {
    // Fall back to localStorage
  }

  try {
    const local = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (local !== null && local !== undefined) {
      return Math.max(0, parseInt(local, 10) || 0);
    }
    return 0; // Fresh user starts at Level 1 (0 XP)
  } catch {
    return 0;
  }
}

export async function saveXP(newXP) {
  const safeXP = Math.max(0, parseInt(newXP, 10) || 0);
  try {
    if (window?.anna?.storage?.set) {
      await window.anna.storage.set(STORAGE_KEY, safeXP);
    }
  } catch {
    // Fall back to localStorage
  }

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(safeXP));
    }
  } catch {
    // Ignore storage errors
  }
}

export async function addXPPoints(amount) {
  const current = await loadXP();
  const updated = current + Math.max(0, parseInt(amount, 10) || 0);
  await saveXP(updated);
  return {
    oldXP: current,
    newXP: updated,
    oldLevel: getLevelInfo(current).level,
    newLevel: getLevelInfo(updated).level,
    leveledUp: getLevelInfo(updated).level > getLevelInfo(current).level,
  };
}
