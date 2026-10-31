import React, { useState } from 'react';
import {
  Linkedin, Sparkles, Flame, Check, Copy, AlertCircle, RefreshCw, ChevronDown, ChevronUp,
  ShieldCheck, ArrowRight, Gauge,
} from 'lucide-react';
import { auditLinkedIn, generateLinkedInHeadlines } from '../lib/llm';

function LinkedInSync({ report, onUpdateHiringReadiness }) {
  const [isOpen, setIsOpen] = useState(false);
  const [linkedInText, setLinkedInText] = useState('');
  const [roastMode, setRoastMode] = useState(false);
  const [auditing, setAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState(null);
  const [auditError, setAuditError] = useState('');

  const [generatingHeadlines, setGeneratingHeadlines] = useState(false);
  const [headlines, setHeadlines] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const profile = report?.profile || {};
  const topRepos = report?.topRepos || [];
  const languages = report?.mostUsedLanguages || [];

  const handleAudit = async () => {
    if (!linkedInText.trim()) return;
    setAuditing(true);
    setAuditError('');
    try {
      const res = await auditLinkedIn(profile, topRepos, languages, linkedInText, roastMode);
      setAuditResult(res);
      if (onUpdateHiringReadiness && typeof res.consistencyScore === 'number') {
        onUpdateHiringReadiness(res.consistencyScore);
      }
    } catch (err) {
      setAuditError(err.userMessage || 'Could not audit LinkedIn profile text.');
    } finally {
      setAuditing(false);
    }
  };

  const handleGenerateHeadlines = async () => {
    setGeneratingHeadlines(true);
    try {
      const res = await generateLinkedInHeadlines(profile, report.score, topRepos, languages);
      setHeadlines(res.headlines || []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Headline generation error:', err);
    } finally {
      setGeneratingHeadlines(false);
    }
  };

  const handleCopyHeadline = (headline, idx) => {
    navigator.clipboard.writeText(headline);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="premium-card p-6 border-blue-500/30 shadow-lg animate-fade-in-up">
      {/* Header bar */}
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Linkedin className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                LinkedIn Sync & Consistency Audit
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                Simulated AI
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Cross-reference your claimed skills vs. real GitHub commits for hiring integrity.
            </p>
          </div>
        </div>

        <button
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
          aria-label={isOpen ? 'Collapse LinkedIn Sync' : 'Expand LinkedIn Sync'}
        >
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Expandable content */}
      {isOpen && (
        <div className="mt-5 space-y-5 animate-fade-in pt-3 border-t border-white/10">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-300">
                Paste your LinkedIn &ldquo;About&rdquo; Summary or Headline:
              </label>

              {/* Feature 15: Roast My LinkedIn Toggle */}
              <button
                type="button"
                onClick={() => setRoastMode(!roastMode)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition border ${
                  roastMode
                    ? 'bg-orange-500/25 border-orange-500/60 text-orange-300 ring-2 ring-orange-400/30'
                    : 'bg-white/5 border-white/15 text-gray-400 hover:text-white'
                }`}
              >
                <Flame className={`w-3.5 h-3.5 ${roastMode ? 'text-orange-400 fill-orange-400' : ''}`} />
                <span>{roastMode ? '🔥 Roast Mode ON' : 'Roast My LinkedIn'}</span>
              </button>
            </div>

            <textarea
              className="w-full h-24 text-xs p-3 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-500"
              style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              placeholder="e.g. Passionate full-stack engineer with 4 years building reactive user interfaces in React and robust backend microservices in Node..."
              value={linkedInText}
              onChange={(e) => setLinkedInText(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleAudit}
              disabled={auditing || !linkedInText.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white shadow transition-all disabled:opacity-40 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)' }}
            >
              {auditing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              <span>{auditing ? 'Auditing Alignment...' : 'Audit Consistency Score'}</span>
            </button>

            {/* Feature 6: Auto-generate catchy headline button */}
            <button
              onClick={handleGenerateHeadlines}
              disabled={generatingHeadlines}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-200 transition active:scale-95 disabled:opacity-40"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>{generatingHeadlines ? 'Writing Headlines...' : 'Auto-Generate Headlines'}</span>
            </button>
          </div>

          {auditError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{auditError}</span>
            </div>
          )}

          {/* Audit Result Display */}
          {auditResult && (
            <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-950/20 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-blue-200">Consistency Index:</span>
                </div>
                <span className={`text-base font-extrabold px-3 py-0.5 rounded-lg border ${
                  auditResult.consistencyScore >= 75
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : auditResult.consistencyScore >= 50
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                }`}>
                  {auditResult.consistencyScore}% Match
                </span>
              </div>

              <p className="text-xs text-gray-200 leading-relaxed font-medium">
                {auditResult.verdict}
              </p>

              {auditResult.discrepancies && auditResult.discrepancies.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                    Identified Discrepancies:
                  </span>
                  <ul className="mt-1 space-y-1">
                    {auditResult.discrepancies.map((d, i) => (
                      <li key={i} className="text-xs text-gray-300 flex items-start gap-1.5">
                        <span className="text-rose-400">•</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {auditResult.recommendations && auditResult.recommendations.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                    Recommended Fixes:
                  </span>
                  <ul className="mt-1 space-y-1">
                    {auditResult.recommendations.map((r, i) => (
                      <li key={i} className="text-xs text-gray-300 flex items-start gap-1.5">
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Generated Headlines */}
          {headlines && headlines.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/10">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> High-Converting LinkedIn Headlines:
              </span>
              <div className="space-y-2">
                {headlines.map((hl, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="text-gray-200 font-medium">{hl}</span>
                    <button
                      onClick={() => handleCopyHeadline(hl, idx)}
                      className="px-2.5 py-1 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 text-[11px] font-semibold text-gray-300 transition flex items-center gap-1 flex-shrink-0"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LinkedInSync;
