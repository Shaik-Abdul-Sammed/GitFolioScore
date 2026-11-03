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
import FeatureHub from './components/FeatureHub/FeatureHub';
import UserSearchInput from './components/UserSearchInput';
import PortfolioWebGraph from './components/PortfolioWebGraph';
import ThemeCustomizer from './components/ThemeCustomizer';
import FriendCompareInput from './components/FriendCompareInput';
import HackerRankResume from './components/HackerRankResume';
import LinkedInSync from './components/LinkedInSync';
import HiringReadinessGauge from './components/HiringReadinessGauge';
import QuickChipsBar from './components/QuickChipsBar';
import SkeletonLoader from './components/SkeletonLoader';
import ScrollToTopFAB from './components/ScrollToTopFAB';
import ToastContainer from './components/Toast';
import ScoreSimulator from './components/ScoreSimulator';
import CommitRoaster from './components/CommitRoaster';
import TerminalEasterEgg from './components/TerminalEasterEgg';
import TechDebtGraveyard from './components/TechDebtGraveyard';
import FeedbackRating from './components/FeedbackRating';
import RecruiterSwipeMode from './components/RecruiterSwipeMode';
import ReadmeWidgetGenerator from './components/ReadmeWidgetGenerator';
import CompanyOSINT from './components/CompanyOSINT';
import FakePRGenerator from './components/FakePRGenerator';
import SecurityScanModal from './components/SecurityScanModal';
import GamifiedXP from './components/GamifiedXP';
import VoiceOfGodAudio from './components/VoiceOfGodAudio';
import LanguageTrendsPredictor from './components/LanguageTrendsPredictor';
import TimeMachineView from './components/TimeMachineView';
import OpenToWorkBanner from './components/OpenToWorkBanner';
import Trophies from './components/Trophies';
import { playLevelUpSound, playTypewriterClick } from './lib/audio';
import OnboardingModal from './components/OnboardingModal';
import QuotaModal from './components/QuotaModal';
import { loadXP, addXPPoints } from './lib/xpStorage';
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
  Sliders,
  User,
  Compass,
  AlertTriangle,
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

function TypewriterText({ text }) {
  const [displayedText, setDisplayedText] = useState(process.env.NODE_ENV === 'test' ? text : '');

  useEffect(() => {
    if (process.env.NODE_ENV === 'test') {
      setDisplayedText(text);
      return;
    }
    setDisplayedText('');
    let idx = 0;
    const timer = setInterval(() => {
      idx += 3;
      if (idx % 6 === 0) {
        playTypewriterClick();
      }
      if (idx >= text.length) {
        setDisplayedText(text);
        clearInterval(timer);
      } else {
        setDisplayedText(text.slice(0, idx));
      }
    }, 14);
    return () => clearInterval(timer);
  }, [text]);

  return (
    <span>
      {displayedText}
      <span
        className="inline-block w-2 h-3.5 ml-1 bg-indigo-400 align-middle animate-blink-cursor select-none"
        aria-hidden="true"
      />
    </span>
  );
}

function SakuraBackground() {
  const petals = [
    { id: 0, left: '4%', driftX: '55px', duration: '11s', delay: '0s', scale: '0.85' },
    { id: 1, left: '10%', driftX: '-60px', duration: '13s', delay: '2s', scale: '0.75' },
    { id: 2, left: '16%', driftX: '70px', duration: '10s', delay: '4.5s', scale: '0.9' },
    { id: 3, left: '22%', driftX: '-50px', duration: '12s', delay: '1s', scale: '0.8' },
    { id: 4, left: '28%', driftX: '65px', duration: '14s', delay: '3.2s', scale: '0.7' },
    { id: 5, left: '34%', driftX: '-75px', duration: '11s', delay: '5.5s', scale: '0.95' },
    { id: 6, left: '40%', driftX: '50px', duration: '12.5s', delay: '0.5s', scale: '0.85' },
    { id: 7, left: '46%', driftX: '-65px', duration: '10.5s', delay: '6s', scale: '0.75' },
    { id: 8, left: '52%', driftX: '80px', duration: '13.5s', delay: '2.5s', scale: '0.9' },
    { id: 9, left: '58%', driftX: '-55px', duration: '11.5s', delay: '4s', scale: '0.8' },
    { id: 10, left: '64%', driftX: '60px', duration: '12s', delay: '1.5s', scale: '0.7' },
    { id: 11, left: '70%', driftX: '-70px', duration: '14s', delay: '5s', scale: '0.95' },
    { id: 12, left: '76%', driftX: '55px', duration: '10.5s', delay: '3s', scale: '0.85' },
    { id: 13, left: '82%', driftX: '-60px', duration: '12.5s', delay: '0.8s', scale: '0.75' },
    { id: 14, left: '88%', driftX: '75px', duration: '11s', delay: '6.2s', scale: '0.9' },
    { id: 15, left: '94%', driftX: '-50px', duration: '13s', delay: '2.2s', scale: '0.8' },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {petals.map((p) => (
        <div
          key={p.id}
          className="sakura-petal"
          style={{
            left: p.left,
            '--drift-x': p.driftX,
            '--fall-duration': p.duration,
            '--fall-delay': p.delay,
            transform: `scale(${p.scale})`,
          }}
        />
      ))}
    </div>
  );
}

