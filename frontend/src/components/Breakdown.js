import React from 'react';
import { BarChart3, HelpCircle } from 'lucide-react';
import Tooltip from './Tooltip';

const categoryMeta = {
  profile: {
    label: 'Profile',
    icon: '👤',
    color: '#8b5cf6',
    max: 15,
    tip: 'Measures bio completeness, avatar, location, company, and public profile polish.',
  },
  repoQuality: {
    label: 'Repo Quality',
    icon: '📦',
    color: '#3b82f6',
    max: 25,
    tip: 'Evaluates clear repository descriptions, topic tags, and detailed README coverage.',
  },
  activity: {
    label: 'Activity',
    icon: '⚡',
    color: '#10b981',
    max: 20,
    tip: 'Analyzes commit consistency over recent months and active maintenance frequency.',
  },
  impact: {
    label: 'Impact',
    icon: '🌟',
    color: '#f59e0b',
    max: 20,
    tip: 'Calculates stars, community forks, and open-source engagement across your portfolio.',
  },
  diversity: {
    label: 'Diversity',
    icon: '🎨',
    color: '#ec4899',
    max: 10,
    tip: 'Measures breadth across multiple modern programming languages and frameworks.',
  },
  docs: {
    label: 'Documentation',
    icon: '📝',
    color: '#6366f1',
    max: 10,
    tip: 'Audits presence of licenses, contributing guidelines, and architecture documentation.',
  },
};

function Breakdown({ breakdown }) {
  if (!breakdown) return null;

  return (
    <div className="premium-card p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5" style={{ color: 'var(--primary)' }} />
        <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Score Breakdown</h3>
      </div>

      <div className="space-y-4 stagger-children">
        {Object.entries(breakdown).map(([key, value]) => {
          const meta = categoryMeta[key] || { label: key, icon: '📊', color: '#6366f1', max: 25 };
          const percentage = meta.max > 0 ? (value / meta.max) * 100 : 0;

          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  <span>{meta.icon}</span>
                  <span>{meta.label}</span>
                  {meta.tip && (
                    <Tooltip content={meta.tip}>
                      <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-indigo-400 cursor-pointer ml-0.5" />
                    </Tooltip>
                  )}
                </span>
                <span className="text-sm font-bold" style={{ color: meta.color }}>
                  {value}<span className="font-normal" style={{ color: 'var(--text-muted)' }}>/{meta.max}</span>
                </span>
              </div>
              <div className="score-bar">
                <div
                  className="score-bar-fill"
                  style={{
                    width: `${Math.min(percentage, 100)}%`,
                    background: `linear-gradient(90deg, ${meta.color}, ${meta.color}aa)`,
                    transition: 'width 1.2s ease',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="mt-6 pt-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
        <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Total Score</span>
        <span className="text-2xl font-extrabold gradient-text">
          {Object.values(breakdown).reduce((a, b) => a + b, 0)}/100
        </span>
      </div>
    </div>
  );
}

export default Breakdown;
