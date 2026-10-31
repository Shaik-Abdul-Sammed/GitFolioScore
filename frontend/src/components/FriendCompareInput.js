import React, { useState, useEffect, useRef } from 'react';
import { UserCheck, RefreshCw, CheckCircle2, X } from 'lucide-react';

function FriendCompareInput({ value, onChange, onSelect, onSubmit, onClear, disabled }) {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    const clean = (value || '').trim().replace(/^@+/, '');
    if (!clean || clean.length < 2) {
      setAvatarUrl(null);
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
          const items = data.items || [];
          setResults(items);
          setOpen(items.length > 0);

          // If exact match found, use their avatar
          const exact = items.find((u) => u.login.toLowerCase() === clean.toLowerCase());
          if (exact) {
            setAvatarUrl(exact.avatar_url);
          } else if (items.length > 0 && !avatarUrl) {
            setAvatarUrl(items[0].avatar_url);
          }
        }
      } catch {
        // Best effort
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [value, avatarUrl]);

  const handleSelect = (user) => {
    setAvatarUrl(user.avatar_url);
    setOpen(false);
    setResults([]);
    if (onSelect) {
      onSelect(user.login);
    } else {
      onChange(user.login);
    }
  };

  const handleClear = () => {
    onChange('');
    setAvatarUrl(null);
    setResults([]);
    setOpen(false);
    if (onClear) onClear();
  };

  return (
    <div className="relative flex-1" ref={containerRef}>
      <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Friend Avatar"
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
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false);
          if (e.key === 'Enter' && onSubmit) {
            setOpen(false);
            onSubmit();
          }
        }}
        disabled={disabled}
        autoComplete="off"
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
          className="absolute top-full left-0 w-full z-50 mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-fade-in"
        >
          {results.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => handleSelect(user)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-purple-500/10 transition text-left border-b border-gray-800 last:border-0"
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
    </div>
  );
}

export default FriendCompareInput;
