import React, { useState } from 'react';
import { ExternalLink, X, Globe, Shield, RefreshCw } from 'lucide-react';

function IframePreviewModal({ url, repoName, onClose }) {
  const [loading, setLoading] = useState(true);

  if (!url) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-5xl h-[85vh] rounded-2xl border shadow-2xl overflow-hidden flex flex-col"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
      >
        {/* Browser-style address bar header */}
        <div
          className="px-4 py-3 border-b flex items-center justify-between gap-3 select-none"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-glass)' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="ml-2 font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
              Live Demo Preview · <span className="text-indigo-400">{repoName}</span>
            </span>
          </div>

          {/* Fake URL bar */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg border border-white/10 bg-black/20 text-xs text-gray-300 max-w-md flex-1 truncate">
            <Shield className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="truncate">{url}</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-indigo-400/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 transition"
              title="Open in new window"
            >
              <span>Open in Tab</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
              aria-label="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Iframe Viewport */}
        <div className="relative flex-1 bg-white overflow-hidden">
          {loading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900 text-white gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
              <p className="text-xs text-gray-300">Loading live deployment preview...</p>
            </div>
          )}
          <iframe
            src={url}
            title={`${repoName} Live Preview`}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            onLoad={() => setLoading(false)}
          />
        </div>

        {/* Footer info bar */}
        <div
          className="px-4 py-2 border-t flex items-center justify-between text-[11px] text-gray-400"
          style={{ borderColor: 'var(--border)' }}
        >
          <span className="flex items-center gap-1.5 truncate">
            <Globe className="w-3 h-3 text-indigo-400" />
            <span>Note: If your hosting provider sets strict X-Frame-Options headers, use &ldquo;Open in Tab&rdquo;.</span>
          </span>
          <span className="font-semibold text-emerald-400 flex-shrink-0 ml-2">Live HTTP 200</span>
        </div>
      </div>
    </div>
  );
}

export default IframePreviewModal;
