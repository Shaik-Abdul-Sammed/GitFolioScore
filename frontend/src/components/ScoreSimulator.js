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
  const repos = data.repos || [];
  const profile = data.profile || {};
  const currentTier = getTier(baseScore);

  // Clone and augment repos for simulation
  const starsSum = repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
  const simTotalStars = starsSum + extraStars;
  const simRepos = repos.map((r) => ({
    ...r,
    stargazers_count: (r.stargazers_count || 0) + Math.round(extraStars / Math.max(repos.length, 1)),
    topics: addTopics ? (r.topics?.length ? r.topics : ['react', 'open-source']) : (r.topics || []),
    description: addReadmes ? (r.description || 'Production portfolio project') : (r.description || ''),
  }));

  const simulatedReadmeCount = addReadmes ? simRepos.length : (Number(data.readmeCount) || 0);
  const simulatedDetailed = addReadmes ? simRepos.length : (Number(data.detailedReadmeCount) || 0);

  const simResult = computeScore({
    profile: profile || {},
    repos: simRepos,
    totalStars: simTotalStars,
    totalForks: Number(data.totalForks) || 0,
    languageCount: Number(data.languageCount) || 1,
    readmeCount: simulatedReadmeCount,
    detailedReadmeCount: simulatedDetailed,
    inactiveRepos: boostActivity ? 0 : (Number(data.inactiveRepos) || 0),
    consistentReposCount: boostActivity ? simRepos.length : (Number(data.consistentReposCount) || 0),
    topReposCount: Number(data.topReposCount) || Math.min(simRepos.length, 5),
    weights: weights || {},
  });

  const rawScore = Number(simResult?.score);
  const simulatedScore = isNaN(rawScore) ? baseScore : Math.min(100, Math.max(0, Math.round(rawScore)));
  const simTier = getTier(simulatedScore);
  const delta = simulatedScore - baseScore;

  const handleReset = () => {
    setExtraStars(0);
    setAddReadmes(false);
    setAddTopics(false);
    setBoostActivity(false);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 shadow-[inset_0_0_15px_rgba(255,255,255,0.05)] backdrop-blur-xl p-6 transition-all hover:border-indigo-500/30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 text-indigo-400 border border-indigo-500/30">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              {'"What-If" Score Simulator'}
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Interactive
              </span>
            </h3>
            <p className="text-xs text-gray-400">
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
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5">
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
            <span className="text-xs text-gray-200 font-medium">Add topics & tags</span>
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
