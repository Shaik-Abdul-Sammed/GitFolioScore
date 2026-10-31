import { addLeaderboardEntry, loadLeaderboard, addToNetwork, loadNetwork, removeFromNetwork } from '../lib/leaderboard';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = v; },
    removeItem: (k) => { delete store[k]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

beforeEach(() => {
  localStorageMock.clear();
  delete window.anna;
});

describe('Leaderboard helpers', () => {
  it('addLeaderboardEntry inserts an entry and loadLeaderboard returns it sorted', async () => {
    await addLeaderboardEntry('octocat', 72, [{ lang: 'JavaScript' }]);
    await addLeaderboardEntry('torvalds', 91, [{ lang: 'C' }]);
    await addLeaderboardEntry('gaearon', 85, [{ lang: 'TypeScript' }]);

    const lb = await loadLeaderboard();
    expect(lb[0].username).toBe('torvalds'); // highest score first
    expect(lb[1].username).toBe('gaearon');
    expect(lb[2].username).toBe('octocat');
    expect(lb).toHaveLength(3);
  });

  it('addLeaderboardEntry updates an existing entry (upsert)', async () => {
    await addLeaderboardEntry('octocat', 60);
    await addLeaderboardEntry('octocat', 75);
    const lb = await loadLeaderboard();
    expect(lb.filter((e) => e.username === 'octocat')).toHaveLength(1);
    expect(lb[0].score).toBe(75);
  });
});

describe('Network helpers', () => {
  it('addToNetwork and loadNetwork works', async () => {
    await addToNetwork('sindresorhus', 88);
    const network = await loadNetwork();
    expect(network).toHaveLength(1);
    expect(network[0].username).toBe('sindresorhus');
    expect(network[0].score).toBe(88);
  });

  it('addToNetwork is idempotent — no duplicates', async () => {
    await addToNetwork('sindresorhus', 88);
    await addToNetwork('sindresorhus', 90);
    const network = await loadNetwork();
    expect(network).toHaveLength(1);
  });

  it('removeFromNetwork removes the entry', async () => {
    await addToNetwork('sindresorhus', 88);
    await addToNetwork('gaearon', 85);
    await removeFromNetwork('sindresorhus');
    const network = await loadNetwork();
    expect(network).toHaveLength(1);
    expect(network[0].username).toBe('gaearon');
  });
});
