import React, { useState, useEffect, useRef } from 'react';
import { Search, RefreshCw, History, X, Mic, MicOff } from 'lucide-react';

/**
 * Live user search dropdown using GitHub Search API.
 * Supports debounced autocomplete, recent history dropdown, voice-activated search, clear button, and focus ring.
 */
function UserSearchInput({
  value,
  onChange,
  onSelect,
  onSubmit,
  onClear,
  disabled,
  placeholder = 'GitHub username (e.g. torvalds)...',
  recentProfiles = [],
  inputRef,
  onToast,
}) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [listening, setListening] = useState(false);
  const debounceRef = useRef(null);
  const abortControllerRef = useRef(null);
  const containerRef = useRef(null);
  const recognitionRef = useRef(null);

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
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.github.com/search/users?q=${encodeURIComponent(clean)}&per_page=6`,
          {
            headers: { Accept: 'application/vnd.github.v3+json' },
            signal: controller.signal,
          }
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.items || []);
          setOpen(true);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          // Network error – silently ignore
        }
      } finally {
        setLoading(false);
      }
    }, 500);

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
    setShowHistory(false);
    if (onClear) onClear();
  };

  return (
    <div className="relative flex-1" ref={containerRef}>
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-indigo-300 pointer-events-none" />

      <input
        ref={inputRef}
        className="w-full pl-11 pr-24 py-3 rounded-xl text-white placeholder-indigo-200/50 bg-white/10 border border-white/20 backdrop-blur-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 focus:shadow-[0_0_15px_rgba(99,102,241,0.35)] transition-all duration-200"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        onFocus={() => {
          if (!value && recentProfiles && recentProfiles.length > 0) {
            setShowHistory(true);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setOpen(false);
            setShowHistory(false);
          }
          if (e.key === 'Enter' && onSubmit) {
            setOpen(false);
            setShowHistory(false);
            onSubmit();
          }
        }}
        disabled={disabled}
        autoComplete="off"
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
          className="absolute top-full left-0 w-full z-50 mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-fade-in"
        >
          {results.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => handleSelect(user.login)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-500/10 transition text-left border-b border-gray-800 last:border-0"
            >
              <img
                src={user.avatar_url}
                alt={user.login}
                className="w-7 h-7 rounded-full border border-gray-700 object-cover"
              />
              <span className="text-sm font-medium text-white">
                @{user.login}
              </span>
              {user.type === 'Organization' && (
                <span className="ml-auto text-[10px] text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full border border-gray-700">
                  org
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Recently Viewed Dropdown */}
      {showHistory && recentProfiles.length > 0 && !open && (
        <div
          className="absolute top-full left-0 w-full z-50 mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-fade-in"
        >
          <div className="px-3.5 py-2 border-b border-gray-800 flex items-center justify-between text-[11px] text-gray-400 font-semibold uppercase tracking-wider bg-gray-900/90 sticky top-0 backdrop-blur-sm z-10">
            <span className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-indigo-400" /> Recently Viewed
            </span>
            <span className="text-[10px] text-gray-500">Last 5</span>
          </div>
          {recentProfiles.slice(0, 5).map((p) => (
            <button
              key={p.username}
              type="button"
              onClick={() => handleSelect(p.username)}
              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-indigo-500/10 transition text-left border-b border-gray-800 last:border-0"
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
