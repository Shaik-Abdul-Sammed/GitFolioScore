import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  X,
  Target,
  TrendingUp,
  Award,
  Layers,
  Copy,
  Check,
  RefreshCw,
  FolderGit2,
  CheckCircle2,
  AlertCircle,
  Code2,
} from 'lucide-react';
import { explainScoreAndCareerStrategy, buildLocalScoreExplanation } from '../lib/llm';

const TARGET_ROLES = [
  'Fullstack Engineer',
  'Frontend Engineer',
  'Backend Engineer',
  'Mobile Engineer',
  'DevOps & Cloud Engineer',
  'Machine Learning / AI Engineer',
];

/**
 * ScoreExplainerModal: Deep-dive AI explanation of how the score was calculated
 * and a role-targeted step-by-step roadmap to improve it.
 */
function ScoreExplainerModal({
  isOpen,
  onClose,
  report,
  targetRole = 'Fullstack Engineer',
  onRoleChange,
  onToast,
}) {
  const [activeRole, setActiveRole] = useState(targetRole || 'Fullstack Engineer');
  const [activeTab, setActiveTab] = useState('diagnosis'); // 'diagnosis' | 'alignment' | 'roadmap' | 'project'
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState(() => (report ? buildLocalScoreExplanation(report, targetRole || 'Fullstack Engineer') : null));
  const [copied, setCopied] = useState(false);

  // Sync active role with prop if prop changes
  useEffect(() => {
    if (targetRole) {
      setActiveRole(targetRole);
    }
  }, [targetRole]);

  const loadExplanation = useCallback(async (role) => {
    if (!report) return;
    // Immediate instant baseline diagnosis & roadmap
    const local = buildLocalScoreExplanation(report, role);
    setExplanation(local);

    // If Anna AI environment is present, enrich with generative model
    const hasAnna = typeof window !== 'undefined' && (window.anna?.llm?.complete || window.parent?.anna?.llm?.complete);
    if (hasAnna) {
      setLoading(true);
      try {
        const res = await explainScoreAndCareerStrategy(report, role);
        if (res) {
          setExplanation(res);
        }
      } catch (err) {
        // keep local explanation
      } finally {
        setLoading(false);
      }
    }
  }, [report]);

  useEffect(() => {
    if (isOpen && report) {
      loadExplanation(activeRole);
    }
  }, [isOpen, activeRole, loadExplanation, report]);

  // Handle ESC key close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !report) return null;

  const handleRoleSelect = (newRole) => {
    setActiveRole(newRole);
    onRoleChange?.(newRole);
  };

  const handleCopyRoadmap = () => {
    if (!explanation) return;
    const roadmapText = [
      `# GitFolioScore Career Strategy: ${activeRole}`,
      `Candidate: @${report?.profile?.login || 'developer'} | Score: ${report?.score || 0}/100`,
      '',
      `## Score Diagnosis`,
      explanation.scoreSummary,
      '',
      `## Level-Up Roadmap for ${activeRole}:`,
      ...(explanation.improvementRoadmap || []).map(
        (r, i) => `${i + 1}. [${r.projectedGain}] ${r.step}\n   - Target: ${r.targetPillar}\n   - Action: ${r.actionItem}`
      ),
      '',
      `## Recommended Flagship Project`,
      `Title: ${explanation.flagshipProjectIdea?.title || 'Custom Flagship App'}`,
      `Stack: ${(explanation.flagshipProjectIdea?.techStack || []).join(', ')}`,
      `Architecture: ${explanation.flagshipProjectIdea?.architecture || ''}`,
      `Recruiter Pitch: ${explanation.flagshipProjectIdea?.recruiterAppeal || ''}`,
    ].join('\n');

    navigator.clipboard.writeText(roadmapText);
    setCopied(true);
    onToast?.('Career Strategy Roadmap copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const score = report?.score ?? 0;
  const scoreColor =
    score >= 80 ? '#10b981' : score >= 60 ? '#6366f1' : score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="score-explainer-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      {/* Backdrop click listener */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-3xl rounded-3xl bg-slate-900 border border-white/15 p-6 shadow-2xl max-h-[88vh] flex flex-col justify-between manga-panel-modal">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="score-explainer-title" className="text-base font-bold text-white font-gaming">
                  AI Score Explainer &amp; Career Roadmap
                </h3>
                <span
                  className="text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold border"
                  style={{
                    color: scoreColor,
                    backgroundColor: `${scoreColor}15`,
                    borderColor: `${scoreColor}40`,
                  }}
                >
                  {score}/100
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Evaluation breakdown &amp; actionable score boosting strategy
              </p>
            </div>
          </div>

          {/* Right Controls: Role Switcher & Close */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-400" />
              <label htmlFor="modal-role-select" className="sr-only">Target Career Role</label>
              <select
                id="modal-role-select"
                value={activeRole}
                onChange={(e) => handleRoleSelect(e.target.value)}
                className="bg-transparent text-xs text-gray-200 font-semibold focus:outline-none cursor-pointer"
              >
                {TARGET_ROLES.map((r) => (
                  <option key={r} value={r} className="bg-slate-900 text-white">
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 pt-3 pb-2 border-b border-white/10 text-xs overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('diagnosis')}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'diagnosis'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Score Diagnosis</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('alignment')}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'alignment'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Role Alignment</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('roadmap')}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'roadmap'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Level-Up Roadmap</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('project')}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'project'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Flagship Project</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="my-3 flex-1 overflow-y-auto max-h-[56vh] pr-1 space-y-4">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-7 h-7 text-indigo-400 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-indigo-200 font-gaming">
                Analyzing scoring formula &amp; career benchmarks...
              </p>
              <p className="text-xs text-gray-400">
                Auditing algorithm deductions for <span className="text-indigo-300 font-bold">{activeRole}</span>
              </p>
            </div>
          ) : !explanation ? (
            <div className="py-10 text-center text-xs text-gray-400">
              No explanation available. Please retry.
            </div>
          ) : (
            <>
              {/* Score Diagnosis Tab */}
              {activeTab === 'diagnosis' && (
                <div className="space-y-4 animate-fade-in">
                  {/* High level summary bubble */}
                  <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider font-gaming">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span>Executive Diagnosis</span>
                    </div>
                    <p className="text-xs text-gray-200 leading-relaxed font-medium">
                      {explanation.scoreSummary}
                    </p>
                  </div>

                  {/* 6 Pillars Breakdown */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 font-gaming">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Scoring Pillars Breakdown</span>
                    </h4>

                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {(explanation.pillarAnalysis || []).map((p, idx) => {
                        const pct = Math.round((p.score / p.max) * 100);
                        const isHigh = p.status === 'Strong';
                        const isMed = p.status === 'Good';

                        return (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-slate-950/70 border border-white/10 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white">{p.pillar}</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-mono font-bold text-gray-200">
                                  {p.score}/{p.max}
                                </span>
                                <span
                                  className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                                    isHigh
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                      : isMed
                                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  }`}
                                >
                                  {p.status}
                                </span>
                              </div>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-indigo-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                            </div>

                            <p className="text-[11px] text-gray-400 leading-snug">
                              {p.explanation}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Career Alignment Tab */}
              {activeTab === 'alignment' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-indigo-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider font-gaming">
                        <Target className="w-4 h-4 text-cyan-400" />
                        <span>Domain Alignment for {activeRole}</span>
                      </div>
                      <span className="text-xs font-bold text-white font-gaming bg-indigo-500/30 px-2.5 py-0.5 rounded-full border border-indigo-500/40">
                        {explanation.roleAlignmentDiagnosis?.fitScore ?? 75}% Match
                      </span>
                    </div>
                    <p className="text-xs text-gray-200 leading-relaxed">
                      {explanation.roleAlignmentDiagnosis?.summary}
                    </p>
                  </div>

                  {/* Matched vs Missing Skills */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Matched Skills */}
                    <div className="p-3.5 rounded-xl bg-slate-950/70 border border-emerald-500/20 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Validated Stack for {activeRole}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(explanation.roleAlignmentDiagnosis?.matchedSkills || []).map((sk, i) => (
                          <span
                            key={i}
                            className="text-[11px] px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono"
                          >
                            ✓ {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Missing Skills */}
                    <div className="p-3.5 rounded-xl bg-slate-950/70 border border-rose-500/20 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                        <span>High-Priority Skills to Add</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(explanation.roleAlignmentDiagnosis?.missingSkills || []).map((sk, i) => (
                          <span
                            key={i}
                            className="text-[11px] px-2.5 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono"
                          >
                            + {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Level-Up Roadmap Tab */}
              {activeTab === 'roadmap' && (
                <div className="space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between pb-1">
                    <p className="text-xs text-gray-300 font-medium">
                      Follow these prioritized actions to boost your score to{' '}
                      <span className="text-emerald-400 font-bold">85+</span> for{' '}
                      <span className="text-indigo-300 font-bold">{activeRole}</span>:
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {(explanation.improvementRoadmap || []).map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-950/70 border border-white/10 hover:border-indigo-500/30 transition space-y-1.5"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold font-mono">
                              {idx + 1}
                            </span>
                            <h5 className="text-xs font-bold text-white">{item.step}</h5>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-300">
                              {item.targetPillar}
                            </span>
                            <span className="text-[11px] font-bold text-emerald-400 font-gaming bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                              {item.projectedGain}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-300 leading-relaxed pl-7">
                          {item.actionItem}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Flagship Project Tab */}
              {activeTab === 'project' && (
                <div className="space-y-3.5 animate-fade-in">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/50 border border-indigo-500/30 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <FolderGit2 className="w-5 h-5 text-indigo-400" />
                        <h4 className="text-sm font-bold text-white font-gaming">
                          {explanation.flagshipProjectIdea?.title}
                        </h4>
                      </div>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold">
                        Targeted for {activeRole}
                      </span>
                    </div>

                    {/* Tech Stack badges */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                        Recommended Stack:
                      </span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(explanation.flagshipProjectIdea?.techStack || []).map((t, i) => (
                          <span
                            key={i}
                            className="text-[11px] px-2.5 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono font-medium"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* System Architecture */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                        System Architecture:
                      </span>
                      <p className="text-xs text-gray-200 leading-relaxed font-medium">
                        {explanation.flagshipProjectIdea?.architecture}
                      </p>
                    </div>

                    {/* Recruiter Appeal */}
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>Why Recruiters Value This</span>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        {explanation.flagshipProjectIdea?.recruiterAppeal}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10 flex-wrap gap-3">
          <button
            type="button"
            onClick={handleCopyRoadmap}
            disabled={!explanation}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition active:scale-95 disabled:opacity-50"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Roadmap!' : 'Copy Career Roadmap'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition active:scale-95 shadow-md shadow-indigo-500/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScoreExplainerModal;
