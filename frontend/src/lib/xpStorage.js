/**
 * Gamified Developer XP management backed by window.anna.storage with localStorage fallback.
 * Defaults to Level 1 (0 XP) for all fresh users or cleared caches.
 */

const STORAGE_KEY = 'gitfolioscore_xp_v5';
const LEGACY_STORAGE_KEY = 'gitfolioscore_xp';
const INIT_FLAG = 'gitfolioscore_v5_init';

export const DEFAULT_INITIAL_STATE = {
  xp: 0,
  level: 0,
  title: 'Code Initiate',
};

export const LEVELS = [
  { level: 0, title: 'Code Initiate', minXP: 0, maxXP: 50, icon: '🌱', perk: 'Basic Profile Audits' },
  { level: 1, title: 'Terminal Apprentice', minXP: 50, maxXP: 150, icon: '⚡', perk: 'Role Benchmarking' },
  { level: 2, title: 'Code Craftsperson', minXP: 150, maxXP: 300, icon: '🛠️', perk: 'ATS Resume Generator' },
  { level: 3, title: 'Senior Repo Architect', minXP: 300, maxXP: 500, icon: '🏛️', perk: '1v1 VS Battle Mode' },
  { level: 4, title: 'Lead Tech Evaluator', minXP: 500, maxXP: 750, icon: '🔮', perk: 'Audit Timeline & CRUD' },
  { level: 5, title: 'Legendary Open Sourcerer', minXP: 750, maxXP: 1200, icon: '👑', perk: 'Recruiter Badge Sync' },
  { level: 6, title: 'Mythic Code Sage', minXP: 1200, maxXP: 2500, icon: '🌌', perk: 'Grandmaster Auditor' },
];

async function getAnnaStorage(key) {
  if (typeof window === 'undefined' || !window.anna?.storage?.get || !key) return null;
  try {
    const res = await window.anna.storage.get({ key: String(key) });
    if (res && typeof res === 'object') {
      if ('value' in res) {
        return res.value;
      }
    }
    return res;
  } catch {
    return null;
  }
}

async function setAnnaStorage(key, value) {
  if (typeof window === 'undefined' || !window.anna?.storage?.set || !key) return;
  try {
    const safeValue = typeof value === 'number' ? value : JSON.parse(JSON.stringify(value ?? null));
    await window.anna.storage.set({ key: String(key), value: safeValue });
  } catch {
    // Fail silently, do not spam console
  }
}

export function getLevelInfo(xp) {
  const xpVal = typeof xp === 'object' && xp !== null ? (xp.xp ?? xp.currentXP ?? Number(xp)) : xp;
  const currentXP = Math.max(0, parseInt(xpVal, 10) || 0);
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (currentXP >= LEVELS[i].minXP) {
      const lvl = LEVELS[i];
      const nextXP = lvl.maxXP;
      const progress = Math.min(100, Math.round(((currentXP - lvl.minXP) / (lvl.maxXP - lvl.minXP)) * 100));
      return {
        ...lvl,
        xp: currentXP,
        currentXP,
        nextXP,
        progress,
      };
    }
  }
  return { ...LEVELS[0], xp: 0, currentXP: 0, nextXP: 50, progress: 0 };
}

export async function clearStoredXP() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      localStorage.setItem(STORAGE_KEY, '0');
      localStorage.setItem(INIT_FLAG, 'true');
    }
  } catch {
    // Ignore storage errors
  }
  try {
    await setAnnaStorage(STORAGE_KEY, 0);
    await setAnnaStorage(LEGACY_STORAGE_KEY, 0);
  } catch {
    // Ignore storage errors
  }
  return 0;
}

export async function loadXP() {
  let storedXP = null;

  // Check if fresh install: first run should strictly initialize to Level 0 (0 XP)
  try {
    if (typeof localStorage !== 'undefined' && !localStorage.getItem(INIT_FLAG)) {
      localStorage.setItem(INIT_FLAG, 'true');
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      localStorage.setItem(STORAGE_KEY, '0');
      await setAnnaStorage(STORAGE_KEY, 0);
      await setAnnaStorage(LEGACY_STORAGE_KEY, 0);
      return {
        xp: 0,
        level: 0,
        title: 'Code Initiate',
        currentXP: 0,
        nextXP: 50,
        progress: 0,
        valueOf: () => 0,
      };
    }
  } catch {
    // Fall back to storage check
  }

  // 1. Try Anna OS storage
  try {
    const annaVal = await getAnnaStorage(STORAGE_KEY);
    if (annaVal !== null && annaVal !== undefined) {
      const parsed = parseInt(typeof annaVal === 'object' ? annaVal.xp : annaVal, 10);
      if (!Number.isNaN(parsed)) {
        storedXP = Math.max(0, parsed);
      }
    }
  } catch {
    // Fall back to localStorage
  }

  // 2. Try localStorage fallback if not found in Anna OS storage
  if (storedXP === null) {
    try {
      const local = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (local !== null && local !== undefined) {
        const parsed = parseInt(local, 10);
        if (!Number.isNaN(parsed)) {
          storedXP = Math.max(0, parsed);
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  // 3. Fallback for fresh install: explicitly Level 0 default object { xp: 0, level: 0, title: 'Code Initiate' }
  const finalXP = storedXP !== null ? storedXP : DEFAULT_INITIAL_STATE.xp;
  const levelInfo = getLevelInfo(finalXP);

  return {
    xp: finalXP,
    level: levelInfo.level,
    title: levelInfo.title,
    currentXP: finalXP,
    nextXP: levelInfo.nextXP,
    progress: levelInfo.progress,
    valueOf: () => finalXP,
  };
}

export async function loadXPState() {
  const xp = await loadXP();
  return {
    xp: Number(xp),
    level: xp.level,
    title: xp.title,
    ...getLevelInfo(xp),
  };
}

export async function saveXP(newXP) {
  const safeXP = Math.max(0, parseInt(typeof newXP === 'object' && newXP !== null ? newXP.xp : newXP, 10) || 0);

  await setAnnaStorage(STORAGE_KEY, safeXP);

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(safeXP));
    }
  } catch {
    // Ignore storage errors
  }

  return safeXP;
}

export async function addXPPoints(amount) {
  const currentNum = await loadXP();
  const current = Number(currentNum);
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