function LevelUpBurst({ level }) {
  const particles = Array.from({ length: 18 }).map((_, i) => {
    const angle = (i / 18) * 2 * Math.PI;
    const dist = 90 + (i % 3) * 45;
    const tx = `${Math.cos(angle) * dist}px`;
    const ty = `${Math.sin(angle) * dist}px`;
    const colors = ['#f59e0b', '#a855f7', '#6366f1', '#10b981', '#ec4899', '#38bdf8'];
    return {
      tx,
      ty,
      color: colors[i % colors.length],
      size: 7 + (i % 4) * 2,
      delay: (i * 0.02).toFixed(2),
    };
  });

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
      {/* 12. Anime Level-Up 3-Frame Inverted Flash */}
      <div className="fixed inset-0 anime-power-flash pointer-events-none z-10" aria-hidden="true" />
      <div className="relative z-20">
        {particles.map((p, idx) => (
          <div
            key={idx}
            className="absolute rounded-full animate-particle-burst"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              boxShadow: `0 0 12px ${p.color}`,
              '--tx': p.tx,
              '--ty': p.ty,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
        <div className="animate-level-up-pop px-8 py-5 rounded-2xl bg-slate-900/95 border-2 border-amber-400/80 shadow-[0_0_50px_rgba(245,158,11,0.6)] text-center">
          <div className="text-3xl mb-1">⚔️ 🌟 ⚔️</div>
          <h2 className="text-xl font-black font-gaming text-amber-300 tracking-wider">
            LEVEL UP! LEVEL {level}
          </h2>
          <p className="text-xs font-pixel text-yellow-100 mt-1">
            +STATS BOOST UNLOCKED
          </p>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [username, setUsername] = useState('');
  const [friendUsername, setFriendUsername] = useState('');
  const [compareData, setCompareData] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [showCompareInput, setShowCompareInput] = useState(false);
  const [levelUpBurst, setLevelUpBurst] = useState(null);

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
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const currentRequestId = useRef(0);
  const reportRef = useRef();
  const mainInputRef = useRef();
  const compareRef = useRef();
  const [toasts, setToasts] = useState([]);
  const [xp, setXp] = useState(0);
  const { i18n } = useTranslation();

  useEffect(() => {
    let isMounted = true;
    if (process.env.NODE_ENV !== 'test') {
      // Force one-time reset of any cached/stale legacy XP key so everyone starts fresh at Level 1 (0 XP)
      const XP_RESET_KEY = 'gitfolioscore_xp_reset_to_zero_v2';
      try {
        if (typeof localStorage !== 'undefined' && !localStorage.getItem(XP_RESET_KEY)) {
          localStorage.setItem(XP_RESET_KEY, 'true');
          localStorage.removeItem('gitfolioscore_xp');
          localStorage.setItem('gitfolioscore_xp', '0');
          if (window?.anna?.storage?.set) {
            window.anna.storage.set('gitfolioscore_xp', 0).catch(() => {});
          }
        }
      } catch {
        // ignore legacy storage reset errors
      }

      loadXP().then((val) => {
        if (isMounted) setXp(val || 0);
      });

      const checkOnboarded = async () => {
        try {
          let onboarded = false;
          if (window.anna?.storage?.get) {
            const res = await window.anna.storage.get({ key: 'hasOnboarded' });
            if (res?.value === true) onboarded = true;
          }
          if (!onboarded && typeof localStorage !== 'undefined') {
            if (localStorage.getItem('hasOnboarded') === 'true') onboarded = true;
          }
          if (isMounted && !onboarded) {
            setShowOnboarding(true);
          }
        } catch {
          // best effort
        }
      };
      checkOnboarded();
    }

    const handleQuotaExceeded = () => {
      if (isMounted) setShowQuotaModal(true);
    };
    window.addEventListener('anna_quota_exceeded', handleQuotaExceeded);
    return () => {
      isMounted = false;
      window.removeEventListener('anna_quota_exceeded', handleQuotaExceeded);
    };
  }, []);

  const handleRewardXP = async (amount, reason) => {
    try {
      const res = await addXPPoints(amount);
      setXp(res.newXP);
      if (res.leveledUp) {
        setLevelUpBurst(res.newLevel);
        playLevelUpSound();
        setTimeout(() => setLevelUpBurst(null), 3200);
        showToast(`🎉 Level Up! You reached Level ${res.newLevel}! (+${amount} XP: ${reason})`, 'success');
      } else {
        showToast(`+${amount} XP: ${reason}`, 'info');
      }
    } catch {
      // Ignore
    }
  };

  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Part 2, Feature 5: Keyboard Shortcuts (/ focuses search, Esc closes compare/modals)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        mainInputRef.current?.focus();
        showToast('Search input focused (Shortcut: /)', 'info');
      }
      if (e.key === 'Escape') {
        if (showCompareInput) setShowCompareInput(false);
        if (compareData) setCompareData(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCompareInput, compareData]);

  // Part 2, Feature 8: Smart Scroll to Results when scored
  useEffect(() => {
    if (state === 'scored' && reportRef.current) {
      reportRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [state]);

  const handleClearSearch = () => {
    setUsername('');
    setData(null);
    setAdvice(null);
    setCompareData(null);
    setState('idle');
    setErrorMessage('');
    showToast('Search reset', 'info');
  };

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
    let isMounted = true;
    if (process.env.NODE_ENV !== 'test') {
      const loadRecent = async () => {
        try {
          if (window.anna?.storage?.get) {
            const res = await window.anna.storage.get({ key: 'recent_profiles' });
            if (isMounted && Array.isArray(res?.value)) setRecentProfiles(res.value);
          } else if (typeof localStorage !== 'undefined') {
            const stored = localStorage.getItem('recent_profiles');
            if (isMounted && stored) setRecentProfiles(JSON.parse(stored));
          }
        } catch {
          // Storage is best effort
        }
      };
      loadRecent();
    }
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCompleteOnboarding = async () => {
    setShowOnboarding(false);
    try {
      if (window.anna?.storage?.set) {
        await window.anna.storage.set({ key: 'hasOnboarded', value: true });
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('hasOnboarded', 'true');
      }
    } catch {
      // best effort
    }
  };

  const runLLMAdvice = async (report, role, isRoast = roastMode, activePersona = persona, reqId = currentRequestId.current) => {
    if (currentRequestId.current !== reqId) return;
    setState('advising');
    setLlmError('');
    try {
      const result = await generateAdvice(report, role, { roastMode: isRoast, persona: activePersona });
      if (currentRequestId.current !== reqId) return;
      setAdvice(result);
      setState('advised');
    } catch (err) {
      if (currentRequestId.current !== reqId) return;
      // eslint-disable-next-line no-console
      console.error('LLM generation error:', err);
      if (err.code === 'APP_QUOTA_EXCEEDED' || /quota/i.test(err.message || '')) {
        setShowQuotaModal(true);
      }
      setLlmError(err.userMessage || 'AI analysis could not be completed.');
      setState('llm_failed');
    }
  };

  const handleAnalyze = async (overrideUsername, overrideRole, overrideRoast, overridePersona) => {
    const activeUsername = (overrideUsername !== undefined ? overrideUsername : username).trim();
    if (!activeUsername) return;
    if (overrideUsername !== undefined) setUsername(activeUsername);

    const reqId = ++currentRequestId.current;
    const activeRole = overrideRole !== undefined ? overrideRole : targetRole;
    const activeRoast = overrideRoast !== undefined ? overrideRoast : roastMode;
    const activePersona = overridePersona !== undefined ? overridePersona : persona;

    setErrorMessage('');
    setLlmError('');
    setAdvice(null);
    setData(null);
    setCompareData(null);
    setIsComparing(false);
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
      if (currentRequestId.current !== reqId) return;
      setPreviousScore(prevScore);

      // 1. Check persistent cache
      const cached = await cacheGet(activeUsername);
      if (currentRequestId.current !== reqId) return;
      if (cached && cached.report) {
        setData(cached.report);
        setState('scored');
        playLevelUpSound();
        await runLLMAdvice(cached.report, activeRole, activeRoast, activePersona, reqId);
        return;
      }

      // 2. Parallel GitHub fetch
      const [profile, repos] = await Promise.all([
        fetchProfile(activeUsername),
        fetchRepos(activeUsername),
      ]);
      if (currentRequestId.current !== reqId) return;

      // 3. Pure scoring computation
      const report = calculateReport({ profile, repos, weights });
      setData(report);
      setState('scored');
      playLevelUpSound();
      handleRewardXP(10, 'Analyzed GitHub profile');

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

      if (currentRequestId.current !== reqId) return;

      // 5. Generate AI advice
      await runLLMAdvice(report, activeRole, activeRoast, activePersona, reqId);
    } catch (err) {
      if (currentRequestId.current !== reqId) return;
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

  // Phase 1, Feature 1 & 11: Compare with a Friend (Battle Mode)
  const handleCompare = async () => {
    const u1 = (username || '').trim().replace(/^@+/, '');
    const u2 = (friendUsername || '').trim().replace(/^@+/, '');
    if (!u1 || !u2) {
      showToast('Please enter both GitHub usernames to compare', 'error');
      return;
    }

    const reqId = ++currentRequestId.current;
    setIsComparing(true);
    setErrorMessage('');
    try {
      const [res1, res2] = await Promise.allSettled([
        Promise.all([fetchProfile(u1), fetchRepos(u1)]),
        Promise.all([fetchProfile(u2), fetchRepos(u2)]),
      ]);

      if (currentRequestId.current !== reqId) return;

      const formatError = (uname, reason) => {
        if (reason?.code === 'NOT_FOUND') {
          return `User "${uname}" was not found. Please check the spelling and try again.`;
        }
        if (reason?.code === 'RATE_LIMIT') {
          return `GitHub API rate limit exceeded while fetching "${uname}". Please wait a few moments.`;
        }
        return `Failed to fetch profile for "${uname}": ${reason?.message || 'Unknown error'}`;
      };

      if (res1.status === 'rejected' && res2.status === 'rejected') {
        const msg = `Users "${u1}" and "${u2}" were not found. Please check the spelling and try again.`;
        setErrorMessage(msg);
        showToast(msg, 'error');
        return;
      }

      if (res1.status === 'rejected') {
        const msg = formatError(u1, res1.reason);
        setErrorMessage(msg);
        showToast(msg, 'error');
        return;
      }

      if (res2.status === 'rejected') {
        const msg = formatError(u2, res2.reason);
        setErrorMessage(msg);
        showToast(msg, 'error');
        return;
      }

      const u1Data = res1.value;
      const u2Data = res2.value;

      const rep1 = calculateReport({ profile: u1Data[0], repos: u1Data[1], weights });
      const rep2 = calculateReport({ profile: u2Data[0], repos: u2Data[1], weights });

      setCompareData({
        user1: { username: u1, report: rep1 },
        user2: { username: u2, report: rep2 },
      });
      handleRewardXP(15, 'Run 1v1 VS Battle');
      showToast(`VS Battle: @${u1} vs @${u2} ready!`);
      setTimeout(() => {
        compareRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Compare failed:', err);
      const msg = err.message || 'Could not fetch profiles for comparison.';
      setErrorMessage(msg);
      showToast(msg, 'error');
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
    showToast('Portfolio JSON downloaded & ready!');
  };

  const handleCopyShareText = () => {
    if (!advice?.shareText) return;
    navigator.clipboard.writeText(advice.shareText);
    setCopiedShareText(true);
    showToast('Share text copied to clipboard!');
    setTimeout(() => setCopiedShareText(false), 2000);
  };

  const isAnalyzing = state === 'fetching';
  const showResults = data && (state === 'scored' || state === 'advising' || state === 'advised' || state === 'llm_failed');

  return (
    <div
      className="min-h-screen transition-colors duration-300 relative overflow-hidden"
      style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      {/* 1. Anime Sakura Petal Falling Drift Background */}
      <SakuraBackground />

      {/* 17. Level Up Burst Explosion */}
      {levelUpBurst && <LevelUpBurst level={levelUpBurst} />}

      {/* Global Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* Sticky Navigation Bar */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/80 border-b border-white/10 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg border border-white/20"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" fillOpacity="0.3" />
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-1.5">
              GitFolio<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">Score</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">AI OS</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <GamifiedXP xp={xp} onRewardXP={handleRewardXP} />

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
      </nav>

      {/* Hero Header */}
      <header className="relative py-12 md:py-16" style={{ background: 'var(--gradient-hero)' }}>
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-violet-500 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4">
          {/* Hero content */}
          <div className="text-center py-4 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
              Your GitHub Portfolio,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
                Scored & AI-Advised
              </span>
            </h2>
            <p className="text-indigo-200/80 text-base md:text-lg max-w-2xl mx-auto mb-6">
              Objective evaluation with scoring breakdown, strengths, red flags, and personalized AI career coaching.
            </p>

            {/* Segmented Mode Selector: Single Audit vs VS Battle */}
            <div className="inline-flex items-center p-1 rounded-2xl bg-slate-900/90 border border-white/15 backdrop-blur-xl shadow-xl mb-6 select-none">
              <button
                type="button"
                onClick={() => setShowCompareInput(false)}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  !showCompareInput
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Single Portfolio Audit</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCompareInput(true)}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  showCompareInput
                    ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white shadow-lg shadow-rose-500/25'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>1v1 VS Battle Mode</span>
              </button>
            </div>

            {/* Inputs Container */}
            <div className="max-w-4xl mx-auto space-y-4 relative z-40">
              <div key={showCompareInput ? 'compare-mode' : 'single-mode'} className="anime-slash-transition overflow-visible relative z-40">
                {!showCompareInput ? (
                  <div className="relative flex flex-col sm:flex-row gap-3 z-40">
                    <UserSearchInput
                      inputRef={mainInputRef}
                      value={username}
                      onChange={setUsername}
                      onSelect={(uname) => {
                        setUsername(uname);
                        handleAnalyze(uname, targetRole, roastMode, persona);
                      }}
                      onSubmit={() => handleAnalyze()}
                      onClear={handleClearSearch}
                      recentProfiles={recentProfiles}
                      disabled={isAnalyzing}
                      onToast={showToast}
                    />
                    {/* Feature 2: Role Benchmarking Dropdown */}
                    <select
                      aria-label="Target Role Benchmark"
                      className="sm:w-56 px-4 py-3 rounded-xl text-white bg-slate-900/80 border border-white/20 backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm cursor-pointer shadow-lg"
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
                  <div className="relative flex flex-col md:flex-row items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/15 backdrop-blur-xl animate-fade-in shadow-2xl z-40">
                    <div className="relative flex-1 w-full">
                      <UserSearchInput
                        inputRef={mainInputRef}
                        value={username}
                        onChange={setUsername}
                        placeholder="Your GitHub username..."
                        onSelect={(uname) => setUsername(uname)}
                        onSubmit={handleCompare}
                        onClear={handleClearSearch}
                        recentProfiles={recentProfiles}
                        disabled={isComparing}
                        onToast={showToast}
                      />
                    </div>

                    <div className="flex items-center justify-center -my-1 md:my-0 flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-500 text-white font-black flex items-center justify-center shadow-lg shadow-purple-500/25 text-xs tracking-wider gap-0.5 border border-white/20 select-none">
                        <Zap className="w-4 h-4 fill-white text-white" />
                        <span>VS</span>
                      </div>
                    </div>

                    <div className="relative flex-1 w-full">
                      <FriendCompareInput
                        value={friendUsername}
                        onChange={setFriendUsername}
                        onSelect={(uname) => setFriendUsername(uname)}
                        onSubmit={handleCompare}
                        onClear={() => setFriendUsername('')}
                        disabled={isComparing}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleCompare}
                      disabled={isComparing || !username.trim() || !friendUsername.trim()}
                      className="btn-neon-glow w-full md:w-auto px-6 py-3 rounded-xl font-bold text-xs text-white shadow-lg transition-all disabled:opacity-40 active:scale-95 flex items-center justify-center gap-1.5 flex-shrink-0"
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
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 relative z-10">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Feature 1: Roast My Profile Toggle with Anime Eye Gleam */}
                  <button
                    type="button"
                    onClick={handleToggleRoastMode}
                    className={`btn-neon-glow relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-sm ${
                      roastMode
                        ? 'bg-gradient-to-r from-orange-500/30 to-red-500/30 border-orange-500/60 text-orange-200 ring-2 ring-orange-400/40'
                        : 'bg-white/10 hover:bg-white/15 border-white/20 text-indigo-200 ring-1 ring-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                    }`}
                  >
                    <span className="anime-eye-gleam absolute -top-1 -right-1 text-yellow-300 font-black pointer-events-none select-none text-[11px]">✦</span>
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

                  {/* Custom Weights Modal Trigger */}
                  <button
                    type="button"
                    onClick={() => setShowWeights(true)}
                    className="relative text-xs text-indigo-300 hover:text-white flex items-center gap-1.5 font-medium transition ring-1 ring-indigo-400/20 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 shadow-[0_0_10px_rgba(99,102,241,0.2)]"
                  >
                    <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Custom Weights</span>
                  </button>
                </div>

                {!showCompareInput && (
                  <button
                    className="btn-neon-glow w-full sm:w-auto px-8 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-indigo-500/30 active:scale-95 text-sm"
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
                )}
              </div>

              {/* Part 1, Item 1: Sleek Horizontal Scrolling Chips Bar */}
              <div className="relative z-0">
                <QuickChipsBar
                  recentProfiles={recentProfiles}
                  famousUsers={FAMOUS_USERS}
                  onSelect={handleQuickTry}
                  disabled={isAnalyzing}
                />
              </div>
            </div>

            {/* Part 1, Item 1: Custom Weights Modal */}
            {showWeights && (
              <WeightsForm
                weights={weights}
                setWeights={setWeights}
                dark={true}
                isModal={true}
                onClose={() => setShowWeights(false)}
              />
            )}
          </div>
        </div>
      </header>

      {/* Skeletons while fetching */}
      {state === 'fetching' && <SkeletonLoader />}

      {/* Comparison Dashboard */}
      {compareData && (
        <div ref={compareRef} className="max-w-6xl mx-auto px-4 mt-6 animate-fade-in-up">
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
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 space-y-12 md:space-y-16 animate-fade-in-up">
          {/* Actions Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <ExportReport
              targetRef={reportRef}
              data={data}
              username={username}
              targetRole={targetRole}
              advice={advice}
              onToast={showToast}
              onExport={() => handleRewardXP(20, 'Export PDF Resume')}
            />
            <ShareScore score={data.score} username={username} onToast={showToast} />
            <VoiceOfGodAudio username={username} score={data.score} advice={advice} />
            <button
              onClick={handleCopyPortfolioJSON}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold transition active:scale-95"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Download className="w-4 h-4 text-indigo-400" />
              Copy Portfolio JSON
            </button>
          </div>

          <div ref={reportRef} className="space-y-12 md:space-y-16">
            {/* Score Card */}
            <ScoreCard
              score={data.score}
              profile={data.profile}
              previousScore={previousScore}
              topRepos={data.topRepos}
              languages={data.mostUsedLanguages}
            />

            {/* RPG Achievements & Trophy Cabinet */}
            <Trophies data={data} />

            {/* Feature 1: "What-If" Score Simulator */}
            <ScoreSimulator data={data} weights={weights} />

            {/* Hiring Readiness Gauge (70% GitHub + 30% LinkedIn) */}
            <HiringReadinessGauge
              githubScore={data.score}
              linkedInScore={linkedInConsistencyScore}
            />

            {/* AI Advisor Panel */}
            <div
              className={`rounded-2xl p-6 border shadow-lg transition-all ${
                state === 'advising' ? 'animate-ai-glow' : ''
              } ${
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
                <div className="py-10 text-center space-y-4 relative overflow-hidden rounded-2xl">
                  {/* 2. Anime Radial Speed Lines */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-85" aria-hidden="true">
                    <div className="w-80 h-80 anime-speed-lines" />
                  </div>
                  <div className="relative z-10 space-y-3">
                    <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-indigo-950/80 border-2 border-indigo-400/60 shadow-2xl shadow-indigo-500/40 backdrop-blur-md">
                      <span className="inline-block animate-spin text-3xl select-none" role="img" aria-label="Processing">
                        ⚔️
                      </span>
                    </div>
                    <p className="text-sm font-bold text-indigo-100 font-gaming tracking-wide">
                      Generating personalized AI coaching recommendations...
                    </p>
                    <div className="flex items-center justify-center gap-2 font-pixel text-xs text-indigo-300">
                      <span className="text-amber-400">⚡ FOCUS MODE</span>
                      <span>· Synthesizing Multi-Agent Consensus</span>
                    </div>
                  </div>
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
                  {/* 7. Manga Speech Bubble Summary */}
                  <div className="p-4 rounded-xl manga-speech-bubble bg-indigo-950/60 shadow-xl mt-1">
                    <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-indigo-300 font-gaming uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>3-Expert Consensus (FAANG HM, Staff Eng, Recruiter)</span>
                    </div>
                    <p className="text-sm leading-relaxed font-medium text-indigo-100">
                      {process.env.NODE_ENV === 'test' ? advice.summary : <TypewriterText text={advice.summary} />}
                    </p>
                  </div>

                  {/* Predictive Career Trajectory */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-indigo-500/30 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider font-gaming">
                      <Compass className="w-4 h-4 text-cyan-400" />
                      <span>Predictive Career Trajectory (AI Model)</span>
                    </div>
                    <p className="text-xs text-gray-200 leading-relaxed font-medium">
                      {advice.careerTrajectory ||
                        `Based on your ${data?.mostUsedLanguages?.slice(0, 2).map((l) => (Array.isArray(l) ? l[0] : l.lang || l.name || l)).join(' and ') || 'stack'} usage, you are on track for a ${targetRole || 'Fullstack Software Engineer'} role. To reach Senior Staff level, prioritize high-throughput distributed system design, CI/CD telemetry, and architecture documentation.`}
                    </p>
                  </div>

                  {/* Code Complexity & Technical Debt Deductions */}
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider font-gaming">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <span>Code Complexity &amp; Technical Debt Deduction</span>
                      </div>
                      <span className="text-[11px] font-bold text-rose-300 bg-rose-500/20 border border-rose-500/30 px-2.5 py-0.5 rounded-full font-gaming">
                        -{advice.codeComplexity?.deduction ?? Math.max(3, (data?.topRepos?.filter((r) => !r.hasReadme).length || 1) * 3)} PTS DEDUCTED
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {advice.codeComplexity?.explanation ||
                        'Staff Engineer analysis: Missing unit test suites or repository descriptions detected across public repositories, indicating technical debt drag in hiring pipeline screenings.'}
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
                        className={`px-3 py-1.5 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 text-xs font-medium flex items-center gap-1.5 transition ${
                          copiedShareText ? 'animate-copy-pop text-emerald-400 border-emerald-400/40' : ''
                        }`}
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

            {/* Feature 2: AI Commit Message Roaster */}
            <CommitRoaster username={username} repos={data.repos || data.topRepos} />

            {/* Feature 8: AI Target Company OSINT */}
            <CompanyOSINT username={username} data={data} repos={data.repos || data.topRepos} />

            {/* Score Breakdown */}
            <Breakdown breakdown={data.scoreBreakdown} />

            {/* Phase 2, Feature 4: Job Description Matcher */}
            <JDMatcher report={data} />

            {/* Simulated LinkedIn Sync & Consistency Audit */}
            <LinkedInSync
              report={data}
              onUpdateHiringReadiness={(score) => setLinkedInConsistencyScore(score)}
            />

            {/* Feature 14: The "Time Machine" View */}
            <TimeMachineView
              repos={data.repos || data.topRepos}
              profile={data.profile}
              weights={weights}
              currentScore={data.score}
            />

            {/* Commit Activity */}
            <CommitActivityGraph commitActivity={data.commitActivity} showEmptyState={true} />

            {/* Insights Section with Phase 3 Deep Links */}
            <Insights
              strengths={data.strengths}
              redFlags={data.redFlags}
              suggestions={data.suggestions}
              username={username}
              topRepos={data.topRepos}
            />

            {/* Feature 5: Recruiter "Tinder" Mode */}
            <RecruiterSwipeMode repos={data.repos || data.topRepos} username={username} />

            {/* Feature 4: Tech Debt Graveyard */}
            <TechDebtGraveyard repos={data.repos || data.topRepos} username={username} onToast={showToast} />

            {/* Feature 9: "Fake" PR Generator */}
            <FakePRGenerator username={username} repos={data.repos || data.topRepos} onToast={showToast} />

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
              <LanguageChart languages={data.mostUsedLanguages} showEmptyState={true} />
            </div>

            {/* Feature 13: Predictive Language Trends */}
            <LanguageTrendsPredictor repos={data.repos || data.topRepos} username={username} />

            {/* Feature 12: Portfolio Web Connectivity Graph */}
            <PortfolioWebGraph repos={data.topRepos} languages={data.mostUsedLanguages} />

            {/* Feature 10: Dark Web OSINT Check (Simulated) */}
            <SecurityScanModal
              username={username}
              repos={data.repos || data.topRepos}
              profile={data.profile}
              onToast={showToast}
              onRewardXP={handleRewardXP}
            />

            {/* Feature 6: "Hype" Readme Widget Generator */}
            <ReadmeWidgetGenerator username={username} score={data.score} tier={data.tier} onToast={showToast} />

            {/* Feature 15: "Open to Work" Banner Generator */}
            <OpenToWorkBanner
              username={username}
              score={data.score}
              profile={data.profile}
              repos={data.repos || data.topRepos}
              onToast={showToast}
            />

            {/* Resume Generator */}
            <ResumeGenerator report={data} advice={advice} />

            {/* HackerRank Style Black-and-White Resume */}
            <HackerRankResume report={data} advice={advice} onToast={showToast} />

            {/* AI Networking Matcher */}
            <NetworkMatcher languages={data.mostUsedLanguages} targetRole={targetRole} />

            {/* Developer Command Center / Feature Hub (25 Tools) */}
            <FeatureHub
              data={data}
              username={username}
              topRepos={data.topRepos}
              languages={data.mostUsedLanguages}
              onToast={showToast}
              onRewardXP={handleRewardXP}
            />
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

          {/* User Rating & Feedback System */}
          <div className="max-w-4xl mx-auto">
            <FeedbackRating
              username={username}
              onToast={showToast}
              onRewardXP={handleRewardXP}
            />
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

      {/* Floating Scroll to Top Action Button */}
      <ScrollToTopFAB />

      {/* Feature 3: Interactive Terminal Mode Easter Egg */}
      <TerminalEasterEgg username={username} score={data?.score} data={data} advice={advice} />

      {/* Phase 4, Item 1: First-Time User Onboarding Walkthrough */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleCompleteOnboarding}
        onQuickTry={(uname) => {
          setUsername(uname);
          handleAnalyze(uname);
        }}
      />

      {/* Phase 2, Item 2: Anna OS Credits Quota Exceeded Modal */}
      <QuotaModal
        isOpen={showQuotaModal}
        onClose={() => setShowQuotaModal(false)}
      />

      {/* 13. JoJo "To Be Continued" Meme Arrow */}
      {state === 'advised' && data && (
        <div
          className="fixed bottom-6 right-6 z-40 jojo-arrow-container pointer-events-none select-none"
          aria-hidden="true"
        >
          <div className="jojo-arrow-bounce flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-black tracking-widest text-xs border-2 border-slate-900 shadow-2xl font-gaming">
            <span className="text-base leading-none">◀</span>
            <span>TO BE CONTINUED</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
