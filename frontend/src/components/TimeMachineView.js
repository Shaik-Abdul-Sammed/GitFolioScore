import React, { useState } from 'react';
import { History, ArrowUpRight, Calendar, Sparkles } from 'lucide-react';
import { computeScore } from '../lib/score';

function TimeMachineView({ repos = [], profile = {}, weights, currentScore = 80 }) {
  const [activeTab, setActiveTab] = useState('comparison'); // 'comparison' | 'past' | 'present'

  const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
  const now = Date.now();

  // Filter repos that existed > 1 year ago
  const oldRepos = repos.filter((r) => {
    const createdAt = new Date(r.created_at).getTime();
    return now - createdAt >= ONE_YEAR_MS;
  });

  const oldStars = oldRepos.reduce((acc, r) => acc + Math.floor((r.stargazers_count || 0) * 0.4), 0);
  const currentStars = repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);

  // Compute 1-year ago estimated score
  const pastScoreResult = computeScore({
    profile: {
      ...profile,
      public_repos: oldRepos.length,
    },
    repos: oldRepos.length > 0 ? oldRepos : repos.slice(0, 2),
    totalStars: oldStars,
    totalForks: 0,
    languageCount: Math.max(1, (oldRepos.length > 0 ? new Set(oldRepos.map((r) => r.language).filter(Boolean)).size : 1)),
    readmeCount: Math.max(0, Math.floor(oldRepos.length * 0.5)),
    detailedReadmeCount: Math.max(0, Math.floor(oldRepos.length * 0.3)),
    inactiveRepos: 0,
    consistentReposCount: oldRepos.length,
    topReposCount: Math.min(oldRepos.length, 3),
    weights,
  });

  const pastScore = Math.min(100, Math.max(30, pastScoreResult.score));
  const scoreDiff = currentScore - pastScore;
  const growthPercent = pastScore > 0 ? Math.round((scoreDiff / pastScore) * 100) : 100;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 shadow-[inset_0_0_15px_rgba(255,255,255,0.05)] backdrop-blur-xl p-6 transition-all hover:border-cyan-500/30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              {'The "Time Machine" Growth View'}
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                1-Year Trajectory
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              Compare your GitHub stats and portfolio score from 1 year ago against today.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('comparison')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'comparison'
                ? 'bg-cyan-500 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Growth Delta
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('past')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'past'
                ? 'bg-cyan-500 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            1 Year Ago
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('present')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'present'
                ? 'bg-cyan-500 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Today
          </button>
        </div>
      </div>

      {activeTab === 'comparison' && (
        <div className="space-y-6 animate-fade-in">
          {/* Side by side metric cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> 1 Year Ago Snapshot
              </span>
              <div className="text-2xl font-bold text-gray-300">
                {pastScore} <span className="text-xs font-normal text-gray-500">/ 100</span>
              </div>
              <div className="text-[11px] text-gray-400">
                {oldRepos.length} Repos • {oldStars} Stars
              </div>
            </div>

            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-1">
              <span className="text-xs text-cyan-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Today&apos;s Verified Score
              </span>
              <div className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-300">
                {currentScore} <span className="text-xs font-normal text-gray-400">/ 100</span>
              </div>
              <div className="text-[11px] text-gray-300">
                {repos.length} Repos • {currentStars} Stars
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
              <span className="text-xs text-emerald-300 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> Annual Growth Velocity
              </span>
              <div className="text-2xl font-black text-emerald-400">
                +{scoreDiff > 0 ? scoreDiff : 0} pts
              </div>
              <div className="text-[11px] text-emerald-300 font-semibold">
                +{growthPercent}% portfolio improvement
              </div>
            </div>
          </div>

          {/* Animated Growth Timeline Bar */}
          <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-gray-400">Yearly Evolution Trajectory</span>
              <span className="text-cyan-400 font-mono">+{repos.length - oldRepos.length} Repos Built This Year</span>
            </div>

            <div className="relative w-full bg-slate-800 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, Math.max(15, (currentScore / 100) * 100))}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] text-gray-400 font-mono">
              <span>Past Baseline ({pastScore})</span>
              <span className="text-emerald-400 font-bold">Present ({currentScore})</span>
              <span>100 (Max Bar)</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'past' && (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 animate-fade-in text-xs text-gray-300">
          <div className="font-bold text-white text-sm">Repositories Active 1 Year Ago:</div>
          {oldRepos.length === 0 ? (
            <p className="text-gray-400 italic">No repositories recorded over 1 year ago.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {oldRepos.map((r) => (
                <div key={r.name} className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                  <div className="font-semibold text-cyan-300">@{r.name}</div>
                  <div className="text-gray-400 text-[11px]">Created {new Date(r.created_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'present' && (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 animate-fade-in text-xs text-gray-300">
          <div className="font-bold text-white text-sm">Active Present Repositories ({repos.length}):</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {repos.slice(0, 6).map((r) => (
              <div key={r.name} className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                <div className="font-semibold text-emerald-300">@{r.name}</div>
                <div className="text-gray-400 text-[11px]">{r.language || 'Code'} • {r.stargazers_count} stars</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TimeMachineView;
