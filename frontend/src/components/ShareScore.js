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

function ShareScore({ score, username }) {
  const percentile = getPercentile(score);
  const link = typeof window !== 'undefined' ? window.location.href.split('?')[0] : 'https://shaik-abdul-sammed.github.io/GitFolioScore/';
  const text = `I just scored ${score}/100 on GitFolioScore! I'm in the top ${percentile}% of developers. Audit your GitHub here: ${link}`;

  const shareTwitter = () => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
  };

  const shareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`, '_blank', 'noopener,noreferrer');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
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
