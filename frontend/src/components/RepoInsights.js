import React, { useState } from 'react';
import { AlertCircle, GitPullRequest, Users, ExternalLink, FileText, Copy, Check, RefreshCw } from 'lucide-react';
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
    } catch (err) {
      setBulletError(err.userMessage || 'Could not generate bullet. Please retry.');
    } finally {
      setBulletLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`• ${bullet}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

      <div className="grid grid-cols-3 gap-3">
        <MetricCard
          icon={<AlertCircle className="w-4 h-4" />}
          label="Open Issues"
          value={insights.issues?.length ?? 0}
          color="#f59e0b"
        />
        <MetricCard
          icon={<GitPullRequest className="w-4 h-4" />}
          label="Open PRs"
          value={insights.prs?.length ?? 0}
          color="#8b5cf6"
        />
        <MetricCard
          icon={<Users className="w-4 h-4" />}
          label="Contributors"
          value={insights.contributors?.length ?? 0}
          color="#10b981"
        />
      </div>

      {insights.contributors?.length > 0 && (
        <div className="mt-3 flex items-center gap-1">
          <span className="text-xs mr-2" style={{ color: 'var(--text-muted)' }}>Top:</span>
          {insights.contributors.slice(0, 5).map((c, i) => (
            <img
              key={i}
              src={c.avatar_url}
              alt={c.login}
              title={c.login}
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
