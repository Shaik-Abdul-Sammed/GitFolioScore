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
import { Search, Moon, Sun, Sparkles, RefreshCw, AlertCircle, Copy, Check, Flame } from 'lucide-react';
import { fetchProfile, fetchRepos } from './lib/github';
import { calculateReport } from './lib/score';
import { generateAdvice } from './lib/llm';
import { cacheGet, cacheSet } from './lib/cache';

const FAMOUS_USERS = ['torvalds', 'gaearon', 'sindresorhus', 'yyx990803'];

const TARGET_ROLES = [
  'Fullstack Engineer',
  'Frontend Engineer',
  'Backend Engineer',
  'Machine Learning / AI Engineer',
  'DevOps & Cloud Engineer',
  'Mobile Engineer',
];

function App() {
  const [username, setUsername] = useState('');
  const [targetRole, setTargetRole] = useState('Fullstack Engineer');
  const [roastMode, setRoastMode] = useState(false);
  const [previousScore, setPreviousScore] = useState(null);
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

  const runLLMAdvice = async (report, role, isRoast = roastMode) => {
    setState('advising');
    setLlmError('');
    try {
      const result = await generateAdvice(report, role, { roastMode: isRoast });
      setAdvice(result);
      setState('advised');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('LLM generation error:', err);
      setLlmError(err.userMessage || 'AI analysis could not be completed.');
      setState('llm_failed');
    }
  };

  const handleAnalyze = async (overrideUsername, overrideRole, overrideRoast) => {
    const activeUsername = (overrideUsername !== undefined ? overrideUsername : username).trim();
    if (!activeUsername) return;
    if (overrideUsername !== undefined) setUsername(activeUsername);

    const activeRole = overrideRole !== undefined ? overrideRole : targetRole;
    const activeRoast = overrideRoast !== undefined ? overrideRoast : roastMode;

    setErrorMessage('');
    setLlmError('');
    setAdvice(null);
    setData(null);
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
        await runLLMAdvice(cached.report, activeRole, activeRoast);
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

      // 4. Save to client APS cache (best effort)
      await cacheSet(activeUsername, { profile, repos, report });

      // 5. Generate AI advice
      await runLLMAdvice(report, activeRole, activeRoast);
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

  // Part 2: Quick Try Click Handler
  const handleQuickTry = (uname) => {
    setUsername(uname);
    handleAnalyze(uname, targetRole, roastMode);
  };

  const handleToggleRoastMode = () => {
    const nextRoast = !roastMode;
    setRoastMode(nextRoast);
    if (data) {
      runLLMAdvice(data, targetRole, nextRoast);
    }
  };

  const handleRetryLLM = () => {
    if (data) {
      runLLMAdvice(data, targetRole, roastMode);
    }
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

            <div className="flex items-center gap-3">
              <select
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/20 bg-white/10 text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
              >
                <option value="en" className="text-gray-900">EN</option>
                <option value="es" className="text-gray-900">ES</option>
              </select>

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
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-300" />
                  <input
                    className="w-full pl-12 pr-4 py-3 rounded-xl text-white placeholder-indigo-300/60 bg-white/10 border border-white/20 backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                    type="text"
                    placeholder="GitHub username (e.g. torvalds)..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                    disabled={isAnalyzing}
                  />
                </div>
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

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Feature 1: Roast My Profile Toggle */}
                <button
                  type="button"
                  onClick={handleToggleRoastMode}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm ${
                    roastMode
                      ? 'bg-gradient-to-r from-orange-500/30 to-red-500/30 border-orange-500/60 text-orange-200 ring-2 ring-orange-400/40'
                      : 'bg-white/10 hover:bg-white/15 border-white/20 text-indigo-200'
                  }`}
                >
                  <Flame className={`w-4 h-4 ${roastMode ? 'text-orange-400 fill-orange-400' : 'text-gray-400'}`} />
                  <span>{roastMode ? '🔥 Roast Mode: ACTIVE' : 'Roast My Profile'}</span>
                </button>

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
          </div>

          <div ref={reportRef} className="space-y-8">
            {/* Score Card */}
            <ScoreCard score={data.score} profile={data.profile} previousScore={previousScore} />

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

                {/* Quick Toggle Roast Mode inside card */}
                <button
                  type="button"
                  onClick={handleToggleRoastMode}
                  className="text-xs px-3 py-1 rounded-lg border border-white/10 hover:bg-white/10 text-gray-300 flex items-center gap-1 transition"
                >
                  <Flame className="w-3 h-3 text-orange-400" />
                  {roastMode ? 'Switch to Constructive' : 'Roast Me'}
                </button>
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

            {/* Commit Activity */}
            <CommitActivityGraph commitActivity={data.commitActivity} />

            {/* Insights Section */}
            <Insights
              strengths={data.strengths}
              redFlags={data.redFlags}
              suggestions={data.suggestions}
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
          </div>

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
