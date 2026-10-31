import React, { useState } from 'react';
import { Sparkles, Copy, Check, Code, ExternalLink, ShieldCheck } from 'lucide-react';

function ReadmeWidgetGenerator({ username, score = 88, tier = 'Senior Developer', onToast }) {
  const [copiedType, setCopiedType] = useState(null);
  const [badgeStyle, setBadgeStyle] = useState('for-the-badge'); // 'for-the-badge' | 'flat-square' | 'plastic'

  const scoreColor = score >= 80 ? '6366f1' : score >= 60 ? '10b981' : 'f59e0b';
  const shieldsUrl = `https://img.shields.io/badge/GitFolioScore-${score}%2F100-${scoreColor}?style=${badgeStyle}&logo=github&logoColor=white`;
  const appUrl = 'https://anna.partners/apps/gitfolioscore';

  const markdownSnippet = `[![GitFolioScore](${shieldsUrl})](${appUrl})`;
  const htmlSnippet = `<a href="${appUrl}"><img src="${shieldsUrl}" alt="GitFolioScore ${score}/100" /></a>`;

  const handleCopy = (text, type) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
    setCopiedType(type);
    if (onToast) {
      onToast(`Copied ${type} snippet to clipboard!`, 'success');
    }
    setTimeout(() => setCopiedType(null), 2500);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 shadow-[inset_0_0_15px_rgba(255,255,255,0.05)] backdrop-blur-xl p-6 transition-all hover:border-indigo-500/30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              {'"Hype" README Widget Generator'}
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Markdown / SVG
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              Embed your verified GitFolioScore directly in your GitHub profile README.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
          {['for-the-badge', 'flat-square', 'plastic'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setBadgeStyle(st)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                badgeStyle === st
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {st.replace(/-/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {/* Live Widget Preview */}
        <div className="p-6 rounded-xl bg-slate-950/80 border border-white/10 flex flex-col items-center justify-center space-y-4">
          <div className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">
            Live README Preview
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href={appUrl} target="_blank" rel="noreferrer" className="hover:opacity-90 transition">
              <img src={shieldsUrl} alt={`GitFolioScore ${score}/100`} className="rounded shadow-lg" />
            </a>
          </div>

          {/* High-End Inline SVG Card Preview */}
          <div className="w-full max-w-sm p-4 rounded-xl bg-gradient-to-tr from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 shadow-2xl flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" /> GitFolioScore Verified
              </div>
              <div className="text-sm font-bold text-white">@{username || 'developer'}</div>
              <div className="text-[11px] text-gray-400">{tier}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
                {score}<span className="text-xs font-normal text-gray-400"> / 100 max</span>
              </div>
            </div>
          </div>
        </div>

        {/* Code Snippets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
              <span className="flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-indigo-400" /> Markdown (Profile README)
              </span>
              <button
                type="button"
                onClick={() => handleCopy(markdownSnippet, 'markdown')}
                className="flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition active:scale-95"
              >
                {copiedType === 'markdown' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'markdown' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="text-[11px] font-mono text-gray-300 bg-slate-950 p-2.5 rounded-lg overflow-x-auto border border-white/5">
              {markdownSnippet}
            </pre>
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
              <span className="flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-purple-400" /> HTML Tag
              </span>
              <button
                type="button"
                onClick={() => handleCopy(htmlSnippet, 'html')}
                className="flex items-center gap-1 text-[11px] font-bold text-purple-400 hover:text-purple-300 transition active:scale-95"
              >
                {copiedType === 'html' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'html' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="text-[11px] font-mono text-gray-300 bg-slate-950 p-2.5 rounded-lg overflow-x-auto border border-white/5">
              {htmlSnippet}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReadmeWidgetGenerator;
