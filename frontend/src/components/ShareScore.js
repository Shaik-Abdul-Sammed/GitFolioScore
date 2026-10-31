import React from 'react';
import { Share2 } from 'lucide-react';

function getPercentile(score) {
  if (score >= 95) return 1;
  if (score >= 90) return 5;
  if (score >= 80) return 15;
  if (score >= 70) return 25;
  if (score >= 60) return 40;
  if (score >= 50) return 50;
  return 70;
}

function ShareScore({ score, username, onToast }) {
  const percentile = getPercentile(score);
  const link = 'https://anna.partners/apps/gitfolioscore';
  const text = `I just scored ${score}/100 on GitFolioScore! I'm in the top ${percentile}% of developers. Audit your GitHub here: ${link}`;

  const shareTwitter = () => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
  };

  const shareLinkedIn = async () => {
    const linkedInPostText = `I just scored ${score}/100 on GitFolioScore! 🚀 It uses AI to audit GitHub portfolios against real hiring criteria. Check your score here: https://anna.partners/apps/gitfolioscore #softwareengineering #career`;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(linkedInPostText);
      }
    } catch {
      // Best effort clipboard
    }
    window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank', 'noopener,noreferrer');
    if (onToast) {
      onToast('Professional LinkedIn post copied to clipboard! Just press Ctrl+V to paste.', 'success');
    }
  };

  const copyToClipboard = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      }
      if (onToast) {
        onToast('Score link copied to clipboard!', 'success');
      }
    } catch {
      // Best effort clipboard
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={shareTwitter}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:shadow-md active:scale-95"
        style={{ background: '#1DA1F2' }}
      >
        𝕏 Share
      </button>
      <button
        onClick={shareLinkedIn}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:shadow-md active:scale-95"
        style={{ background: '#0A66C2' }}
      >
        in Share
      </button>
      <button
        onClick={copyToClipboard}
        className="btn-secondary flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl"
      >
        <Share2 className="w-4 h-4" />
        Copy
      </button>
    </div>
  );
}

export default ShareScore;
