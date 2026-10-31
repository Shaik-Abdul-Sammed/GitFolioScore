import React, { useState } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Code2, Radar as RadarIcon, PieChart as PieIcon, Sparkles } from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#14b8a6', '#f97316', '#06b6d4'];

// Domain mapping for tech stack diversity
const DOMAIN_MAP = {
  JavaScript: 'Frontend',
  TypeScript: 'Frontend',
  HTML: 'Frontend',
  CSS: 'Frontend',
  Vue: 'Frontend',
  Svelte: 'Frontend',
  Python: 'Backend',
  Java: 'Backend',
  Go: 'Backend',
  Ruby: 'Backend',
  PHP: 'Backend',
  'C#': 'Backend',
  'C++': 'Systems',
  C: 'Systems',
  Rust: 'Systems',
  Assembly: 'Systems',
  Swift: 'Mobile',
  Kotlin: 'Mobile',
  Dart: 'Mobile',
  Shell: 'DevOps',
  Dockerfile: 'DevOps',
  Makefile: 'DevOps',
  HCL: 'DevOps',
  Jupyter: 'Data/AI',
  R: 'Data/AI',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="glass-card px-4 py-2.5 text-xs shadow-xl"
      style={{
        backdropFilter: 'blur(12px)',
        background: 'var(--chart-tooltip-bg, rgba(15, 23, 42, 0.95))',
        border: '1px solid var(--border)',
      }}
    >
      <span className="font-semibold" style={{ color: payload[0].color || 'var(--primary)' }}>
        {payload[0].name}
      </span>
      <span style={{ color: 'var(--text-muted)' }}>: {payload[0].value}% score</span>
    </div>
  );
};

function LanguageChart({ languages, showEmptyState = false }) {
  const [chartMode, setChartMode] = useState('radar'); // 'radar' | 'donut'

  if (
    !languages ||
    (Array.isArray(languages) && languages.length === 0) ||
    (!Array.isArray(languages) && Object.keys(languages).length === 0)
  ) {
    if (!showEmptyState) return null;
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 shadow-[inset_0_0_15px_rgba(255,255,255,0.05)] backdrop-blur-xl p-6 flex flex-col items-center justify-center text-center space-y-3 min-h-[300px]">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <Code2 className="w-6 h-6" />
        </div>
        <div className="space-y-1 max-w-xs">
          <h4 className="text-sm font-bold text-white">No Language Distribution</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            Create a repository with detected code languages to generate your full-stack domain radar and breakdown.
          </p>
        </div>
      </div>
    );
  }

  // Normalize language data
  const rawList = Array.isArray(languages)
    ? languages.map((item) => ({
        name: String(item.lang || item.name || 'Unknown'),
        count: item.count || item.value || 1,
      }))
    : Object.entries(languages).map(([lang, count]) => ({
        name: lang,
        count: typeof count === 'number' ? count : 1,
      }));

  const totalBytes = rawList.reduce((acc, curr) => acc + curr.count, 0) || 1;

  // Top languages for Donut view
  const donutData = rawList
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map((item, idx) => ({
      name: item.name,
      value: Math.round((item.count / totalBytes) * 100),
      rawCount: item.count,
      fill: COLORS[idx % COLORS.length],
    }));

  // Group languages into technical categories for Radar View
  const domainTotals = {
    Frontend: 0,
    Backend: 0,
    Systems: 0,
    DevOps: 0,
    Mobile: 0,
    'Data/AI': 0,
  };

  rawList.forEach((item) => {
    const domain = DOMAIN_MAP[item.name] || 'Backend';
    domainTotals[domain] = (domainTotals[domain] || 0) + item.count;
  });

  const maxDomain = Math.max(...Object.values(domainTotals), 1);
  const radarData = Object.keys(domainTotals).map((domain) => {
    // Normalise to 0-100 score for radial display
    const rawVal = domainTotals[domain] || 0;
    const scoreVal = rawVal > 0 ? Math.max(20, Math.round((rawVal / maxDomain) * 100)) : 10;
    return {
      domain,
      score: scoreVal,
      fullMark: 100,
    };
  });

  return (
    <div className="premium-card p-6 animate-fade-in-up">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5" style={{ color: 'var(--accent)' }} />
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Language & Stack Radar
          </h3>
        </div>

        {/* View toggle */}
        <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-medium">
          <button
            onClick={() => setChartMode('radar')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
              chartMode === 'radar'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <RadarIcon className="w-3.5 h-3.5" />
            Radar
          </button>
          <button
            onClick={() => setChartMode('donut')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
              chartMode === 'donut'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            Share
          </button>
        </div>
      </div>

      <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
        {chartMode === 'radar'
          ? 'Fullstack domain diversity across core software disciplines'
          : 'Proportional language distribution by repository frequency'}
      </p>

      <ResponsiveContainer width="100%" height={300}>
        {chartMode === 'radar' ? (
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
            <PolarGrid stroke="var(--chart-grid, #334155)" />
            <PolarAngleAxis
              dataKey="domain"
              tick={{ fill: 'var(--chart-text, #cbd5e1)', fontSize: 11, fontWeight: 600 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: 'var(--text-muted)', fontSize: 9 }}
              stroke="var(--border)"
            />
            <Radar
              name="Diversity"
              dataKey="score"
              stroke="#818cf8"
              fill="#6366f1"
              fillOpacity={0.45}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        ) : (
          <PieChart>
            <Pie
              data={donutData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={105}
              paddingAngle={3}
              cornerRadius={5}
              animationBegin={200}
              animationDuration={800}
            >
              {donutData.map((entry, idx) => (
                <Cell key={idx} fill={entry.fill} stroke="none" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        )}
      </ResponsiveContainer>

      {/* Language pills */}
      <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
        {donutData.slice(0, 6).map((lang) => (
          <span
            key={lang.name}
            className="badge text-xs font-semibold px-2.5 py-1 rounded-lg"
            style={{ background: `${lang.fill}15`, color: lang.fill }}
          >
            {lang.name} · {lang.value}%
          </span>
        ))}
      </div>

      {/* Phase 4, Feature 14: Tech Stack Gap Analysis */}
      <div className="mt-4 p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-indigo-300 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>2026 Tech Stack Gap Analysis</span>
        </div>
        <p className="text-gray-300 leading-relaxed">
          <span className="text-indigo-200 font-semibold">Trending in 2026:</span> Rust, Go, AI Agent SDKs, TypeScript.
        </p>
        <p className="text-gray-400 mt-1">
          <span className="text-gray-300 font-semibold">Your Stack:</span> {donutData.slice(0, 3).map((d) => d.name).join(', ') || 'General'}.{' '}
          <span className="text-amber-300 font-semibold">Recommendation:</span>{' '}
          {donutData.some((d) => d.name === 'JavaScript' || d.name === 'TypeScript')
            ? 'Learn Rust or Go for high-throughput distributed systems & infrastructure.'
            : 'Learn TypeScript and AI Agent orchestration for modern fullstack workflows.'}
        </p>
      </div>
    </div>
  );
}

export default LanguageChart;
