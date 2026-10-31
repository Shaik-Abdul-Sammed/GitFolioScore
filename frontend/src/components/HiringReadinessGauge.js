import React, { useMemo } from 'react';
import { Target } from 'lucide-react';

function HiringReadinessGauge({ githubScore = 80, linkedInScore = null }) {
  // If LinkedIn not synced yet, default baseline linkedInScore to githubScore * 0.9
  const effectiveLinkedInScore = linkedInScore !== null ? linkedInScore : Math.round(githubScore * 0.88);
  const readiness = Math.round(githubScore * 0.7 + effectiveLinkedInScore * 0.3);

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
    <div className="premium-card p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Hiring Readiness Index
          </h3>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold border" style={{ background: status.bg, borderColor: status.border, color: status.color }}>
            {status.label}
          </span>
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
              <span className="text-gray-300">GitHub Code & Repo Quality (70% weight)</span>
              <span className="text-indigo-300 font-bold">{githubScore}/100</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${githubScore}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span className="text-gray-300">LinkedIn Consistency Alignment (30% weight)</span>
              <span className="text-blue-300 font-bold">{effectiveLinkedInScore}/100</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${effectiveLinkedInScore}%` }} />
            </div>
          </div>

          <p className="text-[11px] text-gray-400 pt-1 leading-relaxed">
            {linkedInScore === null
              ? '💡 Tip: Paste your LinkedIn About section in LinkedIn Sync below to calibrate this metric with 100% precision.'
              : '✅ Verified across your code repository audit and declared career credentials.'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default HiringReadinessGauge;
