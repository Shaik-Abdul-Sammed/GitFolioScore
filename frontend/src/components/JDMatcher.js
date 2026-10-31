import React, { useState } from 'react';
import { Briefcase, CheckCircle2, AlertTriangle, Sparkles, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { matchJobDescription } from '../lib/llm';

function JDMatcher({ report }) {
  const [isOpen, setIsOpen] = useState(false);
  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [error, setError] = useState('');

  const handleMatch = async () => {
    if (!jdText.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await matchJobDescription(report, jdText);
      setMatchResult(res);
    } catch (err) {
      setError(err.userMessage || 'Could not analyze job description. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="premium-card p-6 border-indigo-500/30 shadow-lg animate-fade-in-up">
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2.5">
          <Briefcase className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Job Description Matcher & ATS Keyword Scanner
          </h3>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
            ATS AI
          </span>
        </div>
        <button
          className="p-1 rounded-lg text-gray-400 hover:text-white transition"
          aria-label={isOpen ? 'Collapse JD Matcher' : 'Expand JD Matcher'}
        >
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-5 space-y-4 animate-fade-in">
          <p className="text-xs text-gray-400 leading-relaxed">
            Paste any job posting or requirements list. Our AI evaluates your repositories, languages, and technical depth to calculate an ATS match score and pinpoint missing keywords.
          </p>

          <textarea
            className="w-full h-32 p-3.5 rounded-xl text-xs font-mono border focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            style={{
              background: 'rgba(0, 0, 0, 0.25)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
            placeholder="Paste Job Description here (e.g. Senior Fullstack Engineer requirements, preferred qualifications, tech stack)..."
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
          />

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400">
              {jdText.length} characters entered
            </span>
            <button
              onClick={handleMatch}
              disabled={loading || !jdText.trim()}
              className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
              style={{ background: 'var(--gradient-primary)' }}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Analyzing ATS Alignment...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Match Against Portfolio
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {error}
            </div>
          )}

          {matchResult && (
            <div className="pt-4 mt-4 border-t border-white/10 space-y-4">
              {/* Match Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <span className="text-xs text-gray-400 block mb-0.5">ESTIMATED ATS FIT</span>
                  <h4 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <span className="text-indigo-400">{matchResult.matchPercentage}%</span>
                    <span>Role Alignment</span>
                  </h4>
                </div>
                <div className="sm:max-w-md text-xs text-gray-300 leading-relaxed">
                  {matchResult.verdict}
                </div>
              </div>

              {/* Matching & Missing Skills */}
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                {/* Matching */}
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verified Matching Skills ({matchResult.matchingSkills?.length || 0})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.matchingSkills?.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-medium"
                      >
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing ATS Keywords */}
                <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
                  <div className="flex items-center gap-1.5 font-bold text-rose-400 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Missing ATS Keywords ({matchResult.missingSkills?.length || 0})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.missingSkills?.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 font-medium"
                      >
                        + {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default JDMatcher;
