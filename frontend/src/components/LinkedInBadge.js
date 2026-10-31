import React, { useState } from 'react';
import { Award, Copy, CheckCircle } from 'lucide-react';

function LinkedInBadge({ username, score }) {
  const [copied, setCopied] = useState(false);

  const scoreColor = score >= 80 ? '#10b981' : score >= 60 ? '#3b82f6' : score >= 40 ? '#f59e0b' : '#ef4444';
  const scoreLabel = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Work';

  const appUrl = 'https://anna.partners/apps/gitfolioscore';
  const badgeMarkdown = `[![GitFolioScore: ${score}/100](https://img.shields.io/badge/GitFolioScore-${score}%2F100-${scoreColor.replace('#', '')}?style=for-the-badge&logo=github)](${appUrl})`;

  const handleCopy = () => {
    navigator.clipboard.writeText(badgeMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="premium-card p-6 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5" style={{ color: scoreColor }} />
        <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>LinkedIn Badge</h3>
      </div>

      {/* Badge preview */}
      <div className="flex items-center justify-center mb-5">
        <div
          className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl border-2 shadow-lg"
          style={{ borderColor: scoreColor, background: `${scoreColor}08` }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold shadow-md"
            style={{ background: `linear-gradient(135deg, ${scoreColor}, ${scoreColor}cc)` }}
          >
            {score}
          </div>
          <div>
            <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              GitFolioScore
            </div>
            <div className="text-xs font-medium" style={{ color: scoreColor }}>
              {scoreLabel} Portfolio
            </div>
          </div>
        </div>
      </div>

      {/* Copy badge code */}
      <div className="space-y-2">
        <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          Add this badge to your README or LinkedIn:
        </label>
        <div className="flex gap-2">
          <code
            className="flex-1 text-xs px-3 py-2 rounded-lg overflow-hidden text-ellipsis whitespace-nowrap"
            style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          >
            {badgeMarkdown}
          </code>
          <button
            onClick={handleCopy}
            className="btn-secondary flex items-center gap-1.5 text-sm px-3 py-2"
          >
            {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LinkedInBadge;
