import React, { useMemo, useRef, useState } from 'react';
import {
  MapPin, Users, GitBranch, Calendar, Award,
  Mail, Link as LinkIcon, Building, ExternalLink, Download, Sparkles, CheckCircle2
} from 'lucide-react';
import html2canvas from 'html2canvas';

const ScoreCard = ({ score, profile, previousScore, showDetails = true, onShare }) => {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const scoreColor = useMemo(() => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  }, [score]);

  const scoreMessage = useMemo(() => {
    if (score >= 80) return '🏆 Excellent Portfolio!';
    if (score >= 60) return '✨ Good Portfolio';
    if (score >= 40) return '📈 Needs Improvement';
    return '⚠️ Critical Attention Needed';
  }, [score]);

  // Feature 8: Score History Tracking & Badge
  const scoreHistoryBadge = useMemo(() => {
    if (previousScore === undefined || previousScore === null) {
      return {
        text: 'Initial Audit Recorded',
        color: '#818cf8',
        bg: 'rgba(99, 102, 241, 0.12)',
        border: 'rgba(99, 102, 241, 0.3)',
      };
    }
    const diff = score - previousScore;
    if (diff > 0) {
      return {
        text: `Score +${diff} since last audit!`,
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.12)',
        border: 'rgba(16, 185, 129, 0.3)',
      };
    }
    if (diff < 0) {
      return {
        text: `Score ${diff} since last audit`,
        color: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.12)',
        border: 'rgba(245, 158, 11, 0.3)',
      };
    }
    return {
      text: 'Score unchanged since last audit',
      color: '#94a3b8',
      bg: 'rgba(148, 163, 184, 0.12)',
      border: 'rgba(148, 163, 184, 0.3)',
    };
  }, [score, previousScore]);

  // Feature 7: Profile Completion Progress Bar Calculation
  const profileCompletion = useMemo(() => {
    if (!profile) return 0;
    let total = 0;
    if (profile.avatar_url) total += 15;
    if (profile.bio && profile.bio.trim().length > 10) total += 20;
    if (profile.location) total += 15;
    if (profile.company || profile.blog || profile.email) total += 15;
    if ((profile.public_repos || 0) >= 3) total += 15;
    // Scale remaining 20% according to overall score
    total += Math.round((Math.min(score, 100) / 100) * 20);
    return Math.min(100, Math.max(10, total));
  }, [profile, score]);

  // Feature 3: Dynamic OG Image Generation using html2canvas
  const handleDownloadScorecard = async () => {
    if (!cardRef.current) return;
    try {
      setDownloading(true);
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0f172a',
      });
      const link = document.createElement('a');
      link.download = `gitfolioscore-${profile.login || 'portfolio'}-scorecard.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Scorecard download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  const getMemberSince = () => {
    if (!profile.created_at) return '';
    const date = new Date(profile.created_at);
    const now = new Date();
    const years = now.getFullYear() - date.getFullYear();
    return `${years} ${years === 1 ? 'year' : 'years'}`;
  };

  // SVG ring parameters
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div ref={cardRef} className="premium-card overflow-hidden animate-fade-in-up">
      {/* Feature 7: Profile Completion Progress Bar */}
      <div className="px-8 pt-5 pb-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-glass)' }}>
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-1.5 font-semibold" style={{ color: 'var(--text-primary)' }}>
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Profile Completion Index</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-indigo-400">{profileCompletion}%</span>
            <span style={{ color: 'var(--text-muted)' }}>towards Perfect 100</span>
          </div>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden bg-white/10">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${profileCompletion}%`,
              background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #10b981 100%)',
            }}
          />
        </div>
      </div>

      <div className="p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="relative">
              <img
                src={profile.avatar_url}
                alt={`${profile.name || profile.login || 'User'}'s avatar`}
                className="w-28 h-28 rounded-2xl border-4 shadow-lg object-cover"
                style={{ borderColor: scoreColor }}
              />
              {profile.hireable && (
                <span className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg" style={{ background: '#10b981' }}>
                  Hireable
                </span>
              )}
            </div>
          </div>

          {/* Score Ring */}
          <div className="flex-shrink-0 relative">
            <svg width="140" height="140" className="-rotate-90">
              <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--border)" strokeWidth="10" />
              <circle
                cx="70" cy="70" r={radius} fill="none"
                stroke={scoreColor}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{ animation: 'scoreReveal 1.5s ease forwards', filter: `drop-shadow(0 0 8px ${scoreColor}40)` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold" style={{ color: scoreColor }}>
                {score}
              </span>
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>/100</span>
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {profile.name || profile.login || 'Unknown'}
                </h2>
                {profile.login && (
                  <a
                    href={profile.html_url || `https://github.com/${profile.login}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm font-medium hover:underline"
                    style={{ color: 'var(--primary)' }}
                  >
                    @{profile.login} <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Feature 3: Download Scorecard Button */}
              <button
                onClick={handleDownloadScorecard}
                disabled={downloading}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-indigo-400/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-semibold shadow transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloading ? 'Capturing...' : 'Download Scorecard'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="badge badge-purple font-semibold" style={{ background: `${scoreColor}15`, color: scoreColor }}>
                {scoreMessage}
              </span>

              {/* Feature 8: Score History Badge */}
              {scoreHistoryBadge && (
                <span
                  className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border shadow-sm"
                  style={{
                    color: scoreHistoryBadge.color,
                    background: scoreHistoryBadge.bg,
                    borderColor: scoreHistoryBadge.border,
                  }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {scoreHistoryBadge.text}
                </span>
              )}
            </div>

            {profile.bio && (
              <p className="text-sm mb-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{profile.bio}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
              {profile.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> {profile.location}
                </span>
              )}
              {profile.company && (
                <span className="flex items-center gap-1.5">
                  <Building className="w-4 h-4" /> {profile.company}
                </span>
              )}
              {getMemberSince() && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> Member for {getMemberSince()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      {showDetails && (
        <div className="border-t px-8 py-5 stagger-children" style={{ borderColor: 'var(--border)', background: 'var(--bg-glass)' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBox icon={<Users className="w-5 h-5" />} label="Followers" value={profile.followers?.toLocaleString() || '0'} color="var(--primary)" />
            <StatBox icon={<Users className="w-5 h-5" />} label="Following" value={profile.following?.toLocaleString() || '0'} color="var(--accent)" />
            <StatBox icon={<GitBranch className="w-5 h-5" />} label="Repositories" value={profile.public_repos || '0'} color="var(--info)" />
            <StatBox icon={<Award className="w-5 h-5" />} label="Score" value={`${score}/100`} color={scoreColor} />
          </div>

          {/* Contact links */}
          {(profile.email || profile.blog || profile.twitter_username) && (
            <div className="mt-4 flex flex-wrap gap-3">
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="flex items-center gap-1.5 text-sm hover:underline" style={{ color: 'var(--text-muted)' }}>
                  <Mail className="w-4 h-4" /> {profile.email}
                </a>
              )}
              {profile.blog && (
                <a href={profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm hover:underline" style={{ color: 'var(--text-muted)' }}>
                  <LinkIcon className="w-4 h-4" /> Website
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* Score legend */}
      <div className="px-8 py-3 border-t flex flex-wrap gap-5 text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> 80-100: Excellent</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> 60-79: Good</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span> 40-59: Needs Work</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> 0-39: Critical</span>
      </div>
    </div>
  );
};

function StatBox({ icon, label, value, color }) {
  return (
    <div className="glass-card p-4 text-center">
      <div className="flex items-center justify-center gap-2 mb-1" style={{ color }}>
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</span>
      </div>
      <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</div>
    </div>
  );
}

export default ScoreCard;