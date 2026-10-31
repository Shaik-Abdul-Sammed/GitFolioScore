import React, { useState, useEffect, useRef } from 'react';
import { Search, RefreshCw } from 'lucide-react';

/**
 * Live user search dropdown using GitHub Search API.
 * Debounces input, shows avatar + username suggestions.
 */
function UserSearchInput({ value, onChange, onSelect, onSubmit, disabled }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
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
    if (!value || value.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.github.com/search/users?q=${encodeURIComponent(value)}&per_page=6`,
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
  }, [value]);

  const handleSelect = (user) => {
    setOpen(false);
    setResults([]);
    onSelect(user.login);
  };

  return (
    <div className="relative flex-1" ref={containerRef}>
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-300" />
      {loading && (
        <RefreshCw className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-indigo-400 animate-spin" />
      )}
      <input
        className="w-full pl-12 pr-10 py-3 rounded-xl text-white placeholder-indigo-300/60 bg-white/10 border border-white/20 backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
        type="text"
        placeholder="GitHub username (e.g. torvalds)..."
        value={value}
        onChange={(e) => { onChange(e.target.value); }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false);
          if (e.key === 'Enter' && onSubmit) onSubmit();
        }}
        disabled={disabled}
        autoComplete="off"
      />
      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl border border-white/15 shadow-2xl overflow-hidden"
          style={{ background: 'var(--bg-secondary)' }}>
          {results.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => handleSelect(user)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-500/10 transition text-left"
            >
              <img
                src={user.avatar_url}
                alt={user.login}
                className="w-7 h-7 rounded-full border border-white/10"
              />
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                @{user.login}
              </span>
              {user.type === 'Organization' && (
                <span className="ml-auto text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">org</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserSearchInput;
