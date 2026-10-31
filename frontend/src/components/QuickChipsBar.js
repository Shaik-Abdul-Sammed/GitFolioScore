import React from 'react';
import { Clock, Sparkles } from 'lucide-react';

function QuickChipsBar({ recentProfiles = [], famousUsers = [], onSelect, disabled }) {
  if ((!recentProfiles || recentProfiles.length === 0) && (!famousUsers || famousUsers.length === 0)) {
    return null;
  }

  return (
    <div className="w-full max-w-full overflow-hidden mx-auto pt-1 animate-fade-in">
      <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide py-1 px-1">
        <span className="text-[11px] font-semibold text-indigo-200/70 flex items-center gap-1 flex-shrink-0 pl-1">
          <Sparkles className="w-3 h-3 text-indigo-300" />
          <span>Quick Try:</span>
        </span>

        {/* Recent Profiles */}
        {recentProfiles.map((p) => (
          <button
            key={`recent-${p.username}`}
            type="button"
            onClick={() => onSelect(p.username)}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 hover:bg-white/20 border border-white/15 text-indigo-100 hover:text-white transition-all active:scale-95 flex-shrink-0 disabled:opacity-50"
            title={`Analyze @${p.username} (Previous score: ${p.score})`}
          >
            <Clock className="w-3 h-3 text-indigo-300" />
            <span>@{p.username}</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/20">
              {p.score}
            </span>
          </button>
        ))}

        {recentProfiles.length > 0 && famousUsers.length > 0 && (
          <div className="h-4 w-px bg-white/20 flex-shrink-0 mx-0.5" />
        )}

        {/* Famous Profiles */}
        {famousUsers.map((uname) => (
          <button
            key={`famous-${uname}`}
            type="button"
            onClick={() => onSelect(uname)}
            disabled={disabled}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 hover:bg-white/15 border border-white/10 text-indigo-200 hover:text-white transition-all active:scale-95 flex-shrink-0 disabled:opacity-50"
          >
            <span>@{uname}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default QuickChipsBar;
