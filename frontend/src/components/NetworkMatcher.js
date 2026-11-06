import React, { useState } from 'react';
import { Network, Building2, GitFork, Users2, RefreshCw, AlertCircle } from 'lucide-react';
import { suggestNetworkMatches } from '../lib/llm';

const TYPE_CONFIG = {
  company: { icon: Building2, color: '#6366f1', label: 'Company Tier Match' },
  opensource: { icon: GitFork, color: '#10b981', label: 'Target Open Source' },
  community: { icon: Users2, color: '#f59e0b', label: 'Tech Community' },
};

function NetworkMatcher({ languages = [], targetRole = '' }) {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetch = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await suggestNetworkMatches(languages, targetRole);
      setSuggestions(result.suggestions || []);
    } catch (err) {
      setError(err.userMessage || 'Could not fetch suggestions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="premium-card manga-halftone-card p-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 text-indigo-400 border border-indigo-500/30">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              Company &amp; Career Matcher
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Startups · FinTech · FAANG
              </span>
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Based on your top languages and activity, evaluate which company types you are best suited for right now.
            </p>
          </div>
        </div>
        <button
          onClick={handleFetch}
          disabled={loading}
          className="self-start sm:self-center flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
          style={{ background: 'var(--gradient-primary)' }}
        >
          {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Network className="w-3.5 h-3.5" />}
          {suggestions ? 'Refresh Matches' : 'Match Companies'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {loading && (
        <div className="py-6 text-center">
          <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin mx-auto mb-2" />
          <p className="text-sm text-indigo-200">Finding your best matches...</p>
        </div>
      )}

      {suggestions && !loading && (
        <div className="space-y-3">
          {suggestions.map((s, i) => {
            const cfg = TYPE_CONFIG[s.type] || TYPE_CONFIG.company;
            const Icon = cfg.icon;
            return (
              <div
                key={i}
                className="flex items-start gap-3 p-3.5 rounded-xl border transition hover:border-white/20"
                style={{ background: `${cfg.color}08`, borderColor: `${cfg.color}20` }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${cfg.color}20` }}>
                  <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{s.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: `${cfg.color}20`, color: cfg.color }}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{s.reason}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default NetworkMatcher;
