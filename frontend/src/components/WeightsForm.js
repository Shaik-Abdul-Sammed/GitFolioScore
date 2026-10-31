import React from 'react';
import { Sliders, RotateCcw, X, Check } from 'lucide-react';

const weightMeta = {
  profile: { label: 'Profile', icon: '👤', max: 30 },
  repoQuality: { label: 'Repo Quality', icon: '📦', max: 50 },
  activity: { label: 'Activity', icon: '⚡', max: 40 },
  impact: { label: 'Impact', icon: '🌟', max: 40 },
  diversity: { label: 'Diversity', icon: '🎨', max: 20 },
  docs: { label: 'Documentation', icon: '📝', max: 20 },
};

export const DEFAULT_WEIGHTS = {
  profile: 15,
  repoQuality: 25,
  activity: 20,
  impact: 20,
  diversity: 10,
  docs: 10,
};

function WeightsForm({ weights, setWeights, dark = true, isModal = false, onClose }) {
  const total = Object.values(weights || {}).reduce((a, b) => a + b, 0);
  const isBalanced = total === 100;

  const handleReset = () => {
    setWeights(DEFAULT_WEIGHTS);
  };

  const content = (
    <div
      className={`rounded-2xl border p-6 ${
        isModal
          ? 'w-full max-w-lg max-h-[85vh] overflow-y-auto pb-20 bg-slate-900/95 border-white/10 shadow-[inset_0_0_15px_rgba(255,255,255,0.05)] shadow-2xl backdrop-blur-xl animate-fade-in-up'
          : 'max-w-lg mx-auto'
      }`}
      style={
        !isModal
          ? {
              background: dark ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.95)',
              borderColor: dark ? 'rgba(255,255,255,0.1)' : 'var(--border)',
              backdropFilter: 'blur(16px)',
              boxShadow: 'inset 0 0 10px rgba(255,255,255,0.05)',
            }
          : undefined
      }
    >
      <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white tracking-tight">
              Custom Scoring Weights
            </h3>
            <p className="text-[11px] text-gray-400">
              Fine-tune the algorithm parameters to your benchmark
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold border transition ${
              isBalanced
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}
          >
            {total}/100 {isBalanced ? '✓' : '⚠'}
          </span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
              aria-label="Close weights modal"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(weights || {}).map(([key, val]) => {
          const meta = weightMeta[key] || { label: key, icon: '📊', max: 50 };
          return (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={`weight-${key}`}
                  className="text-xs font-semibold flex items-center gap-2 text-gray-200"
                >
                  <span className="text-base">{meta.icon}</span> {meta.label}
                </label>
                <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {val}%
                </span>
              </div>
              <input
                id={`weight-${key}`}
                type="range"
                min="0"
                max={meta.max}
                value={val}
                onChange={(e) =>
                  setWeights((w) => ({ ...w, [key]: parseInt(e.target.value, 10) || 0 }))
                }
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-800 accent-indigo-500"
                style={{
                  background: `linear-gradient(to right, #6366f1 ${(val / meta.max) * 100}%, #1e293b ${(val / meta.max) * 100}%)`,
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-white/10 transition border border-white/10 active:scale-95"
          title="Reset weights to default: 15, 25, 20, 20, 10, 10"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Default</span>
        </button>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition active:scale-95"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Weights</span>
          </button>
        )}
      </div>
    </div>
  );

  if (isModal || onClose) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
        <div
          className="fixed inset-0"
          onClick={onClose}
          aria-hidden="true"
        />
        <div className="relative z-10 w-full max-w-lg">
          {content}
        </div>
      </div>
    );
  }

  return content;
}

export default WeightsForm;
