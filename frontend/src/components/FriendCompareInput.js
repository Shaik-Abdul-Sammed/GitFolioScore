import React, { useState, useEffect, useRef } from 'react';
import { UserCheck, RefreshCw, CheckCircle2, X } from 'lucide-react';
import { searchGitHubUsers, getLocalUserMatches } from '../lib/userSearch';

const DEFAULT_AVATAR =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="24" fill="%231e293b"/><path d="M50 30a15 15 0 100 30 15 15 0 000-30zm-24 45c0-10 10-15 24-15s24 5 24 15v5H26v-5z" fill="%2394a3b8"/></svg>';

function FriendCompareInput({ value, onChange, onSelect, onSubmit, onClear, disabled }) {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debounceRef = useRef(null);
  const abortControllerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      clearTimeout(debounceRef.current);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
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
      setAvatarUrl(null);
      setResults([]);
      setOpen(false);
      setSelectedIndex(-1);
      return;
    }

    // Immediately display instant local matches
    const initialMatches = getLocalUserMatches(clean);
    if (initialMatches.length > 0) {
      setResults(initialMatches);
      setOpen(true);
      const exact = initialMatches.find((u) => u.login.toLowerCase() === clean.toLowerCase());
      if (exact) setAvatarUrl(exact.avatar_url);
    }

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setLoading(true);
      try {
        const fetched = await searchGitHubUsers(clean, {
          signal: controller.signal,
        });
        if (Array.isArray(fetched) && fetched.length > 0) {
          setResults(fetched);
          setOpen(true);

          // If exact match found, use their avatar
          const exact = fetched.find((u) => u.login.toLowerCase() === clean.toLowerCase());
          if (exact) {
            setAvatarUrl(exact.avatar_url);
          } else if (fetched.length > 0) {
            setAvatarUrl((prev) => prev || fetched[0].avatar_url);
          }
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          // Handled inside searchGitHubUsers
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
  }, [value]); // intentionally omit avatarUrl to prevent infinite render loops

  const handleSelect = (userOrLogin) => {
    const login = typeof userOrLogin === 'object' && userOrLogin !== null ? userOrLogin.login : userOrLogin;
    const avatar = typeof userOrLogin === 'object' && userOrLogin?.avatar_url
      ? userOrLogin.avatar_url
      : `https://avatars.githubusercontent.com/${login}`;

    setAvatarUrl(avatar);
    setOpen(false);
    setResults([]);
    setSelectedIndex(-1);
    if (onSelect) {
      onSelect(login);
    } else {
      onChange(login);
    }
  };

  const handleClear = () => {
    onChange('');
    setAvatarUrl(null);
    setResults([]);
    setOpen(false);
    setSelectedIndex(-1);
    if (onClear) onClear();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setOpen(false);
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
          handleSelect(results[selectedIndex]);
          return;
        }
      }
    }

    if (e.key === 'Enter' && onSubmit) {
      setOpen(false);
      onSubmit();
    }
  };

  return (
    <div className="relative flex-1" ref={containerRef}>
      <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Friend Avatar"
            crossOrigin="anonymous"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = DEFAULT_AVATAR;
            }}
            className="w-5 h-5 rounded-full border border-purple-400 object-cover shadow"
          />
        ) : (
          <UserCheck className="w-4 h-4 text-purple-300" />
        )}
      </div>

      <input
        className="w-full pl-11 pr-16 py-3 rounded-xl text-white placeholder-purple-200/50 bg-white/10 border border-white/20 backdrop-blur-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 focus:shadow-[0_0_15px_rgba(168,85,247,0.35)] transition-all duration-200"
        type="text"
        placeholder="Friend's username (e.g. gaearon)..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
        {loading && <RefreshCw className="w-3.5 h-3.5 text-purple-300 animate-spin" />}
        {avatarUrl && !loading && (
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        )}
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition"
            aria-label="Clear friend input"
            title="Clear"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete Suggestions Dropdown */}
      {open && results.length > 0 && (
        <div
          className="absolute top-full left-0 w-full z-50 mt-2 bg-slate-950 border border-slate-700/80 rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-fade-in ring-1 ring-white/10"
          style={{ backgroundColor: '#090d16', zIndex: 100 }}
        >
          {results.map((user, idx) => (
            <button
              key={user.id || user.login}
              type="button"
              onClick={() => handleSelect(user)}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 transition text-left border-b border-gray-800 last:border-0 ${
                selectedIndex === idx
                  ? 'bg-purple-600/30 ring-1 ring-inset ring-purple-500/50 text-white'
                  : 'hover:bg-purple-500/15 text-gray-200'
              }`}
              style={{ backgroundColor: selectedIndex === idx ? 'rgba(147, 51, 234, 0.3)' : '#090d16' }}
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
              {user.type === 'Organization' && (
                <span className="ml-auto text-[10px] text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full border border-gray-700">
                  org
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default FriendCompareInput;
