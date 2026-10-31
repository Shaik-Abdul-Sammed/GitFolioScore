import React, { useState, useRef, useMemo } from 'react';
import {
  Trophy, X, Award, UserPlus, Check, Sparkles, RefreshCw,
  Layers, Download, Bot, FileText, Copy, ExternalLink, Zap
} from 'lucide-react';
import html2canvas from 'html2canvas';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer,
} from 'recharts';
import { addToNetwork } from '../lib/leaderboard';
import { compareProjects, peerCodeReview, stealReadmeStructure } from '../lib/llm';

function CompareDashboard({ user1, user2, onClose }) {
  const cardRef = useRef(null);

  const [addedNetwork, setAddedNetwork] = useState(false);
  const [comparingProjects, setComparingProjects] = useState(false);
  const [similarityData, setSimilarityData] = useState(null);
  const [compareError, setCompareError] = useState('');

  // Feature 8: Peer Code Review AI state
  const [peerReview, setPeerReview] = useState(null);
  const [peerLoading, setPeerLoading] = useState(false);

  // Feature 10: Steal README state
  const [readmeTemplate, setReadmeTemplate] = useState('');
  const [stealingReadme, setStealingReadme] = useState(false);
  const [showReadmeModal, setShowReadmeModal] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  // Feature 14: Export VS Card state
  const [exportingCard, setExportingCard] = useState(false);

  // Feature 9: Skill Gap Radar (Overlay) data (hook declared before early return)
  const radarData = useMemo(() => {
    if (!user1?.report || !user2?.report) return [];
    const r1 = user1.report;
    const r2 = user2.report;
    const langMap = {};
    (r1.mostUsedLanguages || []).forEach((l) => {
      const name = Array.isArray(l) ? l[0] : l.lang || l.name;
      const count = Array.isArray(l) ? l[1] : l.count || 1;
      if (name) langMap[name] = { language: name, user1: count, user2: 0 };
    });
    (r2.mostUsedLanguages || []).forEach((l) => {
      const name = Array.isArray(l) ? l[0] : l.lang || l.name;
      const count = Array.isArray(l) ? l[1] : l.count || 1;
      if (name) {
        if (!langMap[name]) langMap[name] = { language: name, user1: 0, user2: count };
        else langMap[name].user2 = count;
      }
    });
    return Object.values(langMap).slice(0, 6);
  }, [user1, user2]);

  if (!user1?.report || !user2?.report) return null;

  const r1 = user1.report;
  const r2 = user2.report;
  const u1Name = user1.username;
  const u2Name = user2.username;

  const u1Stars = r1.topRepos?.reduce((acc, curr) => acc + (curr.stars || 0), 0) || 0;
  const u2Stars = r2.topRepos?.reduce((acc, curr) => acc + (curr.stars || 0), 0) || 0;

  const u1Followers = r1.profile?.followers || 0;
  const u2Followers = r2.profile?.followers || 0;

  const winner =
    r1.score > r2.score ? u1Name : r2.score > r1.score ? u2Name : 'Tie';

  // Feature 3: Pillar Category Comparison
  const categories = [
    { label: 'Overall Score', v1: r1.score, v2: r2.score, max: 100 },
    { label: 'Repo Quality', v1: r1.scoreBreakdown?.repoQuality || 0, v2: r2.scoreBreakdown?.repoQuality || 0, max: 25 },
    { label: 'Documentation', v1: r1.scoreBreakdown?.docs || 0, v2: r2.scoreBreakdown?.docs || 0, max: 10 },
    { label: 'Commit Activity', v1: r1.scoreBreakdown?.activity || 0, v2: r2.scoreBreakdown?.activity || 0, max: 20 },
    { label: 'Star Impact', v1: r1.scoreBreakdown?.impact || 0, v2: r2.scoreBreakdown?.impact || 0, max: 20 },
    { label: 'Tech Diversity', v1: r1.scoreBreakdown?.diversity || 0, v2: r2.scoreBreakdown?.diversity || 0, max: 10 },
  ];

  const handleAddToNetwork = async () => {
    try {
      await addToNetwork(u2Name, r2.score);
      setAddedNetwork(true);
      setTimeout(() => setAddedNetwork(false), 2500);
    } catch {
      // best effort
    }
  };

  const handleCompareSimilar = async () => {
    setComparingProjects(true);
    setCompareError('');
    try {
      const res = await compareProjects(user1, user2);
      setSimilarityData(res);
    } catch (err) {
      setCompareError(err.userMessage || 'Could not analyze project similarities.');
    } finally {
      setComparingProjects(false);
    }
  };

  // Feature 8: Peer Code Review
  const handlePeerReview = async () => {
    setPeerLoading(true);
    try {
      const res = await peerCodeReview(user1, user2);
      setPeerReview(res);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Peer review failed:', err);
    } finally {
      setPeerLoading(false);
    }
  };

  // Feature 10: Steal README Structure
  const handleStealReadme = async () => {
    const targetRepo = r2.topRepos?.[0] || { name: 'flagship-project' };
    setStealingReadme(true);
    setShowReadmeModal(true);
    try {
      const template = await stealReadmeStructure(targetRepo);
      setReadmeTemplate(template);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Steal README failed:', err);
    } finally {
      setStealingReadme(false);
    }
  };

  // Feature 14: Export VS Card
  const handleExportVSCard = async () => {
    if (!cardRef.current) return;
    setExportingCard(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0f172a',
      });
      const link = document.createElement('a');
      link.download = `gitfolioscore-vs-${u1Name}-vs-${u2Name}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Export VS card failed:', err);
    } finally {
      setExportingCard(false);
    }
  };

  return (
    <div
      ref={cardRef}
      className="premium-card p-6 border-indigo-500/40 bg-gradient-to-b from-indigo-950/40 to-slate-900/80 shadow-2xl animate-fade-in-up"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <Trophy className="w-6 h-6 text-amber-400" />
          <h3 className="text-xl font-bold tracking-tight text-white">
            Head-to-Head Developer Battle
          </h3>
          <span className="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 fill-amber-400" /> Winner: @{winner}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Feature 14: Export VS Card */}
          <button
            type="button"
            onClick={handleExportVSCard}
            disabled={exportingCard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition active:scale-95"
            title="Download PNG snapshot of this VS Battle"
          >
            <Download className="w-3.5 h-3.5 text-indigo-300" />
            <span>{exportingCard ? 'Exporting...' : 'Export VS Card'}</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
              aria-label="Close Comparison"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Side by side overview cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* User 1 */}
        <div
          className={`glass-card p-5 rounded-2xl relative transition-all ${
            winner === u1Name
              ? 'border-emerald-500/60 ring-2 ring-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
              : 'border-white/10'
          }`}
        >
          {winner === u1Name && (
            <span className="absolute -top-3 right-4 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-slate-950 flex items-center gap-1 shadow">
              <Trophy className="w-3 h-3" /> Winner
            </span>
          )}
          <div className="flex items-center gap-4 mb-4">
            <img
              src={r1.profile?.avatar_url || 'https://github.com/ghost.png'}
              alt={u1Name}
              className="w-16 h-16 rounded-xl border-2 border-indigo-500/40 object-cover"
            />
            <div>
              <h4 className="text-lg font-bold text-white flex items-center gap-1.5">
                {r1.profile?.name || u1Name}
                <a
                  href={`https://github.com/${u1Name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-400 hover:underline flex items-center"
                >
                  @{u1Name} <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                </a>
              </h4>
              <p className="text-xs text-gray-400 line-clamp-1">{r1.profile?.bio || 'Software Developer'}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-gray-400 block">Score</span>
              <b className="text-indigo-400 text-lg">{r1.score}</b>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-gray-400 block">Stars</span>
              <b className="text-white text-sm">{u1Stars}</b>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-gray-400 block">Followers</span>
              <b className="text-white text-sm">{u1Followers}</b>
            </div>
          </div>
        </div>

        {/* User 2 */}
        <div
          className={`glass-card p-5 rounded-2xl relative transition-all ${
            winner === u2Name
              ? 'border-emerald-500/60 ring-2 ring-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
              : 'border-white/10'
          }`}
        >
          {winner === u2Name && (
            <span className="absolute -top-3 right-4 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-slate-950 flex items-center gap-1 shadow">
              <Trophy className="w-3 h-3" /> Winner
            </span>
          )}
          <div className="flex items-center gap-4 mb-4">
            <img
              src={r2.profile?.avatar_url || 'https://github.com/ghost.png'}
              alt={u2Name}
              className="w-16 h-16 rounded-xl border-2 border-purple-500/40 object-cover"
            />
            <div>
              <h4 className="text-lg font-bold text-white flex items-center gap-1.5">
                {r2.profile?.name || u2Name}
                <a
                  href={`https://github.com/${u2Name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-400 hover:underline flex items-center"
                >
                  @{u2Name} <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                </a>
              </h4>
              <p className="text-xs text-gray-400 line-clamp-1">{r2.profile?.bio || 'Software Developer'}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-gray-400 block">Score</span>
              <b className="text-purple-400 text-lg">{r2.score}</b>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-gray-400 block">Stars</span>
              <b className="text-white text-sm">{u2Stars}</b>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-gray-400 block">Followers</span>
              <b className="text-white text-sm">{u2Followers}</b>
            </div>
          </div>
        </div>
      </div>

      {/* Feature 3: VS Category Bar Breakdown Overlay */}
      <div className="p-4 rounded-2xl border border-white/10 bg-black/20 mb-6 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
          <Award className="w-4 h-4 text-indigo-400" /> Category Breakdown & Winners
        </h4>
        <div className="grid sm:grid-cols-2 gap-3">
          {categories.map((cat, i) => {
            const u1Win = cat.v1 > cat.v2;
            const u2Win = cat.v2 > cat.v1;
            return (
              <div
                key={i}
                className={`p-2.5 rounded-xl border text-xs transition-all ${
                  u1Win
                    ? 'border-indigo-500/40 bg-indigo-500/5'
                    : u2Win
                    ? 'border-purple-500/40 bg-purple-500/5'
                    : 'border-white/5 bg-white/2'
                }`}
              >
                <div className="flex items-center justify-between font-semibold mb-1">
                  <span className="text-gray-300">{cat.label}</span>
                  <span className="text-[11px]">
                    <span className={u1Win ? 'text-indigo-400 font-bold' : 'text-gray-400'}>
                      @{u1Name} ({cat.v1})
                    </span>
                    <span className="text-gray-500 mx-1.5">vs</span>
                    <span className={u2Win ? 'text-purple-400 font-bold' : 'text-gray-400'}>
                      @{u2Name} ({cat.v2})
                    </span>
                  </span>
                </div>
                {/* Visual Bar Comparison */}
                <div className="flex h-2 rounded-full overflow-hidden bg-white/10 gap-0.5">
                  <div
                    className="bg-indigo-500 rounded-l-full transition-all duration-500"
                    style={{ width: `${(cat.v1 / (cat.v1 + cat.v2 || 1)) * 100}%` }}
                    title={`@${u1Name}: ${cat.v1}`}
                  />
                  <div
                    className="bg-purple-500 rounded-r-full transition-all duration-500"
                    style={{ width: `${(cat.v2 / (cat.v1 + cat.v2 || 1)) * 100}%` }}
                    title={`@${u2Name}: ${cat.v2}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature 9: Skill Gap Radar Overlay */}
      {radarData.length >= 3 && (
        <div className="p-4 rounded-2xl border border-white/10 bg-black/20 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" /> Skill Gap Radar Overlay
            </h4>
            <span className="text-[11px] text-gray-400">Comparing top language distribution</span>
          </div>

          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="language" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <PolarRadiusAxis stroke="#475569" tick={false} />
                <Radar
                  name={`@${u1Name}`}
                  dataKey="user1"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.4}
                />
                <Radar
                  name={`@${u2Name}`}
                  dataKey="user2"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.4}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Action Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleAddToNetwork}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600/40 hover:bg-indigo-600/60 border border-indigo-500/40 transition active:scale-95"
          >
            {addedNetwork ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Added @{u2Name} to Network!</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add @{u2Name} to My Network</span>
              </>
            )}
          </button>

          {/* Feature 8: Senior Engineer Peer Code Review */}
          <button
            type="button"
            onClick={handlePeerReview}
            disabled={peerLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 transition active:scale-95 disabled:opacity-40"
          >
            {peerLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Bot className="w-3.5 h-3.5 text-purple-300" />
            )}
            <span>{peerLoading ? 'Reviewing Code...' : 'Senior Peer Review'}</span>
          </button>

          {/* Feature 10: Steal Competitor README */}
          <button
            type="button"
            onClick={handleStealReadme}
            disabled={stealingReadme}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 transition active:scale-95 disabled:opacity-40"
          >
            <FileText className="w-3.5 h-3.5 text-amber-300" />
            <span>Copy User B&apos;s README Structure</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleCompareSimilar}
          disabled={comparingProjects}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition active:scale-95 disabled:opacity-40"
          style={{ background: 'var(--gradient-primary)' }}
        >
          {comparingProjects ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing Projects...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Compare Similar Projects</span>
            </>
          )}
        </button>
      </div>

      {compareError && (
        <p className="mt-3 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
          {compareError}
        </p>
      )}

      {/* Feature 8: Peer Code Review Result */}
      {peerReview && (
        <div className="mt-4 p-4 rounded-xl border border-purple-500/30 bg-purple-950/20 space-y-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-purple-400" />
            <h5 className="text-xs font-bold text-purple-200">
              Senior Engineer Technical Peer Review
            </h5>
          </div>
          <p className="text-xs text-gray-200 font-medium leading-relaxed bg-black/25 p-3 rounded-lg border border-white/5">
            &ldquo;{peerReview.verdict}&rdquo;
          </p>
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <span className="font-bold text-indigo-300 block mb-1">@{u1Name} Technical Edge:</span>
              <ul className="space-y-0.5 text-gray-300 text-[11px]">
                {(peerReview.strengthsA || []).map((s, idx) => (
                  <li key={idx} className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <span className="font-bold text-purple-300 block mb-1">@{u2Name} Technical Edge:</span>
              <ul className="space-y-0.5 text-gray-300 text-[11px]">
                {(peerReview.strengthsB || []).map((s, idx) => (
                  <li key={idx} className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-purple-400 flex-shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Similar Projects Result */}
      {similarityData && (
        <div className="mt-4 p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5 space-y-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h5 className="text-xs font-bold text-indigo-200">
              Project Comparison & Overlap Analysis
            </h5>
          </div>

          {similarityData.verdict && (
            <p className="text-xs text-gray-200 font-medium leading-relaxed bg-black/20 p-2.5 rounded-lg border border-white/5">
              💡 {similarityData.verdict}
            </p>
          )}

          {similarityData.stackOverlap && similarityData.stackOverlap.length > 0 && (
            <div>
              <span className="text-[11px] font-semibold text-gray-400">Tech Stack Overlap: </span>
              <div className="inline-flex flex-wrap gap-1 mt-1">
                {similarityData.stackOverlap.map((tech, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {similarityData.similarProjects && similarityData.similarProjects.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-gray-400">Direct Project Matches:</span>
              {similarityData.similarProjects.map((p, idx) => (
                <div key={idx} className="text-xs p-2 rounded-lg bg-white/5 border border-white/10 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-indigo-300 font-medium">
                    <span>@{u1Name}: <b>{p.user1Repo}</b></span>
                    <span>⇄</span>
                    <span>@{u2Name}: <b>{p.user2Repo}</b></span>
                  </div>
                  <p className="text-[11px] text-gray-400">{p.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Feature 10: Steal README Modal */}
      {showReadmeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-2xl max-h-[80vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
          >
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                  README Structure Template · <span className="text-amber-400">@{u2Name}</span>
                </h4>
              </div>
              <button
                onClick={() => setShowReadmeModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              {stealingReadme ? (
                <div className="py-12 text-center space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-amber-400 mx-auto" />
                  <p className="text-xs text-gray-300">Extracting high-converting README architecture...</p>
                </div>
              ) : (
                <pre
                  className="p-3 rounded-xl text-xs font-mono whitespace-pre-wrap select-all border"
                  style={{ background: 'rgba(0, 0, 0, 0.35)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                  {readmeTemplate}
                </pre>
              )}
            </div>

            <div className="p-4 border-t flex justify-end gap-2" style={{ borderColor: 'var(--border)' }}>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(readmeTemplate);
                  setCopiedTemplate(true);
                  setTimeout(() => setCopiedTemplate(false), 2000);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition active:scale-95"
                style={{ background: 'var(--gradient-primary)' }}
              >
                {copiedTemplate ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedTemplate ? 'Copied Boilerplate!' : 'Copy README Structure'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompareDashboard;
