import React, { useState, useEffect, useRef } from 'react';
import { Search, RefreshCw, History, X } from 'lucide-react';

/**
 * Live user search dropdown using GitHub Search API.
 * Supports debounced autocomplete, recent history dropdown, clear button, and focus ring.
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
}) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    const clean = (value || '').trim().replace(/^@+/, '');
    if (!clean || clean.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.github.com/search/users?q=${encodeURIComponent(clean)}&per_page=6`,
          { headers: { Accept: 'application/vnd.github.v3+json' } }
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.items || []);
          setOpen(true);
        }
      } catch {
        // Network error – silently ignore
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(debounceRef.current);
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
          className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border border-white/15 shadow-2xl overflow-hidden animate-fade-in"
          style={{ background: 'var(--bg-secondary, #0f172a)' }}
        >
          {results.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => handleSelect(user.login)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-500/10 transition text-left border-b border-white/5 last:border-0"
            >
              <img
                src={user.avatar_url}
                alt={user.login}
                className="w-7 h-7 rounded-full border border-white/10 object-cover"
              />
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                @{user.login}
              </span>
              {user.type === 'Organization' && (
                <span className="ml-auto text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
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
          className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border border-white/15 shadow-2xl overflow-hidden animate-fade-in"
          style={{ background: 'var(--bg-secondary, #0f172a)' }}
        >
          <div className="px-3.5 py-2 border-b border-white/10 flex items-center justify-between text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
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
              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-indigo-500/10 transition text-left border-b border-white/5 last:border-0"
            >
              <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
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
