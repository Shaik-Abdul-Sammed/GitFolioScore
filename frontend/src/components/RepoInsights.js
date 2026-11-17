import React, { useState } from 'react';
import { AlertCircle, GitPullRequest, Users, Star, GitFork, ExternalLink, FileText, Copy, Check, RefreshCw } from 'lucide-react';
import { generateResumeBullet } from '../lib/llm';

function RepoInsights({ repo, insights }) {
  const [bullet, setBullet] = useState('');
  const [bulletLoading, setBulletLoading] = useState(false);
  const [bulletError, setBulletError] = useState('');
  const [copied, setCopied] = useState(false);

  if (!insights) return null;

  const handleGenerateBullet = async () => {
    setBulletLoading(true);
    setBulletError('');
    setBullet('');
    try {
      const result = await generateResumeBullet(repo);
      setBullet(result);
    } catch {
      const starsCount = repo.stars ?? repo.stargazers_count ?? 0;
      setBullet(`Architected and optimized ${repo.name} using ${repo.language || 'modern software patterns'}, demonstrating clean modular architecture with ${starsCount.toLocaleString()} GitHub stars.`);
    } finally {
      setBulletLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`• ${bullet}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Build authentic telemetry cards (never display false zeroes)
  const cards = [];

  const openIssuesCount = insights.issues?.length || repo.open_issues_count || 0;
  if (openIssuesCount > 0) {
    cards.push({
      key: 'issues',
      icon: <AlertCircle className="w-4 h-4" />,
      label: 'Open Issues',
      value: openIssuesCount.toLocaleString(),
      color: '#f59e0b',
    });
  }

  const prsCount = insights.prs?.length || 0;
  if (prsCount > 0) {
    cards.push({
      key: 'prs',
      icon: <GitPullRequest className="w-4 h-4" />,
      label: 'Open PRs',
      value: prsCount.toLocaleString(),
      color: '#8b5cf6',
    });
  }

  const contributorsCount = insights.contributors?.length || repo.contributors_count || 0;
  if (contributorsCount > 0) {
    cards.push({
      key: 'contributors',
      icon: <Users className="w-4 h-4" />,
      label: 'Contributors',
      value: contributorsCount.toLocaleString(),
      color: '#10b981',
    });
  }

  // Supplement with genuine Stars and Forks if cards are sparse
  const starsCount = repo.stars ?? repo.stargazers_count ?? 0;
  const forksCount = repo.forks ?? repo.forks_count ?? 0;

  if (cards.length === 0) {
    cards.push({
      key: 'stars',
      icon: <Star className="w-4 h-4" />,
      label: 'Stars',
      value: starsCount.toLocaleString(),
      color: '#eab308',
    });
    cards.push({
      key: 'forks',
      icon: <GitFork className="w-4 h-4" />,
      label: 'Forks',
      value: forksCount.toLocaleString(),
      color: '#8b5cf6',
    });
  } else if (cards.length === 1 && forksCount > 0) {
    cards.unshift({
      key: 'stars',
      icon: <Star className="w-4 h-4" />,
      label: 'Stars',
      value: starsCount.toLocaleString(),
      color: '#eab308',
    });
  }

  return (
    <div className="glass-card p-5 animate-fade-in-up">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <span className="text-lg">📊</span> {repo.name}
        </h4>
        <a
          href={`https://github.com/${repo.full_name || repo.name}`}
          target="_blank" rel="noopener noreferrer"
          className="text-xs flex items-center gap-1 hover:underline"
          style={{ color: 'var(--primary)' }}
        >
          View on GitHub <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className={`grid ${cards.length >= 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>
        {cards.map((c) => (
          <MetricCard
            key={c.key}
            icon={c.icon}
            label={c.label}
            value={c.value}
            color={c.color}
          />
        ))}
      </div>

      {insights.contributors?.length > 0 && (
        <div className="mt-3 flex items-center gap-1">
          <span className="text-xs mr-2" style={{ color: 'var(--text-muted)' }}>Top:</span>
          {insights.contributors.slice(0, 5).map((c, i) => (
            <img
              key={i}
              src={c.avatar_url || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%23475569"/><circle cx="50" cy="40" r="18" fill="%23cbd5e1"/><path d="M25 85c0-12 12-18 25-18s25 6 25 18" fill="%23cbd5e1"/></svg>'}
              alt={c.login}
              title={c.login}
              crossOrigin="anonymous"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="%23475569"/><circle cx="50" cy="40" r="18" fill="%23cbd5e1"/><path d="M25 85c0-12 12-18 25-18s25 6 25 18" fill="%23cbd5e1"/></svg>';
              }}
              className="w-7 h-7 rounded-full border-2 -ml-1 first:ml-0 hover:scale-110 transition-transform"
              style={{ borderColor: 'var(--bg-secondary)' }}
            />
          ))}
          {insights.contributors.length > 5 && (
            <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>+{insights.contributors.length - 5}</span>
          )}
        </div>
      )}

      {/* Resume Bullet Generator */}
      <div className="mt-4 pt-3 border-t border-white/8">
        {!bullet && !bulletLoading && (
          <button
            onClick={handleGenerateBullet}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition active:scale-95"
          >
            <FileText className="w-3.5 h-3.5" />
            Generate Resume Bullet
          </button>
        )}
        {bulletLoading && (
          <div className="flex items-center gap-2 text-xs text-indigo-300">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            Drafting resume bullet...
          </div>
        )}
        {bulletError && (
          <p className="text-xs text-red-400">{bulletError}</p>
        )}
        {bullet && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-purple-300">Resume Bullet:</p>
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-purple-500/8 border border-purple-500/20">
              <span className="text-purple-400 text-sm flex-shrink-0">•</span>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>{bullet}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition"
                style={{ color: 'var(--text-muted)' }}
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={handleGenerateBullet}
                className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition"
                style={{ color: 'var(--text-muted)' }}
              >
                <RefreshCw className="w-3 h-3" />
                Regenerate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, color }) {
  return (
    <div className="text-center p-2 rounded-xl" style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
      <div className="flex items-center justify-center gap-1.5 mb-0.5" style={{ color }}>
        {icon}
      </div>
      <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</div>
      <div className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}

export default RepoInsights;
