import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

function ToastContainer({ toasts = [], onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      className="fixed top-16 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-2"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isInfo = toast.type === 'info';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-2xl backdrop-blur-xl animate-slide-in transition-all ${
              isError
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-100 shadow-rose-900/20'
                : isInfo
                ? 'bg-slate-900/90 border-indigo-500/40 text-indigo-100 shadow-indigo-950/30'
                : 'bg-slate-900/90 border-emerald-500/50 text-emerald-100 shadow-emerald-950/30'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {isError ? (
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              ) : isInfo ? (
                <Info className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              )}
              <span className="text-xs font-medium truncate">{toast.message}</span>
            </div>

            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-gray-400 hover:text-white p-1 rounded-lg transition active:scale-90"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default ToastContainer;
