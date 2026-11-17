import React, { useMemo } from 'react';
import { Target, HelpCircle } from 'lucide-react';
import Tooltip from './Tooltip';

function HiringReadinessGauge({ githubScore = 80, linkedInScore = null }) {
  const safeGithubScore = Math.min(100, Math.max(0, Math.round(Number(githubScore) || 0)));
  const isLinkedInCalibrated = linkedInScore !== null && linkedInScore !== undefined;
  
  // When LinkedIn is not provided, evaluate readiness based 100% on analyzed GitHub audit
  // and do NOT fabricate an uncalibrated consistency score.
  const effectiveLinkedInScore = isLinkedInCalibrated
    ? Math.min(100, Math.max(0, Math.round(Number(linkedInScore) || 0)))
    : null;
    
  const readiness = isLinkedInCalibrated
    ? Math.min(100, Math.max(0, Math.round(safeGithubScore * 0.7 + effectiveLinkedInScore * 0.3)))
    : safeGithubScore;

  const status = useMemo(() => {
    if (readiness >= 85) return { label: '🔥 Ready to Apply', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.35)' };
    if (readiness >= 70) return { label: '✨ Strong Candidate', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.35)' };
    if (readiness >= 55) return { label: '📈 Almost Ready', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.35)' };
    return { label: '⚠️ Needs Polish', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.35)' };
  }, [readiness]);

  // SVG Gauge calculations (radius = 54, half circle stroke)
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (readiness / 100) * (circumference * 0.75);

  return (
    <div className="premium-card manga-halftone-card p-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 text-indigo-400 border border-indigo-500/30">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              Hiring Readiness Index
              <Tooltip content="Weighted career readiness index combining analyzed GitHub codebase quality (70%) and declared LinkedIn career alignment (30%).">
                <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-indigo-400 cursor-pointer" />
              </Tooltip>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold border" style={{ background: status.bg, borderColor: status.border, color: status.color }}>
                {status.label}
              </span>
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Weighted career readiness combining analyzed GitHub codebase audit (70%) and LinkedIn alignment (30%).
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Semi-circular gauge */}
        <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
          <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 140 140">
            <circle
              cx="70" cy="70" r={radius}
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="11"
            />
            <circle
              cx="70" cy="70" r={radius}
              fill="none"
              stroke={status.color}
              strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 8px ${status.color}50)` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold" style={{ color: status.color }}>
              {readiness}%
            </span>
            <span className="text-[10px] text-gray-400 font-medium">Readiness</span>
          </div>
        </div>

        {/* Breakdown explanation */}
        <div className="flex-1 space-y-3 text-xs w-full">
          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span className="text-gray-300">GitHub Code & Repo Quality ({isLinkedInCalibrated ? '70% weight' : '100% current weight'})</span>
              <span className="text-indigo-300 font-bold">{safeGithubScore}/100</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${safeGithubScore}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span className="text-gray-300">LinkedIn Consistency Alignment (30% weight)</span>
              <span className={`font-bold ${isLinkedInCalibrated ? 'text-blue-300' : 'text-gray-400 font-mono text-[11px]'}`}>
                {isLinkedInCalibrated ? `${effectiveLinkedInScore}/100` : 'Not Provided / Pending Sync'}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isLinkedInCalibrated ? 'bg-blue-500' : 'bg-gray-600/30'}`}
                style={{ width: isLinkedInCalibrated ? `${effectiveLinkedInScore}%` : '0%' }}
              />
            </div>
          </div>

          <p className="text-[11px] text-gray-400 pt-1 leading-relaxed">
            {isLinkedInCalibrated
              ? `Calculated from your code repository audit and declared career credentials (${effectiveLinkedInScore}/100 consistency match).`
              : 'Supporting Data Notice: No LinkedIn profile provided yet. Consistency score is uncalibrated. Paste your profile into LinkedIn Sync below to factor in career brand consistency.'}
          </p>

          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-[10.5px] font-mono text-gray-300 space-y-0.5">
            <span className="font-bold text-indigo-300 block">Baseline Readiness Math &amp; Weighting:</span>
            <span>Formula: {isLinkedInCalibrated ? `(GitHub Score ${safeGithubScore} × 70%) + (LinkedIn Match ${effectiveLinkedInScore} × 30%) = ${readiness}% Readiness` : `(GitHub Score ${safeGithubScore} × 100%) = ${readiness}% Readiness (Uncalibrated LinkedIn)`}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HiringReadinessGauge;
