import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Search,
  Trash2,
  ExternalLink,
  Edit3,
  Check,
  X,
  Crown,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Tag,
} from 'lucide-react';
import {
  loadAuditHistory,
  updateAuditEntry,
  deleteAuditEntry,
  clearAuditHistory,
  getClaimedPortfolio,
  setClaimedPortfolio,
} from '../lib/auditHistory';

const ROLES = [
  'All Roles',
  'Fullstack Engineer',
  'Frontend Engineer',
  'Backend Engineer',
  'Machine Learning / AI Engineer',
  'DevOps & Cloud Engineer',
  'Mobile Engineer',
];

const SCORE_TIERS = [
  { label: 'All Scores', min: 0, max: 100 },
  { label: 'Elite (80 - 100)', min: 80, max: 100 },
  { label: 'Strong (60 - 79)', min: 60, max: 79 },
  { label: 'Developing (< 60)', min: 0, max: 59 },
];

export default function AuditHistoryModal({
  isOpen,
  onClose,
  onSelectAudit,
  currentUsername,
  onToast,
}) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [selectedTier, setSelectedTier] = useState('All Scores');
  const [onlyMyPortfolio, setOnlyMyPortfolio] = useState(false);
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'highest' | 'lowest'
  const [editingId, setEditingId] = useState(null);
  const [editNotes, setEditNotes] = useState('');
  const [editTags, setEditTags] = useState('');
  const [claimedUser, setClaimedUser] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    refreshData();
  }, [isOpen]);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [hist, claimed] = await Promise.all([
        loadAuditHistory(),
        getClaimedPortfolio(),
      ]);
      setHistory(hist);
      setClaimedUser(claimed);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (entry) => {
    setEditingId(entry.id);
    setEditNotes(entry.notes || '');
    setEditTags(Array.isArray(entry.tags) ? entry.tags.join(', ') : '');
  };

  const handleSaveEdit = async (id) => {
    const parsedTags = editTags
      .split(',')
      .map((t) => t.trim().replace(/^#+/, ''))
      .filter(Boolean);
    const updated = await updateAuditEntry(id, {
      notes: editNotes.trim(),
      tags: parsedTags,
    });
    setHistory(updated);
    setEditingId(null);
    if (onToast) onToast('Audit notes and tags updated!', 'success');
  };

  const handleDelete = async (id, uname) => {
    const updated = await deleteAuditEntry(id);
    setHistory(updated);
    if (onToast) onToast(`Removed audit record for @${uname}`, 'info');
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear your entire audit history?')) {
      await clearAuditHistory();
      setHistory([]);
      if (onToast) onToast('Audit history cleared', 'info');
    }
  };

  const handleToggleClaim = async (uname) => {
    const isCurrentlyClaimed = (claimedUser || '').toLowerCase() === (uname || '').toLowerCase();
    const newClaim = isCurrentlyClaimed ? null : uname;
    await setClaimedPortfolio(newClaim);
    setClaimedUser(newClaim);
    if (onToast) {
      onToast(
        newClaim ? `Claimed @${newClaim} as My Portfolio!` : `Unclaimed portfolio @${uname}`,
        'success'
      );
    }
    refreshData();
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `gitfolioscore-audit-history-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    if (onToast) onToast('Exported audit history JSON!', 'success');
  };

  // Filtered & sorted entries
  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const tier = SCORE_TIERS.find((t) => t.label === selectedTier) || SCORE_TIERS[0];

    return history
      .filter((entry) => {
        // Search query
        if (q) {
          const uMatch = (entry.username || '').toLowerCase().includes(q);
          const nMatch = (entry.name || '').toLowerCase().includes(q);
          const notesMatch = (entry.notes || '').toLowerCase().includes(q);
          const tagMatch = (entry.tags || []).some((t) => t.toLowerCase().includes(q));
          if (!uMatch && !nMatch && !notesMatch && !tagMatch) return false;
        }

        // Role filter
        if (selectedRole !== 'All Roles' && entry.targetRole !== selectedRole) {
          return false;
        }

        // Score tier filter
        const score = entry.score || 0;
        if (score < tier.min || score > tier.max) {
          return false;
        }

        // Only My Portfolio filter
        if (onlyMyPortfolio) {
          const isMine = entry.isMyPortfolio || ((claimedUser || '').toLowerCase() === (entry.username || '').toLowerCase());
          if (!isMine) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return (b.timestamp || 0) - (a.timestamp || 0);
        if (sortBy === 'oldest') return (a.timestamp || 0) - (b.timestamp || 0);
        if (sortBy === 'highest') return (b.score || 0) - (a.score || 0);
        if (sortBy === 'lowest') return (a.score || 0) - (b.score || 0);
        return 0;
      });
  }, [history, searchQuery, selectedRole, selectedTier, onlyMyPortfolio, sortBy, claimedUser]);

  if (!isOpen) return null;

  const formatTimestamp = (ts) => {
    if (!ts) return 'Unknown date';
    const date = new Date(ts);
    const now = Date.now();
    const diffMs = now - ts;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getScoreColor = (score = 0) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
    if (score >= 60) return 'text-indigo-300 bg-indigo-500/20 border-indigo-500/30';
    if (score >= 40) return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/20 border-rose-500/30';
  };

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-history-modal-title"
    >
      <div
        className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-slate-900/95 border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="audit-history-modal-title" className="text-base sm:text-lg font-bold text-white">
                  Audit History & Timeline
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  {history.length} {history.length === 1 ? 'audit' : 'audits'}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Chronological timeline with score tracking, notes, and role benchmarks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition"
                  title="Export audit history as JSON"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-300 hover:text-rose-100 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition"
                >
                  Clear All
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Audit History"
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 border border-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-3 sm:p-4 border-b border-white/10 bg-slate-900/60 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Filter by username, note, or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2 rounded-xl text-xs bg-white/5 border border-white/15 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-950 border border-white/15 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            {/* Score Tier Filter */}
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-950 border border-white/15 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {SCORE_TIERS.map((t) => (
                <option key={t.label} value={t.label}>
                  {t.label}
                </option>
              ))}
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-950 border border-white/15 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Score</option>
              <option value="lowest">Lowest Score</option>
            </select>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOnlyMyPortfolio(!onlyMyPortfolio)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition ${
                  onlyMyPortfolio
                    ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 ring-1 ring-amber-400/30'
                    : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>My Portfolio Only</span>
              </button>

              {claimedUser && (
                <span className="text-[11px] text-gray-400 hidden md:inline">
                  Claimed: <strong className="text-amber-300">@{claimedUser}</strong>
                </span>
              )}
            </div>

            <div className="text-[11px] text-gray-400">
              Showing <strong>{filteredEntries.length}</strong> of {history.length}
            </div>
          </div>
        </div>

        {/* Timeline Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {loading ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              Loading audit timeline...
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
                <Clock className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-white">No audits found</div>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                {searchQuery || selectedRole !== 'All Roles' || onlyMyPortfolio
                  ? 'No records match your active search and filter criteria.'
                  : 'You have not audited any GitHub portfolios yet. Search for a profile above to start building your audit timeline!'}
              </p>
            </div>
          ) : (
            <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:via-purple-500 before:to-slate-800">
              {filteredEntries.map((entry) => {
                const isClaimed = (claimedUser || '').toLowerCase() === (entry.username || '').toLowerCase();
                const isEditing = editingId === entry.id;

                return (
                  <div key={entry.id} className="relative group animate-fade-in">
                    {/* Timeline Node Icon */}
                    <div
                      className={`absolute -left-6 sm:-left-8 top-3 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center text-[10px] ${
                        entry.score >= 80
                          ? 'bg-emerald-950 border-emerald-400 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                          : entry.score >= 60
                          ? 'bg-indigo-950 border-indigo-400 text-indigo-300 shadow-[0_0_8px_rgba(99,102,241,0.5)]'
                          : 'bg-slate-950 border-amber-400 text-amber-300'
                      }`}
                    >
                      ●
                    </div>

                    {/* Entry Card */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/40 hover:bg-white/[0.07] transition shadow-lg space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        {/* User & Role info */}
                        <div className="flex items-center gap-3">
                          <img
                            src={entry.avatar_url}
                            alt={entry.username}
                            crossOrigin="anonymous"
                            className="w-10 h-10 rounded-full border border-gray-700 object-cover flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = `https://avatars.githubusercontent.com/${entry.username}`;
                            }}
                          />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-white text-sm">
                                @{entry.username}
                              </span>
                              {entry.name && entry.name !== entry.username && (
                                <span className="text-xs text-gray-400">
                                  ({entry.name})
                                </span>
                              )}
                              {isClaimed && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                  <Crown className="w-3 h-3 text-amber-400" /> My Portfolio
                                </span>
                              )}
                              {entry.roastMode && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                  🔥 Roast
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400 pt-0.5">
                              <span className="text-indigo-300 font-medium">
                                {entry.targetRole}
                              </span>
                              <span>•</span>
                              <span className="text-gray-400 text-[11px] flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatTimestamp(entry.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Score & Delta pill */}
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          {entry.scoreDelta !== 0 && (
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5 ${
                                entry.scoreDelta > 0
                                  ? 'text-emerald-300 bg-emerald-500/20 border border-emerald-500/30'
                                  : 'text-rose-300 bg-rose-500/20 border border-rose-500/30'
                              }`}
                            >
                              {entry.scoreDelta > 0 ? (
                                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                              )}
                              <span>{entry.scoreDelta > 0 ? `+${entry.scoreDelta}` : entry.scoreDelta} pts</span>
                            </span>
                          )}

                          <div className={`px-3 py-1 rounded-xl font-extrabold text-sm border flex items-center gap-1 ${getScoreColor(entry.score)}`}>
                            <span>Score:</span>
                            <span className="text-base font-black">{entry.score}</span>
                          </div>
                        </div>
                      </div>

                      {/* Score breakdown pills */}
                      {entry.scoreBreakdown && Object.keys(entry.scoreBreakdown).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1 text-[10px]">
                          {Object.entries(entry.scoreBreakdown).map(([key, val]) => (
                            <span
                              key={key}
                              className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-gray-300 font-mono"
                            >
                              {key}: <strong className="text-white">{val}</strong>
                            </span>
                          ))}
                          {entry.roleFitScore !== undefined && (
                            <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-200 font-semibold">
                              Fit: {entry.roleFitScore}% ({entry.roleFitLabel || 'Aligned'})
                            </span>
                          )}
                        </div>
                      )}

                      {/* Notes & Tags Editor */}
                      {isEditing ? (
                        <div className="p-3 rounded-xl bg-slate-950/80 border border-indigo-500/40 space-y-2.5 animate-fade-in">
                          <div>
                            <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                              Custom Notes (e.g. interview preparation, target strengths):
                            </label>
                            <input
                              type="text"
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              placeholder="Add an audit note..."
                              className="w-full px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/15 text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                              Tags (comma separated, e.g. Interview, FAANG, Junior):
                            </label>
                            <input
                              type="text"
                              value={editTags}
                              onChange={(e) => setEditTags(e.target.value)}
                              placeholder="Interview, TeamLead, ReAudit..."
                              className="w-full px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/15 text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            />
                          </div>
                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="px-2.5 py-1 rounded-lg text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(entry.id)}
                              className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center gap-1 transition"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                          <div className="flex items-center gap-2 flex-wrap">
                            {entry.notes && (
                              <p className="text-gray-300 text-xs italic bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                                &ldquo;{entry.notes}&rdquo;
                              </p>
                            )}
                            {Array.isArray(entry.tags) && entry.tags.length > 0 && (
                              <div className="flex items-center gap-1 flex-wrap">
                                {entry.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                                  >
                                    <Tag className="w-2.5 h-2.5" />
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Card Action Buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectAudit(entry.username, entry.targetRole, Boolean(entry.roastMode));
                              onClose();
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition shadow-sm"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Load Audit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartEdit(entry)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 transition"
                            title="Edit notes and tags"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Notes</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleClaim(entry.username)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl transition ${
                              isClaimed
                                ? 'text-amber-300 bg-amber-500/20 border border-amber-500/30'
                                : 'text-gray-400 hover:text-amber-300 bg-white/5 hover:bg-white/10'
                            }`}
                            title={isClaimed ? 'Unclaim as My Portfolio' : 'Claim as My Portfolio'}
                          >
                            <Crown className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{isClaimed ? 'Claimed' : 'Claim'}</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDelete(entry.id, entry.username)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                          title="Delete this audit record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
