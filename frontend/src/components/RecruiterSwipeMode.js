import React, { useState } from 'react';
import { Heart, X, Star, GitFork, RefreshCcw, CheckCircle2, Archive, Eye } from 'lucide-react';

function RecruiterSwipeMode({ repos = [], username }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(null); // 'left' | 'right' | null
  const [decisions, setDecisions] = useState({}); // { [repoName]: 'feature' | 'archive' }

  const activeRepos = (repos || []).slice(0, 10);
  const currentRepo = activeRepos[currentIndex];
  const isFinished = currentIndex >= activeRepos.length;

  const handleSwipe = (direction) => {
    if (!currentRepo) return;
    setSwipeDirection(direction);
    const action = direction === 'right' ? 'feature' : 'archive';

    setTimeout(() => {
      setDecisions((prev) => ({ ...prev, [currentRepo.name]: action }));
      setCurrentIndex((idx) => idx + 1);
      setSwipeDirection(null);
    }, 280);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setDecisions({});
    setSwipeDirection(null);
  };

  if (!activeRepos.length) return null;

  const featured = activeRepos.filter((r) => decisions[r.name] === 'feature');
  const archived = activeRepos.filter((r) => decisions[r.name] === 'archive');

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 shadow-[inset_0_0_15px_rgba(255,255,255,0.05)] backdrop-blur-xl p-6 transition-all hover:border-pink-500/30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
            <Heart className="w-5 h-5 fill-pink-500/20" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              {'Recruiter "Tinder" Mode'}
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                Interactive Deck
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              Swipe right to Feature, swipe left to Archive. Curate a spotless recruiter showcase.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 font-mono">
            {Math.min(currentIndex + 1, activeRepos.length)} / {activeRepos.length}
          </span>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/10 transition border border-white/10 active:scale-95"
            title="Reset cards deck"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Restart</span>
          </button>
        </div>
      </div>

      {!isFinished && currentRepo ? (
        <div className="max-w-md mx-auto my-4">
          {/* Swipeable Card */}
          <div
            className={`relative rounded-2xl p-6 bg-gradient-to-b from-slate-900 to-slate-950 border border-white/15 shadow-2xl transition-all duration-300 transform select-none ${
              swipeDirection === 'right'
                ? 'translate-x-32 rotate-12 opacity-0'
                : swipeDirection === 'left'
                ? '-translate-x-32 -rotate-12 opacity-0'
                : 'translate-x-0 rotate-0 opacity-100'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <span className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                  {currentRepo.language || 'Multi-language'}
                </span>
                <h4 className="text-lg font-bold text-white mt-2 truncate">
                  {currentRepo.name}
                </h4>
              </div>

              <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                <Star className="w-3.5 h-3.5 fill-amber-300" />
                <span>{currentRepo.stargazers_count || 0}</span>
              </div>
            </div>

            <p className="text-xs text-gray-300 line-clamp-3 mb-6 min-h-[48px]">
              {currentRepo.description || 'No description provided for this repository.'}
            </p>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-400 p-3 rounded-xl bg-white/5 border border-white/5 mb-6">
              <div className="flex items-center gap-1.5">
                <GitFork className="w-3.5 h-3.5 text-gray-400" />
                <span>{currentRepo.forks_count || 0} Forks</span>
              </div>
              <div className="text-right truncate">
                <span>{currentRepo.license?.spdx_id || 'No license'}</span>
              </div>
            </div>

            {/* Swipe Action Buttons */}
            <div className="flex items-center justify-center gap-6 pt-2">
              <button
                type="button"
                onClick={() => handleSwipe('left')}
                className="w-14 h-14 rounded-full flex items-center justify-center bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 hover:scale-110 active:scale-95 transition shadow-lg"
                title="Archive / Hide (Swipe Left)"
                aria-label="Archive or hide repository"
              >
                <X className="w-6 h-6" />
              </button>

              <button
                type="button"
                onClick={() => handleSwipe('right')}
                className="w-14 h-14 rounded-full flex items-center justify-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 hover:scale-110 active:scale-95 transition shadow-lg"
                title="Feature on Profile (Swipe Right)"
                aria-label="Feature repository"
              >
                <Star className="w-6 h-6 fill-emerald-400" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Summary view after swiping all cards */
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
            <CheckCircle2 className="w-4 h-4" />
            Curated Portfolio Showcase Ready!
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
              <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                Featured Repositories ({featured.length})
              </div>
              {featured.length === 0 ? (
                <div className="text-xs text-gray-500 italic">No repositories chosen to feature.</div>
              ) : (
                <ul className="text-xs text-gray-200 space-y-1">
                  {featured.map((r) => (
                    <li key={r.name} className="flex items-center justify-between">
                      <span className="font-semibold text-emerald-400 truncate">@{r.name}</span>
                      <span className="text-[10px] text-gray-400">{r.stargazers_count} ⭐</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Archive className="w-3.5 h-3.5" />
                Recommended for Archive ({archived.length})
              </div>
              {archived.length === 0 ? (
                <div className="text-xs text-gray-500 italic">No repositories marked to archive.</div>
              ) : (
                <ul className="text-xs text-gray-200 space-y-1">
                  {archived.map((r) => (
                    <li key={r.name} className="flex items-center justify-between">
                      <span className="text-amber-400 truncate">@{r.name}</span>
                      <span className="text-[10px] text-gray-500">Archive candidate</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecruiterSwipeMode;
