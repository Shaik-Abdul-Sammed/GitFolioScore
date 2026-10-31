import React, { useState, useEffect, useRef } from 'react';
import { UserCheck, RefreshCw, CheckCircle2 } from 'lucide-react';

function FriendCompareInput({ value, onChange, disabled }) {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verifiedName, setVerifiedName] = useState('');
  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    const clean = (value || '').trim();
    if (clean.length < 2) {
      setAvatarUrl(null);
      setVerifiedName('');
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.github.com/users/${encodeURIComponent(clean)}`, {
          headers: { Accept: 'application/vnd.github.v3+json' },
        });
        if (res.ok) {
          const data = await res.json();
          setAvatarUrl(data.avatar_url);
          setVerifiedName(data.name || data.login);
        } else {
          setAvatarUrl(null);
          setVerifiedName('');
        }
      } catch {
        setAvatarUrl(null);
        setVerifiedName('');
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [value]);

  return (
    <div className="relative flex-1">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Friend Avatar"
            className="w-6 h-6 rounded-full border border-purple-400 object-cover shadow"
          />
        ) : (
          <UserCheck className="w-4 h-4 text-purple-300" />
        )}
      </div>

      <input
        className="w-full pl-11 pr-8 py-3 rounded-xl text-white placeholder-purple-200/50 bg-white/10 border border-white/20 backdrop-blur-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        type="text"
        placeholder="Friend's username (e.g. gaearon)..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />

      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 pointer-events-none">
        {loading && <RefreshCw className="w-3.5 h-3.5 text-purple-300 animate-spin" />}
        {avatarUrl && !loading && (
          <CheckCircle2 className="w-4 h-4 text-emerald-400" title={verifiedName} />
        )}
      </div>
    </div>
  );
}

export default FriendCompareInput;
