import React from 'react';
import { Search, Trophy, FileText, Sparkles, X, ArrowRight } from 'lucide-react';

function OnboardingModal({ isOpen, onClose, onQuickTry }) {
  if (!isOpen) return null;

  const steps = [
    {
      num: '1',
      icon: <Search className="w-5 h-5 text-indigo-400" />,
      title: 'Enter Your GitHub Handle',
      desc: 'Type your username or use voice search to index repositories, stars, and commit velocity.',
    },
    {
      num: '2',
      icon: <Trophy className="w-5 h-5 text-amber-400" />,
      title: 'Get Your Verified AI Score',
      desc: 'Benchmark your portfolio against FAANG hiring rubrics, code quality, and ATS keyword visibility.',
    },
    {
      num: '3',
      icon: <FileText className="w-5 h-5 text-emerald-400" />,
      title: 'Generate Resumes & Fix Red Flags',
      desc: 'Export HackerRank-format PDFs, generate missing README PRs with 1 click, and share verified badges.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-slate-900 border border-indigo-500/30 p-6 shadow-2xl max-h-[85vh] overflow-y-auto pb-20 space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border border-white/20"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white tracking-tight">
                Welcome to GitFolioScore
              </h3>
              <p className="text-xs text-indigo-200">
                The ultimate AI-powered GitHub portfolio audit suite for Anna OS
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
            aria-label="Close walkthrough"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Steps */}
        <div className="space-y-3.5">
          {steps.map((st) => (
            <div
              key={st.num}
              className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/5 border border-white/10 transition hover:border-indigo-500/40"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                {st.icon}
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-200 font-mono">
                    Step {st.num}
                  </span>
                  {st.title}
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Controls */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs text-white shadow-xl transition active:scale-95"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <span>Start Portfolio Audit</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center">
            <span className="text-[11px] text-gray-400 mr-1.5">Or test immediately:</span>
            <button
              type="button"
              onClick={() => {
                if (onQuickTry) onQuickTry('torvalds');
                onClose();
              }}
              className="text-[11px] font-semibold text-indigo-300 hover:text-white underline mr-2"
            >
              @torvalds
            </button>
            <button
              type="button"
              onClick={() => {
                if (onQuickTry) onQuickTry('gaearon');
                onClose();
              }}
              className="text-[11px] font-semibold text-indigo-300 hover:text-white underline"
            >
              @gaearon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnboardingModal;
