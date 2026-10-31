import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ScoreCard from './components/ScoreCard';
import Breakdown from './components/Breakdown';
import Insights from './components/Insights';
import TopRepos from './components/TopRepos';
import LanguageChart from './components/LanguageChart';
import RepoInsights from './components/RepoInsights';
import useDarkMode from './hooks/useDarkMode';
import CommitActivityGraph from './components/CommitActivityGraph';
import ExportReport from './components/ExportReport';
import ShareScore from './components/ShareScore';
import LinkedInBadge from './components/LinkedInBadge';
import Tips from './components/Tips';
import WeightsForm from './components/WeightsForm';
import CompareDashboard from './components/CompareDashboard';
import JDMatcher from './components/JDMatcher';
import Leaderboard from './components/Leaderboard';
import ResumeGenerator from './components/ResumeGenerator';
import NetworkMatcher from './components/NetworkMatcher';
import UserSearchInput from './components/UserSearchInput';
import PortfolioWebGraph from './components/PortfolioWebGraph';
import ThemeCustomizer from './components/ThemeCustomizer';
import FriendCompareInput from './components/FriendCompareInput';
import HackerRankResume from './components/HackerRankResume';
import LinkedInSync from './components/LinkedInSync';
import HiringReadinessGauge from './components/HiringReadinessGauge';
import {
  Moon,
  Sun,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Copy,
  Check,
  Flame,
  Volume2,
  VolumeX,
  Users2,
  Clock,
  Target,
  Download,
  Zap,
} from 'lucide-react';
import { fetchProfile, fetchRepos } from './lib/github';
import { calculateReport } from './lib/score';
import { generateAdvice } from './lib/llm';
import { cacheGet, cacheSet } from './lib/cache';
import { addLeaderboardEntry } from './lib/leaderboard';

const FAMOUS_USERS = ['torvalds', 'gaearon', 'sindresorhus', 'yyx990803'];

const TARGET_ROLES = [
  'Fullstack Engineer',
  'Frontend Engineer',
  'Backend Engineer',
  'Machine Learning / AI Engineer',
  'DevOps & Cloud Engineer',
  'Mobile Engineer',
];

const REVIEWER_PERSONAS = [
  'Friendly Mentor',
  'Strict FAANG Recruiter',
  'Open Source Maintainer',
  'Tough FAANG Hiring Manager',
];

