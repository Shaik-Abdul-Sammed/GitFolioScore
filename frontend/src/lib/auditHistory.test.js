import {
  loadAuditHistory,
  recordAuditEntry,
  updateAuditEntry,
  deleteAuditEntry,
  clearAuditHistory,
  getClaimedPortfolio,
  setClaimedPortfolio,
} from './auditHistory';

describe('auditHistory.js - CRUD & Timeline Storage', () => {
  beforeEach(async () => {
    localStorage.clear();
    await clearAuditHistory();
  });

  it('records a new audit entry and calculates score delta correctly', async () => {
    const report1 = {
      score: 75,
      openSourceScore: 60,
      targetRole: 'Frontend Engineer',
      roleFitScore: 90,
      roleFitLabel: 'Target Role Specialist',
      scoreBreakdown: { profile: 15, repoQuality: 20 },
    };

    const res1 = await recordAuditEntry({
      username: 'torvalds',
      profile: { name: 'Linus Torvalds' },
      report: report1,
      targetRole: 'Frontend Engineer',
    });

    expect(res1.newEntry.username).toBe('torvalds');
    expect(res1.newEntry.score).toBe(75);
    expect(res1.newEntry.scoreDelta).toBe(0); // initial audit

    // Second audit for same user with improved score
    const report2 = { ...report1, score: 82 };
    const res2 = await recordAuditEntry({
      username: 'torvalds',
      profile: { name: 'Linus Torvalds' },
      report: report2,
      targetRole: 'DevOps & Cloud Engineer',
    });

    expect(res2.newEntry.score).toBe(82);
    expect(res2.newEntry.scoreDelta).toBe(7); // +7 score delta!
  });

  it('updates an existing audit entry notes and tags', async () => {
    const report = { score: 80 };
    const { newEntry } = await recordAuditEntry({
      username: 'gaearon',
      profile: { name: 'Dan Abramov' },
      report,
    });

    const updated = await updateAuditEntry(newEntry.id, {
      notes: 'Reviewed before technical interview',
      tags: ['Interview', 'FAANG'],
    });

    const item = updated.find((i) => i.id === newEntry.id);
    expect(item.notes).toBe('Reviewed before technical interview');
    expect(item.tags).toEqual(['Interview', 'FAANG']);
  });

  it('deletes an audit entry by ID', async () => {
    const { newEntry: entry1 } = await recordAuditEntry({
      username: 'user-one',
      report: { score: 60 },
    });
    const { newEntry: entry2 } = await recordAuditEntry({
      username: 'user-two',
      report: { score: 70 },
    });

    let history = await loadAuditHistory();
    expect(history.length).toBe(2);

    history = await deleteAuditEntry(entry1.id);
    expect(history.length).toBe(1);
    expect(history[0].id).toBe(entry2.id);
  });

  it('claims and unclaims a portfolio correctly', async () => {
    expect(await getClaimedPortfolio()).toBeNull();

    await setClaimedPortfolio('my-username');
    expect(await getClaimedPortfolio()).toBe('my-username');

    await setClaimedPortfolio(null);
    expect(await getClaimedPortfolio()).toBeNull();
  });
});
