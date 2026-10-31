import React, { useEffect, useState, useCallback } from 'react';
import {
  Trophy, Medal, Trash2, RefreshCw, Users2,
  MessageCircle, X, Check, Copy,
} from 'lucide-react';
import {
  loadLeaderboard, loadNetwork, addToNetwork, removeFromNetwork,
} from '../lib/leaderboard';

const SCORE_COLOR = (s) => {
  if (s >= 80) return '#10b981';
  if (s >= 60) return '#3b82f6';
  if (s >= 40) return '#f59e0b';
  return '#ef4444';
};

const RANK_ICON = (rank) => {
  if (rank === 0) return <Trophy className="w-4 h-4 text-amber-400" />;
  if (rank === 1) return <Medal className="w-4 h-4 text-slate-300" />;
  if (rank === 2) return <Medal className="w-4 h-4 text-amber-700" />;
  return <span className="text-xs font-bold text-gray-500">#{rank + 1}</span>;
};

function MessageModal({ username, repos, onClose }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const generate = async () => {
      setLoading(true);
      setError('');
      try {
        if (!window.anna?.llm?.complete) throw new Error('Anna LLM not available');
        const repoList = (repos || []).slice(0, 3).map((r) => r.name || r).join(', ');
        const response = await window.anna.llm.complete(
          {
            messages: [{
              role: 'user',
              content: `Draft a short, warm, professional LinkedIn connection request to @${username} (a developer whose GitHub repos include: ${repoList || 'various projects'}). Max 300 characters. Be genuine and specific.`,
            }],
            systemPrompt: 'You are a professional networking coach. Write warm, specific, non-generic connection requests.',
            maxTokens: 150,
            temperature: 0.7,
          },
          { timeoutMs: 45000 }
        );
        setMessage((response?.content?.text || '').trim());
      } catch (err) {
        setError(err.userMessage || err.message || 'Could not draft message.');
      } finally {
        setLoading(false);
      }
    };
    generate();
  }, [username, repos]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl border shadow-2xl overflow-y-auto max-h-[85vh] pb-20"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-indigo-400" />
            <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              AI Connection Request · <span className="text-indigo-400">@{username}</span>
            </h4>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {loading ? (
            <div className="py-8 text-center space-y-2">
              <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin mx-auto" />
              <p className="text-sm text-indigo-200">Drafting personalized message...</p>
            </div>
          ) : error ? (
            <p className="text-sm text-red-400 p-3 rounded-lg bg-red-500/10 border border-red-500/20">{error}</p>
          ) : (
            <>
              <textarea
                className="w-full h-28 text-sm p-3 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
                style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy & Use on LinkedIn'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Leaderboard({ currentUsername, currentScore, currentRepos }) {
  const [tab, setTab] = useState('leaderboard');
  const [entries, setEntries] = useState([]);
  const [network, setNetwork] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageTarget, setMessageTarget] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [lb, nw] = await Promise.all([loadLeaderboard(), loadNetwork()]);
    setEntries(lb);
    setNetwork(nw);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleAddToNetwork = async (username, score) => {
    const updated = await addToNetwork(username, score);
    setNetwork(updated);
  };

  const handleRemoveFromNetwork = async (username) => {
    const updated = await removeFromNetwork(username);
    setNetwork(updated);
  };

  const isInNetwork = (username) =>
    network.some((u) => u.username.toLowerCase() === username.toLowerCase());

  return (
    <div className="premium-card p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Leaderboard & Network
          </h3>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
          {[['leaderboard', 'Leaderboard'], ['network', 'My Network']].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                tab === id ? 'bg-indigo-500 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center">
          <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin mx-auto" />
        </div>
      ) : tab === 'leaderboard' ? (
        entries.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-gray-600" />
            <p>No entries yet. Analyze a GitHub profile to start the leaderboard!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, idx) => (
              <div
                key={entry.username}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  entry.username.toLowerCase() === currentUsername?.toLowerCase()
                    ? 'border-indigo-500/40 bg-indigo-500/5'
                    : 'border-white/8 bg-white/3 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 flex items-center justify-center">{RANK_ICON(idx)}</div>
                  <div>
                    <a
                      href={`https://github.com/${entry.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold hover:text-indigo-300 transition"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      @{entry.username}
                    </a>
                    {entry.languages?.length > 0 && (
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {entry.languages.slice(0, 3).map((l) => l.lang || l.name || l).join(' · ')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm font-black px-2 py-0.5 rounded-lg"
                    style={{ color: SCORE_COLOR(entry.score), background: `${SCORE_COLOR(entry.score)}18` }}
                  >
                    {entry.score}
                  </span>
                  <button
                    onClick={() => isInNetwork(entry.username) ? handleRemoveFromNetwork(entry.username) : handleAddToNetwork(entry.username, entry.score)}
                    className={`p-1.5 rounded-lg border transition text-xs ${
                      isInNetwork(entry.username)
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                        : 'border-white/15 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                    title={isInNetwork(entry.username) ? 'Remove from Network' : 'Add to Network'}
                  >
                    <Users2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        network.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">
            <Users2 className="w-8 h-8 mx-auto mb-2 text-gray-600" />
            <p>Your network is empty. Add developers from the Leaderboard!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {network.map((conn) => (
              <div
                key={conn.username}
                className="flex items-center justify-between p-3 rounded-xl border border-white/8 bg-white/3 hover:bg-white/5 transition"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={`https://github.com/${conn.username}.png?size=32`}
                    alt={conn.username}
                    className="w-8 h-8 rounded-full border border-white/10"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div>
                    <a
                      href={`https://github.com/${conn.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold hover:text-indigo-300 transition"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      @{conn.username}
                    </a>
                    {conn.score != null && (
                      <p className="text-[10px] text-gray-500">Score: {conn.score}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setMessageTarget(conn.username)}
                    className="p-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition"
                    title="Draft AI Connection Message"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleRemoveFromNetwork(conn.username)}
                    className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition"
                    title="Remove from Network"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {messageTarget && (
        <MessageModal
          username={messageTarget}
          repos={currentRepos}
          onClose={() => setMessageTarget(null)}
        />
      )}
    </div>
  );
}

export default Leaderboard;
