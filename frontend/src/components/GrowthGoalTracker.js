import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, RefreshCw, CheckCircle2, ChevronRight, Bell } from 'lucide-react';

const TIERS = [
  { min: 0,  max: 29,  name: 'Early-Stage Coder',     color: '#ef4444', next: 30 },
  { min: 30, max: 49,  name: 'Junior Developer',       color: '#f97316', next: 50 },
  { min: 50, max: 64,  name: 'Mid-Level Engineer',     color: '#f59e0b', next: 65 },
  { min: 65, max: 79,  name: 'Senior Contributor',     color: '#3b82f6', next: 80 },
  { min: 80, max: 89,  name: 'Tech Lead Material',     color: '#8b5cf6', next: 90 },
  { min: 90, max: 94,  name: 'Open Source Champion',   color: '#10b981', next: 95 },
  { min: 95, max: 100, name: 'Elite Portfolio',        color: '#f59e0b', next: null },
];

function getTier(score) {
  return TIERS.find((t) => score >= t.min && score <= t.max) || TIERS[0];
}

const GOAL_OPTIONS = [
  { label: '+10 pts — Next Tier', delta: 10 },
  { label: '+20 pts — Level Up Fast', delta: 20 },
  { label: '+30 pts — Senior Bracket', delta: 30 },
  { label: 'Custom Target', delta: 'custom' },
];

/**
 * GrowthGoalTracker — user retention component shown after claiming portfolio.
 * Lets the user set a score goal, reminds them to re-audit, and shows what
 * concrete actions will get them to the next tier.
 */
function GrowthGoalTracker({ score, username, onReAudit, onToast }) {
  const [goalDelta, setGoalDelta] = useState(10);
  const [customGoal, setCustomGoal] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [reminded, setReminded] = useState(false);
  const [lastAuditStr, setLastAuditStr] = useState('');

  useEffect(() => {
    // Load last audit timestamp from localStorage
    try {
      const key = `gfs_last_audit_${(username || '').toLowerCase()}`;
      const raw = localStorage.getItem(key);
      if (raw) {
        const { timestamp } = JSON.parse(raw);
        const days = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
        if (days === 0) setLastAuditStr('Audited today');
        else if (days === 1) setLastAuditStr('Last audited yesterday');
        else setLastAuditStr(`Last audited ${days} days ago`);
      } else {
        setLastAuditStr('First audit recorded');
      }
    } catch {
      setLastAuditStr('');
    }

    // Record current audit time
    try {
      const key = `gfs_last_audit_${(username || '').toLowerCase()}`;
      localStorage.setItem(key, JSON.stringify({ timestamp: Date.now() }));
    } catch {
      // best effort
    }
  }, [username]);

  const currentTier = getTier(score);
  const effectiveDelta = isCustom
    ? Math.max(1, Math.min(100 - score, Number(customGoal) || 10))
    : goalDelta;
  const targetScore = Math.min(100, score + effectiveDelta);
  const targetTier = getTier(targetScore);
  const tierWillChange = targetTier.name !== currentTier.name;

  // Actionable suggestions to reach the goal
  const getSuggestions = () => {
    const suggestions = [];
    if (effectiveDelta >= 5) suggestions.push('Add descriptions to all repositories — quick +2-4 pts');
    if (effectiveDelta >= 7) suggestions.push('Add topic tags to your top 3 repos — immediately visible to recruiters');
    if (effectiveDelta >= 10) suggestions.push('Add a detailed README with setup instructions and architecture notes');
    if (effectiveDelta >= 15) suggestions.push('Activate GitHub Actions CI on your top project — signals production discipline');
    if (effectiveDelta >= 20) suggestions.push('Open-source your best project with a proper LICENSE file');
    if (effectiveDelta >= 25) suggestions.push('Contribute to 2-3 external repositories to build community presence');
    return suggestions.slice(0, 3);
  };

  const handleSetReminder = () => {
    setReminded(true);
    onToast?.('Re-audit reminder set! Come back in 7 days to track your progress.');
  };

  return (
    <div className="premium-card p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <div className="flex items-center justify-between mb-5 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30">
            <Target className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              Track My Growth
            </h3>
            {lastAuditStr && (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{lastAuditStr}</p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onReAudit}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white shadow-md transition-all active:scale-95"
          style={{ background: 'var(--gradient-primary)' }}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Re-audit Now
        </button>
      </div>

      {/* Current vs Target */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center">
          <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Current Score</div>
          <div className="text-2xl font-black" style={{ color: currentTier.color }}>{score}</div>
          <div className="text-[11px] font-medium mt-1" style={{ color: 'var(--text-muted)' }}>
            {currentTier.name}
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="flex flex-col items-center gap-1">
            <ChevronRight className="w-5 h-5 text-indigo-400" />
            <span className="text-[10px] font-bold text-indigo-400">+{effectiveDelta} pts</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-center">
          <div className="text-xs mb-1 text-indigo-300">Your Goal</div>
          <div className="text-2xl font-black" style={{ color: tierWillChange ? targetTier.color : 'var(--text-primary)' }}>
            {targetScore}
          </div>
          <div className="text-[11px] font-medium mt-1 text-indigo-300">
            {tierWillChange ? (
              <span className="text-emerald-400">🎯 {targetTier.name}</span>
            ) : (
              targetTier.name
            )}
          </div>
        </div>
      </div>

      {/* Goal Selector */}
      <div className="mb-5">
        <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
          Set Your Score Goal
        </div>
        <div className="flex flex-wrap gap-2">
          {GOAL_OPTIONS.map((opt) => {
            const isSelected = opt.delta === 'custom' ? isCustom : !isCustom && goalDelta === opt.delta;
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => {
                  if (opt.delta === 'custom') {
                    setIsCustom(true);
                  } else {
                    setIsCustom(false);
                    setGoalDelta(opt.delta);
                  }
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border"
                style={{
                  background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)',
                  borderColor: isSelected ? 'rgba(99, 102, 241, 0.5)' : 'rgba(255,255,255,0.1)',
                  color: isSelected ? '#a5b4fc' : 'var(--text-secondary)',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        {isCustom && (
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={100 - score}
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              placeholder={`+pts (1-${100 - score})`}
              className="w-32 px-3 py-1.5 rounded-lg text-xs border bg-transparent outline-none focus:border-indigo-400"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>points improvement</span>
          </div>
        )}
      </div>

      {/* Action Plan */}
      <div className="mb-5">
        <div className="flex items-center gap-1.5 mb-2.5">
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            To reach {targetScore}: do these actions
          </span>
        </div>
        <div className="space-y-2">
          {getSuggestions().map((s, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-emerald-400 flex-shrink-0" />
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reminder CTA */}
      {!reminded ? (
        <button
          type="button"
          onClick={handleSetReminder}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all border hover:bg-white/10 active:scale-95"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          <Bell className="w-3.5 h-3.5 text-amber-400" />
          <span>Remind me to re-audit in 7 days</span>
        </button>
      ) : (
        <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Reminder set — come back in 7 days to track growth!
        </div>
      )}
    </div>
  );
}

export default GrowthGoalTracker;