function App() {
  const [username, setUsername] = useState('');
  const [friendUsername, setFriendUsername] = useState('');
  const [compareData, setCompareData] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [showCompareInput, setShowCompareInput] = useState(false);

  const [targetRole, setTargetRole] = useState('Fullstack Engineer');
  const [persona, setPersona] = useState('Friendly Mentor');
  const [roastMode, setRoastMode] = useState(false);
  const [previousScore, setPreviousScore] = useState(null);
  const [recentProfiles, setRecentProfiles] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [linkedInConsistencyScore, setLinkedInConsistencyScore] = useState(null);

  const [state, setState] = useState('idle'); // idle | fetching | scored | advising | advised | fetch_failed | llm_failed
  const [errorMessage, setErrorMessage] = useState('');
  const [llmError, setLlmError] = useState('');
  const [data, setData] = useState(null);
  const [advice, setAdvice] = useState(null);
  const [copiedShareText, setCopiedShareText] = useState(false);

  const [showWeights, setShowWeights] = useState(false);
  const [weights, setWeights] = useState({
    profile: 15,
    repoQuality: 25,
    activity: 20,
    impact: 20,
    diversity: 10,
    docs: 10,
  });

  const [dark, setDark] = useDarkMode();
  const reportRef = useRef();
  const { i18n } = useTranslation();

  // Test mode initialization from URL (?test=1)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('test') === '1' && !window.anna) {
      // eslint-disable-next-line no-console
      console.log('Test harness activated via ?test=1');
      window.anna = {
        llm: {
          complete: async () => {
            await new Promise((r) => setTimeout(r, 1200));
            return {
              content: {
                type: 'text',
                text: JSON.stringify({
                  summary:
                    'Your portfolio shows strong foundational consistency and clear domain focus. Elevating documentation depth and project impact will position you well for senior opportunities.',
                  actions: [
                    {
                      action: 'Add comprehensive architecture diagrams and setup guides to your top repos.',
                      rationale: 'Detailed READMEs directly increase recruiter evaluation scores and repo clarity.',
                    },
                    {
                      action: 'Tag repositories with relevant ecosystem topics and technologies.',
                      rationale: 'Topic tags improve repository discovery and signal specialization.',
                    },
                    {
                      action: 'Feature 2-3 high-impact capstone projects prominently in your bio and pinned repos.',
                      rationale: 'Recruiters spend <60 seconds scanning; clear anchors drive immediate engagement.',
                    },
                  ],
                  shareText:
                    'I scored my GitHub portfolio on GitFolioScore! Scored across code quality, documentation, and impact.',
                }),
              },
              model: 'mock-model',
              stopReason: 'endTurn',
              usage: { inputTokens: 250, outputTokens: 180, totalTokens: 430 },
            };
          },
        },
        storage: {
          get: async () => ({ exists: false, value: null }),
          set: async () => ({ etag: 'mock-etag', generation: 1, size_bytes: 512 }),
        },
      };
    }
  }, []);

  // Load recent profiles on mount
  useEffect(() => {
    const loadRecent = async () => {
      try {
        if (window.anna?.storage?.get) {
          const res = await window.anna.storage.get({ key: 'recent_profiles' });
          if (Array.isArray(res?.value)) setRecentProfiles(res.value);
        } else if (typeof localStorage !== 'undefined') {
          const stored = localStorage.getItem('recent_profiles');
          if (stored) setRecentProfiles(JSON.parse(stored));
        }
      } catch {
        // Storage is best effort
      }
    };
    loadRecent();
  }, []);

  const runLLMAdvice = async (report, role, isRoast = roastMode, activePersona = persona) => {
    setState('advising');
    setLlmError('');
    try {
      const result = await generateAdvice(report, role, { roastMode: isRoast, persona: activePersona });
      setAdvice(result);
      setState('advised');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('LLM generation error:', err);
      setLlmError(err.userMessage || 'AI analysis could not be completed.');
      setState('llm_failed');
    }
  };

  const handleAnalyze = async (overrideUsername, overrideRole, overrideRoast, overridePersona) => {
    const activeUsername = (overrideUsername !== undefined ? overrideUsername : username).trim();
    if (!activeUsername) return;
    if (overrideUsername !== undefined) setUsername(activeUsername);

    const activeRole = overrideRole !== undefined ? overrideRole : targetRole;
    const activeRoast = overrideRoast !== undefined ? overrideRoast : roastMode;
    const activePersona = overridePersona !== undefined ? overridePersona : persona;

    setErrorMessage('');
    setLlmError('');
    setAdvice(null);
    setData(null);
    setCompareData(null);
    setState('fetching');

    try {
      // Feature 8: Retrieve previous score from storage
      const storageKey = `score_history_${activeUsername.toLowerCase()}`;
      let prevScore = null;
      try {
        if (window.anna?.storage?.get) {
          const res = await window.anna.storage.get({ key: storageKey });
          if (res?.value?.score !== undefined) {
            prevScore = res.value.score;
          }
        } else if (typeof localStorage !== 'undefined') {
          const stored = localStorage.getItem(storageKey);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed?.score !== undefined) prevScore = parsed.score;
          }
        }
      } catch {
        // Storage lookup is best effort
      }
      setPreviousScore(prevScore);

      // 1. Check persistent cache
      const cached = await cacheGet(activeUsername);
      if (cached && cached.report) {
        setData(cached.report);
        setState('scored');
        await runLLMAdvice(cached.report, activeRole, activeRoast, activePersona);
        return;
      }

      // 2. Parallel GitHub fetch
      const [profile, repos] = await Promise.all([
        fetchProfile(activeUsername),
        fetchRepos(activeUsername),
      ]);

      // 3. Pure scoring computation
      const report = calculateReport({ profile, repos, weights });
      setData(report);
      setState('scored');

      // Feature 8: Record new score history
      try {
        const payload = { score: report.score, timestamp: Date.now() };
        if (window.anna?.storage?.set) {
          await window.anna.storage.set({ key: storageKey, value: payload });
        } else if (typeof localStorage !== 'undefined') {
          localStorage.setItem(storageKey, JSON.stringify(payload));
        }
      } catch {
        // Storage save is best effort
      }

      // Phase 4, Feature 13: Save to Multi-Profile Dashboard list
      try {
        setRecentProfiles((prev) => {
          const filtered = prev.filter((p) => p.username.toLowerCase() !== activeUsername.toLowerCase());
          const updated = [{ username: activeUsername, score: report.score }, ...filtered].slice(0, 3);
          if (window.anna?.storage?.set) {
            window.anna.storage.set({ key: 'recent_profiles', value: updated });
          } else if (typeof localStorage !== 'undefined') {
            localStorage.setItem('recent_profiles', JSON.stringify(updated));
          }
          return updated;
        });
      } catch {
        // Storage is best effort
      }

      // 4. Save to client APS cache (best effort)
      await cacheSet(activeUsername, { profile, repos, report });

      // Save to leaderboard (best effort)
      try {
        await addLeaderboardEntry(activeUsername, report.score, report.mostUsedLanguages || []);
      } catch {
        // leaderboard save is best effort
      }

      // 5. Generate AI advice
      await runLLMAdvice(report, activeRole, activeRoast, activePersona);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Analysis error:', err);
      setState('fetch_failed');
      if (err.code === 'RATE_LIMIT') {
        setErrorMessage('GitHub API rate limit exceeded. Please try again in a few minutes.');
      } else if (err.code === 'NOT_FOUND') {
        setErrorMessage(`GitHub user "${activeUsername}" was not found.`);
      } else if (err.code === 'NETWORK') {
        setErrorMessage('Network connection error. Please check your internet connection.');
      } else {
        setErrorMessage(err.message || 'An unexpected error occurred while fetching profile.');
      }
    }
  };

  // Phase 1, Feature 1: Compare with a Friend
  const handleCompare = async () => {
    const u1 = username.trim();
    const u2 = friendUsername.trim();
    if (!u1 || !u2) return;

    setIsComparing(true);
    setErrorMessage('');
    try {
      const [u1Data, u2Data] = await Promise.all([
        Promise.all([fetchProfile(u1), fetchRepos(u1)]),
        Promise.all([fetchProfile(u2), fetchRepos(u2)]),
      ]);

      const rep1 = calculateReport({ profile: u1Data[0], repos: u1Data[1], weights });
      const rep2 = calculateReport({ profile: u2Data[0], repos: u2Data[1], weights });

      setCompareData({
        user1: { username: u1, report: rep1 },
        user2: { username: u2, report: rep2 },
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Compare failed:', err);
      setErrorMessage(err.message || 'Could not fetch profiles for comparison.');
    } finally {
      setIsComparing(false);
    }
  };

  // Phase 4, Feature 15: Read Aloud (TTS)
  const handleToggleSpeech = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!advice?.summary) return;
    const textToRead = `${advice.summary}. Top priorities: ${advice.actions?.map((a) => a.action).join('. ')}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Part 2: Quick Try Click Handler
  const handleQuickTry = (uname) => {
    setUsername(uname);
    handleAnalyze(uname, targetRole, roastMode, persona);
  };

  const handleToggleRoastMode = () => {
    const nextRoast = !roastMode;
    setRoastMode(nextRoast);
    if (data) {
      runLLMAdvice(data, targetRole, nextRoast, persona);
    }
  };

  const handleChangePersona = (newPersona) => {
    setPersona(newPersona);
    if (data) {
      runLLMAdvice(data, targetRole, roastMode, newPersona);
    }
  };

  const handleRetryLLM = () => {
    if (data) {
      runLLMAdvice(data, targetRole, roastMode, persona);
    }
  };

  const handleCopyPortfolioJSON = () => {
    if (!data) return;
    const payload = {
      username,
      score: data.score,
      scoreBreakdown: data.scoreBreakdown,
      profile: data.profile,
      topRepos: data.topRepos,
      mostUsedLanguages: data.mostUsedLanguages,
      strengths: data.strengths,
      redFlags: data.redFlags,
      suggestions: data.suggestions,
      advice: advice || null,
      exportedAt: new Date().toISOString(),
      source: 'https://anna.partners/apps/gitfolioscore',
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${username}_gitfolioscore.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyShareText = () => {
    if (!advice?.shareText) return;
    navigator.clipboard.writeText(advice.shareText);
    setCopiedShareText(true);
    setTimeout(() => setCopiedShareText(false), 2000);
  };

  const isAnalyzing = state === 'fetching';
  const showResults = data && (state === 'scored' || state === 'advising' || state === 'advised' || state === 'llm_failed');

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      {/* Hero Header */}
      <header className="relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-violet-500 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-6">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <span className="text-white text-xl">⚡</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                GitFolio<span className="text-indigo-300">Score</span>
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <select
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/20 bg-white/10 text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
              >
                <option value="en" className="text-gray-900">EN</option>
                <option value="es" className="text-gray-900">ES</option>
              </select>

              <ThemeCustomizer />

              <button
                className="p-2 rounded-lg border border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 transition-all"
                onClick={() => setDark((d) => !d)}
                aria-label="Toggle theme"
              >
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Hero content */}
          <div className="text-center py-6 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
              Your GitHub Portfolio,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
                Scored & AI-Advised
              </span>
            </h2>
            <p className="text-indigo-200/80 text-base md:text-lg max-w-2xl mx-auto mb-8">
              Objective evaluation with scoring breakdown, strengths, red flags, and personalized AI career coaching.
            </p>

            {/* Inputs */}
            <div className="max-w-2xl mx-auto space-y-3">
              {/* Phase 4, Feature 13: Multi-Profile Dashboard Recent Audits */}
              {recentProfiles.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
                  <span className="text-xs text-indigo-200/70 flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5" /> Recent:
                  </span>
                  {recentProfiles.map((p) => (
                    <button
                      key={p.username}
                      type="button"
                      onClick={() => {
                        setUsername(p.username);
                        handleAnalyze(p.username);
                      }}
                      className="px-2.5 py-0.5 rounded-full text-xs bg-white/10 hover:bg-white/20 text-white border border-white/15 transition flex items-center gap-1 active:scale-95"
                    >
                      <span>@{p.username}</span>
                      <b className="text-indigo-300">({p.score})</b>
                    </button>
                  ))}
                </div>
              )}

              {!showCompareInput ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <UserSearchInput
                    value={username}
                    onChange={setUsername}
                    onSelect={(uname) => { setUsername(uname); handleAnalyze(uname, targetRole, roastMode, persona); }}
                    onSubmit={() => handleAnalyze()}
                    disabled={isAnalyzing}
                  />
                  {/* Feature 2: Role Benchmarking Dropdown */}
                  <select
                    aria-label="Target Role Benchmark"
                    className="sm:w-56 px-4 py-3 rounded-xl text-white bg-slate-900/80 border border-white/20 backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm cursor-pointer"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    disabled={isAnalyzing}
                  >
                    {TARGET_ROLES.map((r) => (
                      <option key={r} value={r} className="bg-slate-900 text-white">
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/15 backdrop-blur-xl animate-fade-in shadow-2xl">
                  <div className="flex-1 w-full">
                    <UserSearchInput
                      value={username}
                      onChange={setUsername}
                      placeholder="Your GitHub username..."
                      onSelect={(uname) => setUsername(uname)}
                      onSubmit={handleCompare}
                      disabled={isComparing}
                    />
                  </div>

                  <div className="flex items-center justify-center -my-1 md:my-0 flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-500 text-white font-black flex items-center justify-center shadow-lg shadow-purple-500/25 text-xs tracking-wider gap-0.5 border border-white/20 select-none">
                      <Zap className="w-4 h-4 fill-white text-white" />
                      <span>VS</span>
                    </div>
                  </div>

                  <div className="flex-1 w-full">
                    <FriendCompareInput
                      value={friendUsername}
                      onChange={setFriendUsername}
                      disabled={isComparing}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleCompare}
                    disabled={isComparing || !username.trim() || !friendUsername.trim()}
                    className="w-full md:w-auto px-6 py-3 rounded-xl font-bold text-xs text-white shadow-lg transition-all disabled:opacity-40 active:scale-95 flex items-center justify-center gap-1.5 flex-shrink-0"
                    style={{ background: 'var(--gradient-primary)' }}
                  >
                    {isComparing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Users2 className="w-4 h-4" />
                    )}
                    <span>{isComparing ? 'Battling...' : 'Run VS Battle'}</span>
                  </button>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Feature 1: Roast My Profile Toggle */}
                  <button
                    type="button"
                    onClick={handleToggleRoastMode}
                    className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-sm ${
                      roastMode
                        ? 'bg-gradient-to-r from-orange-500/30 to-red-500/30 border-orange-500/60 text-orange-200 ring-2 ring-orange-400/40'
                        : 'bg-white/10 hover:bg-white/15 border-white/20 text-indigo-200 ring-1 ring-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                    }`}
                  >
                    {!roastMode && <span className="absolute -top-1 -right-1 text-[8px] font-black text-purple-300 bg-purple-500/30 px-1 rounded-full border border-purple-500/40">✦</span>}
                    <Flame className={`w-4 h-4 ${roastMode ? 'text-orange-400 fill-orange-400' : 'text-gray-400'}`} />
                    <span>{roastMode ? '🔥 Roast ON' : 'Roast Me'}</span>
                  </button>

                  {/* Phase 4, Feature 11: Reviewer Persona Dropdown */}
                  <select
                    aria-label="Reviewer Persona"
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-slate-900/80 border border-white/20 backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
                    value={persona}
                    onChange={(e) => handleChangePersona(e.target.value)}
                    disabled={isAnalyzing}
                  >
                    {REVIEWER_PERSONAS.map((p) => (
                      <option key={p} value={p} className="bg-slate-900 text-white">
                        {p}
                      </option>
                    ))}
                  </select>

                  {/* Feature 1: Toggle Comparison mode */}
                  <button
                    type="button"
                    onClick={() => setShowCompareInput(!showCompareInput)}
                    className="relative text-xs text-indigo-300 hover:text-white flex items-center gap-1 font-medium transition ring-1 ring-indigo-400/20 px-2.5 py-1.5 rounded-lg shadow-[0_0_10px_rgba(99,102,241,0.2)]"
                  >
                    <span className="absolute -top-1 -right-1 text-[8px] font-black text-indigo-300 bg-indigo-500/30 px-1 rounded-full border border-indigo-500/40">✦</span>
                    <Users2 className="w-3.5 h-3.5" />
                    <span>{showCompareInput ? 'Hide Compare' : 'Compare vs Friend'}</span>
                  </button>
                </div>

                <button
                  className="w-full sm:w-auto px-8 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-indigo-500/30 active:scale-95 text-sm"
                  style={{ background: 'var(--gradient-primary)' }}
                  onClick={() => handleAnalyze()}
                  disabled={isAnalyzing || !username.trim()}
                >
                  {isAnalyzing ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw className="animate-spin h-4 w-4" />
                      Analyzing Portfolio...
                    </span>
                  ) : (
                    'Analyze & Coach'
                  )}
                </button>
              </div>

              {/* Part 2: Quick Try Row */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <span className="text-xs text-indigo-200/80 font-medium">Quick Try:</span>
                {FAMOUS_USERS.map((uname) => (
                  <button
                    key={uname}
                    type="button"
                    onClick={() => handleQuickTry(uname)}
                    disabled={isAnalyzing}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/20 text-indigo-100 hover:text-white transition-all active:scale-95 disabled:opacity-50"
                  >
                    @{uname}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom weights toggle */}
            <div className="mt-4">
              <button
                className="text-indigo-300/70 text-xs hover:text-indigo-200 transition-colors"
                onClick={() => setShowWeights((w) => !w)}
              >
                {showWeights ? '▲ Hide custom weights' : '▼ Customize scoring weights'}
              </button>
            </div>

            {showWeights && (
              <div className="mt-4 animate-fade-in max-w-xl mx-auto">
                <WeightsForm weights={weights} setWeights={setWeights} dark={true} />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Comparison Dashboard */}
      {compareData && (
        <div className="max-w-6xl mx-auto px-4 mt-6 animate-fade-in-up">
          <CompareDashboard
            user1={compareData.user1}
            user2={compareData.user2}
            onClose={() => setCompareData(null)}
          />
        </div>
      )}

      {/* Fetch Error Display */}
      {state === 'fetch_failed' && errorMessage && (
        <div className="max-w-4xl mx-auto px-4 mt-6 animate-fade-in-up">
          <div className="flex items-center justify-between p-4 rounded-xl border bg-red-500/10 border-red-500/30 text-red-500">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="font-medium text-sm">{errorMessage}</p>
            </div>
            <button
              onClick={() => handleAnalyze()}
              className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Results Section */}
      {showResults && (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in-up">
          {/* Actions Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <ExportReport
              targetRef={reportRef}
              data={data}
              username={username}
              targetRole={targetRole}
              advice={advice}
            />
            <ShareScore score={data.score} username={username} />
            <button
              onClick={handleCopyPortfolioJSON}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold transition active:scale-95"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Download className="w-4 h-4 text-indigo-400" />
              Copy Portfolio JSON
            </button>
          </div>

          <div ref={reportRef} className="space-y-8">
            {/* Score Card */}
            <ScoreCard
              score={data.score}
              profile={data.profile}
              previousScore={previousScore}
              topRepos={data.topRepos}
              languages={data.mostUsedLanguages}
            />

            {/* Hiring Readiness Gauge (70% GitHub + 30% LinkedIn) */}
            <HiringReadinessGauge
              githubScore={data.score}
              linkedInScore={linkedInConsistencyScore}
            />

            {/* AI Advisor Panel */}
            <div
              className={`rounded-2xl p-6 border shadow-lg transition-all ${
                roastMode ? 'border-orange-500/50 bg-gradient-to-b from-orange-500/5 to-transparent' : ''
              }`}
              style={{
                background: roastMode ? undefined : 'var(--card-bg, rgba(255, 255, 255, 0.03))',
                borderColor: roastMode ? undefined : 'var(--border, rgba(255, 255, 255, 0.1))',
              }}
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-lg font-bold">AI Career Coach Analysis</h3>
                  {targetRole && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium">
                      Role: {targetRole}
                    </span>
                  )}
                  {roastMode && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 font-bold flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-400 fill-orange-400" />
                      Roast Edition
                    </span>
                  )}
                </div>

                {/* Right controls inside AI coach card */}
                <div className="flex items-center gap-2">
                  {advice && (
                    <button
                      type="button"
                      onClick={handleToggleSpeech}
                      aria-label={isSpeaking ? 'Stop read aloud' : 'Read aloud AI advice'}
                      className={`text-xs px-3 py-1 rounded-lg border border-white/10 hover:bg-white/10 flex items-center gap-1.5 transition ${
                        isSpeaking ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' : 'text-gray-300'
                      }`}
                    >
                      {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-indigo-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                      <span>{isSpeaking ? 'Stop Audio' : 'Read Aloud'}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleToggleRoastMode}
                    className="text-xs px-3 py-1 rounded-lg border border-white/10 hover:bg-white/10 text-gray-300 flex items-center gap-1 transition"
                  >
                    <Flame className="w-3 h-3 text-orange-400" />
                    {roastMode ? 'Switch to Constructive' : 'Roast Me'}
                  </button>
                </div>
              </div>

              {state === 'advising' && (
                <div className="py-8 text-center space-y-3">
                  <RefreshCw className="animate-spin h-6 w-6 text-indigo-400 mx-auto" />
                  <p className="text-sm font-medium text-indigo-200">
                    Generating personalized AI coaching recommendations...
                  </p>
                </div>
              )}

              {state === 'llm_failed' && (
                <div className="py-4 space-y-3">
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">AI Analysis Notice</p>
                      <p className="text-xs text-amber-200/90 mt-0.5">{llmError}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleRetryLLM}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow transition hover:opacity-90 flex items-center gap-1.5"
                    style={{ background: 'var(--gradient-primary)' }}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Retry AI Analysis
                  </button>
                </div>
              )}

              {state === 'advised' && advice && (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <p className="text-sm leading-relaxed font-medium text-indigo-100">
                      {advice.summary}
                    </p>
                  </div>

                  {/* Phase 2, Feature 6: Time-to-Hire Estimator */}
                  {advice.timeToHireWeeks !== undefined && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs">
                      <Clock className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <span className="text-gray-300">
                        Estimated Time-to-Hire for <b className="text-purple-300">{targetRole}</b>:
                      </span>
                      <span className="font-bold text-white bg-purple-500/30 px-2 py-0.5 rounded-md">
                        ~{advice.timeToHireWeeks} Weeks
                      </span>
                    </div>
                  )}

                  {/* Phase 2, Feature 5: ATS Missing Keywords Scanner */}
                  {advice.atsMissingKeywords && advice.atsMissingKeywords.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                        <Target className="w-4 h-4 text-indigo-400" />
                        <span>ATS Missing Keywords Scanner ({targetRole})</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {advice.atsMissingKeywords.map((kw, i) => (
                          <span
                            key={i}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-rose-300 font-mono"
                          >
                            + {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prioritized Actions */}
                  <div>
                    <h4 className="text-sm font-semibold text-indigo-300 uppercase tracking-wider mb-3">
                      Top 3 Prioritized Actions
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {advice.actions.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col justify-between"
                        >
                          <div>
                            <span className="inline-block w-6 h-6 rounded-full bg-indigo-500 text-white text-xs font-bold text-center leading-6 mb-2">
                              {idx + 1}
                            </span>
                            <h5 className="font-semibold text-sm mb-1">{item.action}</h5>
                            <p className="text-xs text-gray-400 leading-relaxed">{item.rationale}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shareable Blurb */}
                  {advice.shareText && (
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
                      <p className="text-xs text-gray-400 italic flex-1">
                        &ldquo;{advice.shareText}&rdquo;
                      </p>
                      <button
                        onClick={handleCopyShareText}
                        className="px-3 py-1.5 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 text-xs font-medium flex items-center gap-1.5 transition"
                      >
                        {copiedShareText ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Summary</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Score Breakdown */}
            <Breakdown breakdown={data.scoreBreakdown} />

            {/* Phase 2, Feature 4: Job Description Matcher */}
            <JDMatcher report={data} />

            {/* Simulated LinkedIn Sync & Consistency Audit */}
            <LinkedInSync
              report={data}
              onUpdateHiringReadiness={(score) => setLinkedInConsistencyScore(score)}
            />

            {/* Commit Activity */}
            <CommitActivityGraph commitActivity={data.commitActivity} />

            {/* Insights Section with Phase 3 Deep Links */}
            <Insights
              strengths={data.strengths}
              redFlags={data.redFlags}
              suggestions={data.suggestions}
              username={username}
              topRepos={data.topRepos}
            />

            {/* Repo Insights for top repos */}
            {data.topRepos && data.topRepos.length > 0 && data.repoInsights && (
              <div className="space-y-4">
                {data.topRepos.map((repo) => (
                  <RepoInsights
                    key={repo.name}
                    repo={repo}
                    insights={data.repoInsights[repo.name]}
                  />
                ))}
              </div>
            )}

            {/* Two column layout */}
            <div className="grid md:grid-cols-2 gap-6">
              <TopRepos repos={data.topRepos} username={username} />
              <LanguageChart languages={data.mostUsedLanguages} />
            </div>

            {/* Feature 12: Portfolio Web Connectivity Graph */}
            <PortfolioWebGraph repos={data.topRepos} languages={data.mostUsedLanguages} />

            {/* Resume Generator */}
            <ResumeGenerator report={data} advice={advice} />

            {/* HackerRank Style Black-and-White Resume */}
            <HackerRankResume report={data} advice={advice} />

            {/* AI Networking Matcher */}
            <NetworkMatcher languages={data.mostUsedLanguages} targetRole={targetRole} />
          </div>

          {/* Leaderboard & Network (outside reportRef for performance) */}
          <Leaderboard
            currentUsername={username}
            currentScore={data.score}
            currentRepos={data.topRepos}
          />

          {/* Social Badging */}
          <div className="max-w-md mx-auto">
            <LinkedInBadge username={username} score={data.score} />
          </div>
        </div>
      )}

      {/* Empty State / Tips */}
      {!data && state !== 'fetching' && (
        <div className="max-w-6xl mx-auto px-4 py-12">
          <Tips />
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-white/10 text-center">
        <p className="text-xs text-gray-400">
          GitFolioScore on Anna AI OS — Evaluates GitHub portfolios like real hiring teams do.
        </p>
      </footer>
    </div>
  );
}

export default App;
