import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity, Flame, Zap, CheckCircle2 } from 'lucide-react';

// Fallback hex colors for SVG gradients and strokes
const AREA_HEX_FALLBACKS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="glass-card px-4 py-3 text-sm shadow-xl"
      style={{
        backdropFilter: 'blur(12px)',
        background: 'var(--chart-tooltip-bg, rgba(15, 23, 42, 0.95))',
        border: '1px solid var(--border)',
      }}
    >
      <p className="font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Week {label}</p>
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-2 text-xs" style={{ color: p.color }}>
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          {p.dataKey}: <b>{p.value}</b> commits
        </p>
      ))}
    </div>
  );
};

function CommitActivityGraph({ commitActivity }) {
  if (!commitActivity || typeof commitActivity !== 'object' || Object.keys(commitActivity).length === 0) {
    return null;
  }

  // Transform data - each repo has weekly commit data
  const repoNames = Object.keys(commitActivity);
  const maxWeeks = Math.max(...repoNames.map((r) => (commitActivity[r] || []).length), 0);
  if (maxWeeks === 0) return null;

  const data = [];
  const weeklyTotals = [];

  for (let i = 0; i < maxWeeks; i++) {
    const point = { week: `W${i + 1}` };
    let weekTotal = 0;
    repoNames.forEach((repo) => {
      const entry = commitActivity[repo]?.[i];
      const val = typeof entry === 'object' && entry !== null ? (entry.total ?? 0) : (entry ?? 0);
      point[repo] = val;
      weekTotal += val;
    });
    weeklyTotals.push(weekTotal);
    data.push(point);
  }

  // Calculate Streak & Activity Metrics
  let currentStreak = 0;
  for (let i = weeklyTotals.length - 1; i >= 0; i--) {
    if (weeklyTotals[i] > 0) {
      currentStreak++;
    } else {
      break;
    }
  }

  const totalCommits = weeklyTotals.reduce((a, b) => a + b, 0);
  const peakWeekly = Math.max(...weeklyTotals, 0);
  const activeWeeksCount = weeklyTotals.filter((w) => w > 0).length;
  const consistencyPercent = Math.round((activeWeeksCount / (weeklyTotals.length || 1)) * 100);

  return (
    <div className="premium-card p-6 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Commit Activity</h3>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Weekly commits across top repositories ({maxWeeks} weeks tracked)
          </p>
        </div>

        {/* Feature 9: Contribution Streak & Consistency Metrics */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-amber-500/10 border-amber-500/30 text-amber-500 dark:text-amber-400 text-xs font-semibold">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Current Streak: <b>{currentStreak} {currentStreak === 1 ? 'week' : 'weeks'}</b></span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-indigo-500/10 border-indigo-500/30 text-indigo-500 dark:text-indigo-400 text-xs font-semibold">
            <Zap className="w-4 h-4" />
            <span>Peak: <b>{peakWeekly} commits/wk</b></span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-emerald-500/10 border-emerald-500/30 text-emerald-500 dark:text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Consistency: <b>{consistencyPercent}%</b></span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            {repoNames.map((repo, i) => (
              <linearGradient key={repo} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={AREA_HEX_FALLBACKS[i % AREA_HEX_FALLBACKS.length]} stopOpacity={0.35} />
                <stop offset="100%" stopColor={AREA_HEX_FALLBACKS[i % AREA_HEX_FALLBACKS.length]} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, #e2e8f0)" vertical={false} />
          <XAxis
            dataKey="week"
            tick={{ fill: 'var(--chart-text, #475569)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--chart-text, #475569)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          {repoNames.map((repo, i) => (
            <Area
              key={repo}
              type="monotone"
              dataKey={repo}
              stroke={AREA_HEX_FALLBACKS[i % AREA_HEX_FALLBACKS.length]}
              strokeWidth={2.5}
              fill={`url(#grad-${i})`}
              animationDuration={1200}
              animationBegin={i * 150}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex flex-wrap gap-4">
          {repoNames.map((repo, i) => (
            <span key={repo} className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              <span className="w-2.5 h-2.5 rounded" style={{ background: AREA_HEX_FALLBACKS[i % AREA_HEX_FALLBACKS.length] }} />
              {repo}
            </span>
          ))}
        </div>
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          Total Commits: <b style={{ color: 'var(--text-primary)' }}>{totalCommits}</b>
        </span>
      </div>
    </div>
  );
}

export default CommitActivityGraph;
