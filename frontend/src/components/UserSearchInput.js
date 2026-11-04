import React, { useState, useEffect, useRef } from 'react';
import { Search, RefreshCw, History, X, Mic, MicOff } from 'lucide-react';
import { searchGitHubUsers, getLocalUserMatches } from '../lib/userSearch';

/**
 * Live user search dropdown using GitHub Search API with instant fallback & keyboard navigation.
 * Supports debounced autocomplete, recent history dropdown, voice-activated search, clear button, and focus ring.
 */
const DEFAULT_AVATAR =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="24" fill="%231e293b"/><path d="M50 30a15 15 0 100 30 15 15 0 000-30zm-24 45c0-10 10-15 24-15s24 5 24 15v5H26v-5z" fill="%2394a3b8"/></svg>';

const EMPTY_PROFILES = [];

function UserSearchInput({
  value,
  onChange,
  onSelect,
  onSubmit,
  onClear,
  disabled,
  placeholder = 'GitHub username (e.g. torvalds)...',
  recentProfiles = EMPTY_PROFILES,
  inputRef,
  onToast,
}) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showHistory, setShowHistory] = useState(false);
  const [listening, setListening] = useState(false);
  const debounceRef = useRef(null);
  const abortControllerRef = useRef(null);
  const containerRef = useRef(null);
  const recognitionRef = useRef(null);
  const recentProfilesRef = useRef(recentProfiles);
  recentProfilesRef.current = recentProfiles;

  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (onToast) {
        onToast('Voice search requires browser SpeechRecognition support.', 'warning');
      }
      return;
    }
    try {
      if (listening && recognitionRef.current) {
        recognitionRef.current.stop();
        setListening(false);
        return;
      }
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript || '';
        const clean = transcript
          .replace(/^(analyze|search|audit|inspect|check|find|who is)\s+/i, '')
          .replace(/^@+/, '')
          .trim()
          .split(/\s+/)[0];

        if (clean) {
          onChange(clean);
          if (onSelect) {
            onSelect(clean);
          } else if (onSubmit) {
            setTimeout(() => onSubmit(), 100);
          }
        }
        setListening(false);
      };

      recognition.onerror = () => {
        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognition.start();
    } catch {
      setListening(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      clearTimeout(debounceRef.current);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore abort error on unmount
        }
      }
    };
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const clean = (value || '').trim().replace(/^@+/, '');
    if (!clean || clean.length < 2) {
      setResults([]);
      setOpen(false);
      setSelectedIndex(-1);
      return;
    }

    // Immediately display instant local matches
    const profiles = recentProfilesRef.current || [];
    const initialMatches = getLocalUserMatches(clean, profiles);
    if (initialMatches.length > 0) {
      setResults(initialMatches);
      setOpen(true);
    }

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setLoading(true);
      try {
        const fetched = await searchGitHubUsers(clean, {
          signal: controller.signal,
          recentProfiles: profiles,
        });
        if (Array.isArray(fetched) && fetched.length > 0) {
          setResults(fetched);
          setOpen(true);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          // Fallback handled inside searchGitHubUsers
        }
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(debounceRef.current);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [value]);

  const handleSelect = (userLogin) => {
    setOpen(false);
    setShowHistory(false);
    setResults([]);
    setSelectedIndex(-1);
    if (onSelect) {
      onSelect(userLogin);
    } else {
      onChange(userLogin);
    }
  };

  const handleClear = () => {
    onChange('');
    setResults([]);
    setOpen(false);
    setSelectedIndex(-1);
    setShowHistory(false);
    if (onClear) onClear();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setOpen(false);
      setShowHistory(false);
      setSelectedIndex(-1);
      return;
    }

    if (open && results.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        return;
      }
      if (e.key === 'Enter') {
        if (selectedIndex >= 0 && results[selectedIndex]) {
          e.preventDefault();
          handleSelect(results[selectedIndex].login);
          return;
        }
      }
    }

    if (e.key === 'Enter' && onSubmit) {
      setOpen(false);
      setShowHistory(false);
      onSubmit();
    }
  };

  return (
    <div className={`relative flex-1 ${open || showHistory ? 'z-40' : 'z-20'}`} ref={containerRef}>
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-indigo-300 pointer-events-none" />

      <input
        ref={inputRef}
        className="w-full pl-11 pr-24 py-3 rounded-xl text-white placeholder-indigo-200/50 bg-white/10 border border-white/20 backdrop-blur-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 focus:shadow-[0_0_15px_rgba(99,102,241,0.35)] transition-all duration-200"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          setShowHistory(false);
          onChange(e.target.value);
        }}
        onFocus={() => {
          if (value && value.trim().length >= 2 && results.length > 0) {
            setOpen(true);
          }
        }}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        autoComplete="off"
        spellCheck="false"
      />

      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1.5">
        {loading && (
          <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin mr-1" />
        )}

        {/* Clear Button */}
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition"
            aria-label="Clear input"
            title="Clear"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Voice-Activated Search Button */}
        <button
          type="button"
          onClick={startVoiceSearch}
          disabled={disabled}
          className={`p-1 rounded-md transition ${
            listening
              ? 'text-rose-400 bg-rose-500/20 ring-2 ring-rose-500 animate-pulse'
              : 'text-gray-400 hover:text-indigo-200 hover:bg-white/10'
          }`}
          aria-label={listening ? 'Listening to voice search...' : 'Voice Search'}
          title={listening ? 'Listening... say e.g. "Analyze torvalds"' : 'Voice Search (say "Analyze torvalds")'}
        >
          {listening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
        </button>

        {/* Recently Viewed History Dropdown Trigger */}
        {recentProfiles && recentProfiles.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setShowHistory(!showHistory);
              setOpen(false);
            }}
            className={`p-1 rounded-md transition ${
              showHistory ? 'text-indigo-300 bg-white/15' : 'text-gray-400 hover:text-indigo-200 hover:bg-white/10'
            }`}
            aria-label="Recently viewed profiles"
            title="Recently viewed profiles"
          >
            <History className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Keyboard Shortcut Hint */}
        {!value && (
          <kbd className="hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono text-indigo-200/60 bg-white/10 rounded border border-white/15 pointer-events-none">
            /
          </kbd>
        )}
      </div>

      {/* Autocomplete Suggestions Dropdown */}
      {open && results.length > 0 && (
        <div
          className="absolute top-full left-0 w-full z-50 mt-2 bg-slate-950 border border-slate-700/80 rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-fade-in ring-1 ring-white/10"
          style={{ backgroundColor: '#090d16', zIndex: 9999 }}
        >
          <div
            className="px-3.5 py-1.5 border-b border-gray-800 flex items-center justify-between text-[11px] text-gray-400 font-semibold uppercase tracking-wider sticky top-0 backdrop-blur-sm z-10"
            style={{ backgroundColor: '#0d1322' }}
          >
            <span className="flex items-center gap-1.5 text-indigo-300">
              <Search className="w-3.5 h-3.5 text-indigo-400" /> GitHub Developers
            </span>
            <span className="text-[10px] text-gray-500">{results.length} results</span>
          </div>

          {results.map((user, idx) => (
            <button
              key={user.id || user.login}
              type="button"
              onClick={() => handleSelect(user.login)}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 transition text-left border-b border-gray-800 last:border-0 ${
                selectedIndex === idx
                  ? 'bg-indigo-600/30 ring-1 ring-inset ring-indigo-500/50 text-white'
                  : 'hover:bg-indigo-500/15 text-gray-200'
              }`}
              style={{ backgroundColor: selectedIndex === idx ? 'rgba(79, 70, 229, 0.3)' : '#090d16' }}
            >
                <img
                  src={user.avatar_url || DEFAULT_AVATAR}
                  alt={user.login}
                  crossOrigin="anonymous"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = DEFAULT_AVATAR;
                  }}
                  className="w-7 h-7 rounded-full border border-gray-700 object-cover flex-shrink-0"
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-semibold text-white truncate">
                    @{user.login}
                  </span>
                  {user.name && (
                    <span className="text-[11px] text-gray-400 truncate">
                      {user.name}
                    </span>
                  )}
                </div>
                {user.isRecent && (
                  <span className="ml-auto text-[10px] text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30 font-medium">
                    Recent
                  </span>
                )}
                {user.type === 'Organization' && (
                  <span className="ml-auto text-[10px] text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full border border-gray-700">
                    org
                  </span>
                )}
              </button>
            ))}

          <div
            className="px-3.5 py-1.5 border-t border-gray-800/80 flex items-center justify-between text-[10px] text-gray-500 sticky bottom-0"
            style={{ backgroundColor: '#090d16' }}
          >
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>esc Close</span>
          </div>
        </div>
      )}

      {/* Recently Viewed Dropdown */}
      {showHistory && recentProfiles.length > 0 && !open && (
        <div
          className="absolute top-full left-0 w-full z-50 mt-2 bg-slate-950 border border-slate-700/80 rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-fade-in ring-1 ring-white/10"
          style={{ backgroundColor: '#090d16', zIndex: 9999 }}
        >
          <div
            className="px-3.5 py-2 border-b border-gray-800 flex items-center justify-between text-[11px] text-gray-400 font-semibold uppercase tracking-wider sticky top-0 backdrop-blur-sm z-10"
            style={{ backgroundColor: '#0d1322' }}
          >
            <span className="flex items-center gap-1.5 text-indigo-300">
              <History className="w-3.5 h-3.5 text-indigo-400" /> Recently Viewed
            </span>
            <span className="text-[10px] text-gray-500">Last 5</span>
          </div>
          {recentProfiles.slice(0, 5).map((p) => (
            <button
              key={p.username}
              type="button"
              onClick={() => handleSelect(p.username)}
              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-indigo-500/15 transition text-left border-b border-gray-800 last:border-0"
              style={{ backgroundColor: '#090d16' }}
            >
              <span className="text-xs font-semibold text-white">
                @{p.username}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-md font-bold text-indigo-300 bg-indigo-500/20 border border-indigo-500/30">
                Score: {p.score}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserSearchInput;
