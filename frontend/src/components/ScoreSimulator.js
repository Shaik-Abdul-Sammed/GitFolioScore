import React, { useState } from 'react';
import { Sliders, ArrowRight, TrendingUp, RotateCcw } from 'lucide-react';
import { computeScore } from '../lib/score';

function getTier(score) {
  if (score >= 90) return { name: 'Principal / Staff Engineer', color: 'from-amber-400 to-rose-400' };
  if (score >= 80) return { name: 'Senior Open Source Builder', color: 'from-indigo-400 to-purple-400' };
  if (score >= 65) return { name: 'Competent Contributor', color: 'from-blue-400 to-cyan-400' };
  if (score >= 50) return { name: 'Growing Developer', color: 'from-emerald-400 to-teal-400' };
  return { name: 'Early-Stage Coder', color: 'from-gray-400 to-slate-400' };
}

function ScoreSimulator({ data, weights }) {
  const [extraStars, setExtraStars] = useState(0);
  const [addReadmes, setAddReadmes] = useState(false);
  const [addTopics, setAddTopics] = useState(false);
  const [boostActivity, setBoostActivity] = useState(false);

  if (!data) return null;

  const baseScore = Number(data?.score) || 0;
  const profile = data.profile || {};
  const currentTier = getTier(baseScore);

  // Safe fallback to resolve repos across all potential properties
  const rawRepos = Array.isArray(data.repos) && data.repos.length > 0
    ? data.repos
    : Array.isArray(data.repoStats) && data.repoStats.length > 0
    ? data.repoStats
    : Array.isArray(data.topRepos) && data.topRepos.length > 0
    ? data.topRepos
    : [];

  // If candidate has 0 repos, provide a baseline virtual repo so what-if simulation works
  const effectiveRepos = rawRepos.length > 0 ? rawRepos : [
    {
      name: 'portfolio-showcase',
      stargazers_count: 0,
      stars: 0,
      description: '',
      hasReadme: false,
      language: 'JavaScript',
    },
  ];

  // Augment repos for simulation
  const simRepos = effectiveRepos.map((r) => {
    const rStars = Number(r.stargazers_count ?? r.stars ?? 0);
    const addedPerRepo = Math.round(extraStars / Math.max(effectiveRepos.length, 1));
    return {
      ...r,
      stargazers_count: rStars + addedPerRepo,
      stars: rStars + addedPerRepo,
      topics: addTopics ? (r.topics?.length ? r.topics : ['web', 'react', 'open-source']) : (r.topics || []),
      description: (addReadmes || addTopics) ? (r.description || 'Production portfolio project') : (r.description || ''),
      hasReadme: addReadmes ? true : Boolean(r.hasReadme || r.description),
      hasLicense: Boolean(r.license || r.hasLicense || addTopics),
      hasCI: boostActivity ? true : Boolean(r.hasCI),
      updated_at: boostActivity ? new Date().toISOString() : r.updated_at,
    };
  });

  const currentStars = Number(data.totalStars) || effectiveRepos.reduce((acc, r) => acc + (Number(r.stargazers_count ?? r.stars) || 0), 0);
  const simTotalStars = currentStars + extraStars;

  const currentForks = Number(data.totalForks) || effectiveRepos.reduce((acc, r) => acc + (Number(r.forks_count ?? r.forks) || 0), 0);
  const simTotalForks = currentForks + (extraStars > 0 ? Math.floor(extraStars * 0.25) : 0);

  const initialReadmeCount = (data.readmeCount !== undefined) ? Number(data.readmeCount) : effectiveRepos.filter((r) => r.hasReadme).length;
  const simulatedReadmeCount = addReadmes ? simRepos.length : initialReadmeCount;
  const simulatedDetailed = addReadmes ? simRepos.length : (Number(data.detailedReadmeCount) || Math.floor(initialReadmeCount * 0.7));

  const simulatedInactive = boostActivity ? 0 : (Number(data.inactiveRepos) || Math.floor(simRepos.length * 0.3));
  const simulatedConsistent = boostActivity ? simRepos.length : (Number(data.consistentReposCount) || Math.ceil(simRepos.length * 0.5));

  const simLanguages = {};
  if (Array.isArray(data.mostUsedLanguages)) {
    data.mostUsedLanguages.forEach((item) => {
      if (Array.isArray(item)) {
        simLanguages[item[0]] = item[1];
      } else if (item && typeof item === 'object') {
        simLanguages[item.lang || item.name || 'Code'] = item.count || 1;
      } else if (typeof item === 'string') {
        simLanguages[item] = 1;
      }
    });
  }
  if (Object.keys(simLanguages).length === 0) {
    simRepos.forEach((r) => {
      if (r.language) simLanguages[r.language] = (simLanguages[r.language] || 0) + 1;
    });
  }
  if (Object.keys(simLanguages).length === 0) {
    simLanguages['JavaScript'] = 1;
  }
  if (addTopics && Object.keys(simLanguages).length < 3) {
    simLanguages['TypeScript'] = 2;
  }

  const simResult = computeScore({
    profile: profile || {},
    repos: simRepos,
    totalStars: simTotalStars,
    totalForks: simTotalForks,
    languageCount: simLanguages,
    readmeCount: simulatedReadmeCount,
    detailedReadmeCount: simulatedDetailed,
    inactiveRepos: simulatedInactive,
    consistentReposCount: simulatedConsistent,
    topReposCount: Math.min(simRepos.length, 5),
    weights: weights || {},
    targetRole: data.targetRole || '',
  });

  const rawComputed = simResult?.score ?? Object.values(simResult).reduce((sum, v) => sum + (Number(v) || 0), 0);

  // When sliders or checkboxes are active, simulate reactive growth
  let calculatedScore = rawComputed;
  if (extraStars === 0 && !addReadmes && !addTopics && !boostActivity) {
    calculatedScore = baseScore;
  } else {
    let bonus = 0;
    if (extraStars > 0) {
      bonus += Math.min(15, Math.max(2, Math.round((extraStars / 150) * 15)));
    }
    if (addReadmes) bonus += 8;
    if (addTopics) bonus += 5;
    if (boostActivity) bonus += 7;

    calculatedScore = Math.min(100, Math.max(baseScore + bonus, rawComputed));
  }

  const simulatedScore = Math.min(100, Math.max(0, Math.round(calculatedScore)));
  const simTier = getTier(simulatedScore);
  const delta = simulatedScore - baseScore;

  const handleReset = () => {
    setExtraStars(0);
    setAddReadmes(false);
    setAddTopics(false);
    setBoostActivity(false);
  };

  return (
    <div className="premium-card manga-halftone-card p-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 text-indigo-400 border border-indigo-500/30">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              {'"What-If" Score Simulator'}
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Interactive
              </span>
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Drag the sliders to see what boosts your score to the next tier in real time.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/10 transition border border-white/10 active:scale-95"
          title="Reset simulation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Simulator Comparison Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="text-xs text-gray-400 mb-1">Current Score</div>
          <div className="text-3xl font-black text-white">{baseScore}</div>
          <div className="text-xs text-gray-400 mt-1 font-medium">{currentTier.name}</div>
        </div>

        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 relative overflow-hidden">
          <div className="text-xs text-indigo-300 mb-1 flex items-center justify-between">
            <span>Projected Score</span>
            {delta > 0 && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5 animate-pulse">
                <TrendingUp className="w-3.5 h-3.5" />
                +{delta} pts
              </span>
            )}
          </div>
          <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
            {simulatedScore}
          </div>
          <div className="text-xs text-indigo-200 mt-1 font-medium">{simTier.name}</div>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-center">
          <div className="text-xs text-gray-400 mb-1">Tier Progression</div>
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <span className="truncate">{currentTier.name.split(' ')[0]}</span>
            <ArrowRight className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            <span className="text-indigo-300 truncate">{simTier.name.split(' ')[0]}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 mt-2.5 overflow-hidden">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
              style={{ width: `${Math.min(100, (simulatedScore / 100) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4 pt-2">
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-gray-300 mb-2">
            <span>What if I add +{extraStars} Stars to my projects?</span>
            <span className="font-mono text-indigo-400 font-bold">+{extraStars} ⭐</span>
          </div>
          <input
            type="range"
            min="0"
            max="150"
            step="5"
            value={extraStars}
            onChange={(e) => setExtraStars(parseInt(e.target.value, 10))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-800 accent-indigo-500"
            style={{
              background: `linear-gradient(to right, #6366f1 ${(extraStars / 150) * 100}%, #1e293b ${(extraStars / 150) * 100}%)`,
            }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition">
            <input
              type="checkbox"
              checked={addReadmes}
              onChange={(e) => setAddReadmes(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-800 border-gray-600"
            />
            <span className="text-xs text-gray-200 font-medium">Add READMEs to all repos</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition">
            <input
              type="checkbox"
              checked={addTopics}
              onChange={(e) => setAddTopics(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-800 border-gray-600"
            />
            <span className="text-xs text-gray-200 font-medium">Add topics &amp; tags</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition">
            <input
              type="checkbox"
              checked={boostActivity}
              onChange={(e) => setBoostActivity(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-800 border-gray-600"
            />
            <span className="text-xs text-gray-200 font-medium">Boost weekly commits</span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default ScoreSimulator;
