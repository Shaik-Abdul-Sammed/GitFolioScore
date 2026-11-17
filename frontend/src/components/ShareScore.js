import React, { useState, useEffect, useRef } from 'react';
import { Share2, RefreshCw } from 'lucide-react';
import { calculatePercentile } from '../lib/score';

function ShareScore({ score, username, onToast }) {
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const timersRef = useRef([]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  const addTimer = (fn, delay) => {
    const t = setTimeout(fn, delay);
    timersRef.current.push(t);
    return t;
  };

  const percentileText = calculatePercentile(score);
  const link = 'https://anna.partners/apps/gitfolioscore';
  const text = `I just scored ${score}/100 on GitFolioScore! I'm in the ${percentileText} of developers. Analyze your GitHub at ${link}`;

  const safeWriteClipboard = async (str) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(str);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = str;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      return true;
    } catch {
      return false;
    }
  };

  const shareTwitter = () => {
    setSharing(true);
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
    addTimer(() => setSharing(false), 800);
  };

  const shareLinkedIn = async () => {
    setSharing(true);
    const linkedInPostText = `I just scored ${score}/100 on GitFolioScore! 🚀 It uses AI to audit GitHub portfolios against real hiring criteria. Analyze your GitHub at https://anna.partners/apps/gitfolioscore #softwareengineering #career`;
    await safeWriteClipboard(linkedInPostText);
    window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank', 'noopener,noreferrer');
    if (onToast) {
      onToast('Professional LinkedIn post copied to clipboard! Just press Ctrl+V to paste.', 'success');
    }
    addTimer(() => setSharing(false), 800);
  };

  const copyToClipboard = async () => {
    setSharing(true);
    setCopied(true);
    await safeWriteClipboard(text);
    if (onToast) {
      onToast('Score link copied to clipboard!', 'success');
    }
    addTimer(() => setSharing(false), 800);
    addTimer(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={shareTwitter}
        disabled={sharing}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:shadow-md active:scale-95 disabled:opacity-50"
        style={{ background: '#1DA1F2' }}
      >
        {sharing ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
        <span>𝕏 Share</span>
      </button>
      <button
        onClick={shareLinkedIn}
        disabled={sharing}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:shadow-md active:scale-95 disabled:opacity-50"
        style={{ background: '#0A66C2' }}
      >
        {sharing ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
        <span>in Share</span>
      </button>
      <button
        onClick={copyToClipboard}
        disabled={sharing}
        className={`btn-secondary flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl disabled:opacity-50 transition-all ${
          copied ? 'animate-copy-pop text-emerald-400 border-emerald-400/40' : ''
        }`}
      >
        {sharing ? <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" /> : <Share2 className="w-4 h-4" />}
        <span>{copied ? 'Copied!' : 'Copy'}</span>
      </button>
    </div>
  );
}

export default ShareScore;
