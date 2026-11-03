import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';

const STORAGE_KEY = 'user_feedback_rating';

/**
 * FeedbackRating: Anime/RPG styled user feedback and star rating component.
 * Persists user rating to window.anna.storage (with localStorage fallback)
 * and grants +50 XP on submission.
 */
function FeedbackRating({ username, onToast, onRewardXP }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  // Check stored rating on mount
  useEffect(() => {
    let mounted = true;
    async function loadRating() {
      try {
        if (window.anna?.storage?.get) {
          const res = await window.anna.storage.get({ key: STORAGE_KEY });
          if (res?.value && mounted) {
            const data = typeof res.value === 'string' ? JSON.parse(res.value) : res.value;
            if (data?.rating) {
              setRating(data.rating);
              setComment(data.comment || '');
              setIsSubmitted(true);
              return;
            }
          }
        }
      } catch (err) {
        // ignore and fallback
      }

      try {
        const local = localStorage.getItem(STORAGE_KEY);
        if (local && mounted) {
          const parsed = JSON.parse(local);
          if (parsed?.rating) {
            setRating(parsed.rating);
            setComment(parsed.comment || '');
            setIsSubmitted(true);
          }
        }
      } catch (err) {
        // ignore
      }
    }
    loadRating();
    return () => {
      mounted = false;
    };
  }, [username]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (rating === 0) {
      onToast?.('Please select a star rating first!', 'error');
      return;
    }

    setSaving(true);
    const payload = {
      rating,
      comment: comment.trim(),
      username: username || 'anonymous',
      submittedAt: new Date().toISOString(),
    };

    // Save to window.anna.storage
    try {
      if (window.anna?.storage?.set) {
        await window.anna.storage.set({ key: STORAGE_KEY, value: payload });
      }
    } catch (err) {
      // ignore
    }

    // Always fallback/sync with localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      // ignore
    }

    setSaving(false);
    setIsSubmitted(true);
    onToast?.('Thanks for the feedback! +50 XP', 'success');
    onRewardXP?.(50, 'Provided Analysis Feedback');
  };

  const handleEditRating = () => {
    setIsSubmitted(false);
  };

  const getStarLabel = (stars) => {
    switch (stars) {
      case 5:
        return 'S-Rank! Legendary Analysis 🔥';
      case 4:
        return 'A-Rank! Great Quality ⚡';
      case 3:
        return 'B-Rank! Good & Helpful 👍';
      case 2:
        return 'C-Rank! Needs Improvement 🛠️';
      case 1:
        return 'D-Rank! Critical Issues ⚠️';
      default:
        return 'Tap a star to rate this audit';
    }
  };

  return (
    <div
      data-testid="feedback-rating-container"
      className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 shadow-2xl relative overflow-hidden manga-halftone-card mt-6 animate-fade-in-up"
    >
      {/* Decorative RPG Header Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
            <Star className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-black text-white font-gaming tracking-tight">
                Rate this Analysis
              </h4>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                +50 XP REWARD
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Help us tune the AI scoring heuristics and multi-agent personas for future developers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-gaming text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>{getStarLabel(hoverRating || rating)}</span>
        </div>
      </div>

      {isSubmitted ? (
        <div className="pt-5 text-center space-y-4 animate-fade-in">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h5 className="text-lg font-black text-white font-gaming">
              Feedback Received · Level Up!
            </h5>
            <p className="text-xs text-emerald-300 font-medium">
              You rated this analysis <span className="font-bold font-mono text-white">{rating} / 5 stars</span>. +50 XP has been credited to your score.
            </p>
            {comment && (
              <p className="text-xs text-gray-400 italic max-w-md mx-auto pt-1">
                &ldquo;{comment}&rdquo;
              </p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleEditRating}
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Update Rating</span>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="pt-5 space-y-4">
          {/* 5 Glowing Star Icons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/70 border border-white/10">
            <span className="text-xs font-semibold text-gray-300">
              Your overall experience:
            </span>

            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isLit = star <= (hoverRating || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 rounded-xl transition-all duration-200 transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors duration-200 ${
                        isLit
                          ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]'
                          : 'text-gray-600 hover:text-yellow-200'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              <span>How can we improve?</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How can we improve? (e.g. Add deeper Rust ecosystem benchmarks, refine ATS scoring for DevOps roles...)"
              className="w-full h-20 text-xs p-3 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder-gray-500"
              style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-gray-400 font-mono">
              Rating: <b className="text-amber-300">{rating ? `${rating}/5 Stars` : 'Unrated'}</b>
            </span>

            <button
              type="submit"
              disabled={rating === 0 || saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 shadow-lg transition-all active:scale-95 disabled:opacity-40 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 font-gaming shadow-amber-500/25"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{saving ? 'Submitting...' : 'Submit Rating (+50 XP)'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default FeedbackRating;
