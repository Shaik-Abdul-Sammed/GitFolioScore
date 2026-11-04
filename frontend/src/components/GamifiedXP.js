import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Award, Zap, X } from 'lucide-react';
import { loadXP, getLevelInfo, LEVELS } from '../lib/xpStorage';

function GamifiedXP({ xp, onRewardXP }) {
  const [currentXP, setCurrentXP] = useState(xp !== undefined && xp !== null ? xp : 0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (xp !== undefined && xp !== null) {
      setCurrentXP(xp);
    } else {
      loadXP().then((val) => setCurrentXP(val || 0));
    }
  }, [xp]);

  useEffect(() => {
    if (!showModal) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  const levelInfo = getLevelInfo(currentXP);

  const modalContent = showModal ? (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={() => setShowModal(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gamified-xp-title"
    >
      <div
        className="relative z-10 w-full max-w-md rounded-2xl bg-slate-900 border border-white/15 p-6 shadow-2xl max-h-[85vh] overflow-y-auto space-y-5 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 id="gamified-xp-title" className="font-bold text-white text-sm">
                Developer XP & Ranks
              </h4>
              <p className="text-[11px] text-gray-400">
                Level up by auditing code, testing, and exporting reports
              </p>
            </div>
          </div>
          {/* Prominent X Close Button */}
          <button
            type="button"
            onClick={() => setShowModal(false)}
            aria-label="Close Progression Ladder"
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer border border-white/10 hover:border-white/20"
          >
            <X className="w-5 h-5 text-gray-300 hover:text-white" />
          </button>
        </div>

        {/* Current Level Card */}
        <div className="p-4 rounded-xl bg-gradient-to-tr from-slate-950 via-amber-950/20 to-slate-900 border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{levelInfo.icon}</span>
              <div>
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Level {levelInfo.level}
                </div>
                <div className="text-base font-extrabold text-white">
                  {levelInfo.title}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-amber-300 font-mono">
                {levelInfo.currentXP}
              </span>
              <span className="text-xs text-gray-400 block font-medium">
                / {levelInfo.nextXP} XP
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 transition-all duration-500"
                style={{ width: `${levelInfo.progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>{levelInfo.progress}% to next rank</span>
              <span>{Math.max(0, levelInfo.nextXP - levelInfo.currentXP)} XP needed</span>
            </div>
          </div>
        </div>

        {/* How to earn XP */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            How to Earn Developer XP
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
              <div className="font-bold text-emerald-400">+25 XP</div>
              <div className="text-gray-300 text-[11px]">Discover New Developer</div>
            </div>
            <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
              <div className="font-bold text-amber-400">+15 XP</div>
              <div className="text-gray-300 text-[11px]">Scout Elite (80+) Score</div>
            </div>
            <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
              <div className="font-bold text-indigo-400">+15 XP</div>
              <div className="text-gray-300 text-[11px]">Cross-Role Benchmark Test</div>
            </div>
            <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
              <div className="font-bold text-purple-400">+20 XP</div>
              <div className="text-gray-300 text-[11px]">Track Score Growth Timeline</div>
            </div>
          </div>
        </div>

        {/* Progression Ladder */}
        <div className="space-y-1.5">
          <div className="text-xs font-bold text-gray-300">Progression Ladder</div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {LEVELS.map((lvl) => (
              <div
                key={lvl.level}
                className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                  lvl.level === levelInfo.level
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-200 font-bold'
                    : 'bg-white/5 text-gray-400'
                }`}
              >
                <div className="flex flex-col">
                  <span className="flex items-center gap-1.5">
                    <span>{lvl.icon}</span> Lvl {lvl.level}: {lvl.title}
                  </span>
                  {lvl.perk && (
                    <span className="text-[10px] text-gray-500 pl-5">{lvl.perk}</span>
                  )}
                </div>
                <span className="font-mono text-[11px] flex-shrink-0">{lvl.minXP} XP</span>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(false)}
          className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 transition cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* Pill Badge Trigger */}
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-amber-500/30 hover:border-amber-400 text-white backdrop-blur-md transition shadow-md hover:shadow-amber-500/10 active:scale-95 select-none"
        title="View Gamified Developer Rank & XP"
      >
        <span className="text-sm">{levelInfo.icon}</span>
        <div className="flex flex-col text-left">
          <div className="text-[10px] font-bold text-amber-300 leading-none flex items-center gap-1">
            <span>LVL {levelInfo.level}</span>
            <span className="text-gray-400 font-normal truncate hidden sm:inline">• {levelInfo.title}</span>
          </div>
          <div className="w-16 sm:w-20 bg-slate-800 rounded-full h-1 mt-1 overflow-hidden border border-white/5">
            <div
              className="bg-gradient-to-r from-amber-400 to-yellow-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${levelInfo.progress}%` }}
            />
          </div>
        </div>
        <span className="text-[10px] font-mono text-gray-400 hidden sm:inline">
          {levelInfo.currentXP} XP
        </span>
      </button>

      {/* Gamification Modal - Portaled to document.body for true full-screen centering */}
      {modalContent && (typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent)}
    </>
  );
}

export default GamifiedXP;
