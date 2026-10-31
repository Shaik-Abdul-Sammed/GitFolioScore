import React, { useState } from 'react';
import { ExternalLink, X, Globe, Shield, RefreshCw } from 'lucide-react';

function IframePreviewModal({ url, repoName, onClose }) {
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);

  if (!url) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-5xl h-[85vh] max-h-[85vh] overflow-y-auto pb-20 rounded-2xl border shadow-2xl flex flex-col"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
      >
        {/* Browser-style address bar header */}
        <div
          className="px-4 py-3 border-b flex items-center justify-between gap-3 select-none flex-shrink-0"
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
        <div className="relative flex-1 bg-white overflow-hidden min-h-[350px]">
          {loading && !blocked && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900 text-white gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
              <p className="text-xs text-gray-300">Loading live deployment preview...</p>
            </div>
          )}

          {blocked ? (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950 p-6 text-center space-y-4">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Shield className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-1">
                <h4 className="text-base font-bold text-white">This site blocks embedded previews.</h4>
                <p className="text-xs text-gray-400">
                  This deployment specifies strict security headers (e.g. X-Frame-Options or CSP) preventing iframe embedding.
                </p>
              </div>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition active:scale-95"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <span>Click here to open in a new tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : (
            <iframe
              src={url}
              title={`${repoName} Live Preview`}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setBlocked(true);
              }}
            />
          )}
        </div>

        {/* Footer info bar */}
        <div
          className="px-4 py-2 border-t flex items-center justify-between text-[11px] text-gray-400 flex-shrink-0"
          style={{ borderColor: 'var(--border)' }}
        >
          <span className="flex items-center gap-1.5 truncate">
            <Globe className="w-3 h-3 text-indigo-400" />
            <span>
              {blocked
                ? 'Preview blocked by host CSP/X-Frame-Options.'
                : 'Note: If this deployment blocks iframes, use "Open in Tab" or switch to fallback.'}
            </span>
          </span>
          {!blocked && (
            <button
              type="button"
              onClick={() => setBlocked(true)}
              className="text-[10px] text-indigo-300 hover:text-white underline ml-2 flex-shrink-0"
            >
              Blocked? Show fallback
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default IframePreviewModal;
