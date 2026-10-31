/**
 * Gamified Developer XP management backed by window.anna.storage with localStorage fallback.
 */

const STORAGE_KEY = 'gitfolioscore_xp';

export const LEVELS = [
  { level: 1, title: 'Code Initiate', minXP: 0, maxXP: 50, icon: '🌱' },
  { level: 2, title: 'Terminal Apprentice', minXP: 50, maxXP: 150, icon: '⚡' },
  { level: 3, title: 'Code Craftsperson', minXP: 150, maxXP: 300, icon: '🛠️' },
  { level: 4, title: 'Senior Repo Architect', minXP: 300, maxXP: 500, icon: '🏛️' },
  { level: 5, title: 'Legendary Open Sourcerer', minXP: 500, maxXP: 1000, icon: '👑' },
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

export async function loadXP() {
  try {
    if (window?.anna?.storage?.get) {
      const stored = await window.anna.storage.get(STORAGE_KEY);
      if (stored !== null && stored !== undefined) {
        return parseInt(stored, 10) || 0;
      }
    }
  } catch {
    // Fall back to localStorage
  }

  try {
    const local = localStorage.getItem(STORAGE_KEY);
    return parseInt(local, 10) || 20; // default start with 20 XP welcome
  } catch {
    return 20;
  }
}

export async function saveXP(newXP) {
  try {
    if (window?.anna?.storage?.set) {
      await window.anna.storage.set(STORAGE_KEY, newXP);
    }
  } catch {
    // Fall back to localStorage
  }

  try {
    localStorage.setItem(STORAGE_KEY, String(newXP));
  } catch {
    // Ignore storage errors
  }
}

export async function addXPPoints(amount) {
  const current = await loadXP();
  const updated = current + amount;
  await saveXP(updated);
  return {
    oldXP: current,
    newXP: updated,
    oldLevel: getLevelInfo(current).level,
    newLevel: getLevelInfo(updated).level,
    leveledUp: getLevelInfo(updated).level > getLevelInfo(current).level,
  };
}
