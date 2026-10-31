import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, Lightbulb, ChevronRight, ExternalLink, Wrench } from 'lucide-react';
import QuickFixModal from './QuickFixModal';

const sectionConfig = {
  strengths: {
    title: 'Strengths',
    icon: CheckCircle,
    gradient: 'linear-gradient(135deg, #10b981, #34d399)',
    bgColor: 'rgba(16, 185, 129, 0.06)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    textColor: '#10b981',
    emoji: '💪',
  },
  redFlags: {
    title: 'Red Flags',
    icon: AlertTriangle,
    gradient: 'linear-gradient(135deg, #ef4444, #f87171)',
    bgColor: 'rgba(239, 68, 68, 0.06)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
    textColor: '#ef4444',
    emoji: '🚩',
  },
  suggestions: {
    title: 'Suggestions',
    icon: Lightbulb,
    gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    bgColor: 'rgba(245, 158, 11, 0.06)',
    borderColor: 'rgba(245, 158, 11, 0.2)',
    textColor: '#f59e0b',
    emoji: '💡',
  },
};

function InsightCard({ type, items, username, topRepos = [], onSelectRedFlag }) {
  const config = sectionConfig[type];
  const Icon = config.icon;

  const getFixLink = () => {
    if (!username) return null;
    const firstRepo = topRepos?.[0]?.name;
    if (firstRepo) {
      return `https://github.com/${username}/${firstRepo}/settings`;
    }
    return `https://github.com/${username}?tab=repositories`;
  };

  const fixUrl = getFixLink();

  return (
    <div
      className="rounded-2xl border p-5 transition-all hover:shadow-lg"
      style={{ background: config.bgColor, borderColor: config.borderColor }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
          style={{ background: config.gradient }}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
            {config.emoji} {config.title}
          </h3>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {items.length} {items.length === 1 ? 'item' : 'items'} found
          </span>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
          {type === 'redFlags' ? 'No red flags — great job!' : 'None detected'}
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-2 text-sm animate-fade-in-up"
              style={{ animationDelay: `${i * 0.05}s`, color: 'var(--text-secondary)' }}
            >
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: config.textColor }} />
                <span className="break-words">{item}</span>
              </div>
              {/* Feature 10 & 16: Quick Fix Modal and Repo Settings Deep Links */}
              {type === 'redFlags' && (
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                  <button
                    type="button"
                    onClick={() => onSelectRedFlag && onSelectRedFlag(item)}
                    className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition"
                    title="Open Issue / PR Quick Fix Template"
                  >
                    <Wrench className="w-2.5 h-2.5" /> Quick Fix
                  </button>
                  {fixUrl && (
                    <a
                      href={fixUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-0.5 text-[11px] font-semibold text-rose-400 hover:text-rose-300 underline"
                      title="Open Settings"
                    >
                      Fix <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Insights({ strengths, redFlags, suggestions, username, topRepos }) {
  const [activeFix, setActiveFix] = useState(null);

  return (
    <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
        📋 Recruiter Insights
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 stagger-children">
        <InsightCard type="strengths" items={strengths || []} username={username} topRepos={topRepos} />
        <InsightCard
          type="redFlags"
          items={redFlags || []}
          username={username}
          topRepos={topRepos}
          onSelectRedFlag={(flag) => setActiveFix(flag)}
        />
        <InsightCard type="suggestions" items={suggestions || []} username={username} topRepos={topRepos} />
      </div>

      {activeFix && (
        <QuickFixModal
          redFlag={activeFix}
          username={username}
          topRepos={topRepos}
          onClose={() => setActiveFix(null)}
        />
      )}
    </div>
  );
}

export default Insights;
