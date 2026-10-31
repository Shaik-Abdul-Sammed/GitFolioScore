import React from 'react';
import { CreditCard, X, ExternalLink } from 'lucide-react';

function QuotaModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-slate-900 border border-amber-500/30 p-6 shadow-2xl max-h-[85vh] overflow-y-auto pb-20 space-y-5 animate-fade-in-up">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Anna Credits Needed</h4>
              <p className="text-[11px] text-gray-400">Host API Quota Reached</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-center sm:text-left">
          <p className="text-sm text-gray-200 leading-relaxed font-medium">
            You&apos;re out of Anna Credits. Please top up in your Anna OS settings to continue generating AI advice.
          </p>
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
            Your computed GitHub score, repository breakdown, and statistics remain fully available. Only live LLM coaching calls are paused until credits are added.
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition active:scale-95"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <span>Understood</span>
          </button>
          <a
            href="https://anna.partners"
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition"
          >
            <span>Anna Settings</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default QuotaModal;
