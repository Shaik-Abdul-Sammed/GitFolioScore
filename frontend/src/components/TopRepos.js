import React, { useState, useMemo } from 'react';
import { Star, GitFork, Calendar, ExternalLink, FolderGit2, Filter } from 'lucide-react';

function TopRepos({ repos, username }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('stars');
  const [langFilter, setLangFilter] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 6;

  const languages = useMemo(() => {
    if (!repos) return [];
    return [...new Set(repos.map(r => r.language).filter(Boolean))].sort();
  }, [repos]);

  const filtered = useMemo(() => {
    if (!repos) return [];
    let list = [...repos];
    if (search) list = list.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
    if (langFilter) list = list.filter(r => r.language === langFilter);
    list.sort((a, b) => {
      if (sortBy === 'stars') return (b.stars || 0) - (a.stars || 0);
      if (sortBy === 'forks') return (b.forks || 0) - (a.forks || 0);
      return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    });
    return list;
  }, [repos, search, sortBy, langFilter]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  if (!repos || repos.length === 0) return null;

  return (
    <div className="premium-card p-6 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-4">
        <FolderGit2 className="w-5 h-5" style={{ color: 'var(--primary)' }} />
        <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Top Repositories</h3>
        <span className="badge badge-purple ml-auto">{repos.length} repos</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[140px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input
            className="premium-input pl-9 py-2 w-full text-sm"
            placeholder="Search repos..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="premium-input py-2 text-sm"
          value={langFilter}
          aria-label="Filter by language"
          onChange={e => { setLangFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Languages</option>
          {languages.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <select
          className="premium-input py-2 text-sm"
          value={sortBy}
          aria-label="Sort repositories by"
          onChange={e => setSortBy(e.target.value)}
        >
          <option value="stars">⭐ Stars</option>
          <option value="forks">🔱 Forks</option>
          <option value="updated">📅 Updated</option>
        </select>
      </div>

      {/* Repo cards */}
      <div className="grid grid-cols-1 gap-3 stagger-children">
        {paged.map(repo => (
          <RepoCard key={repo.name} repo={repo} username={username} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-5">
          <button
            className="btn-secondary text-sm px-3 py-1.5"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Prev
          </button>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Page {page} of {totalPages}
          </span>
          <button
            className="btn-secondary text-sm px-3 py-1.5"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

function RepoCard({ repo, username }) {
  return (
    <a
      href={`https://github.com/${username}/${repo.name}`}
      target="_blank"
      rel="noopener noreferrer"
      className="glass-card p-4 flex items-start gap-4 hover:border-indigo-500/40 group"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-sm truncate group-hover:text-indigo-400 transition-colors" style={{ color: 'var(--text-primary)' }}>
            {repo.name}
          </h4>
          <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--primary)' }} />
        </div>
        {repo.description && (
          <p className="text-xs line-clamp-2 mb-2" style={{ color: 'var(--text-muted)' }}>
            {repo.description}
          </p>
        )}
        <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          {repo.language && (
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: getLanguageColor(repo.language) }} />
              {repo.language}
            </span>
          )}
          <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" /> {repo.stars ?? 0}</span>
          <span className="flex items-center gap-1"><GitFork className="w-3.5 h-3.5" /> {repo.forks ?? 0}</span>
          {repo.updatedAt && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {new Date(repo.updatedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}

function getLanguageColor(lang) {
  const colors = {
    JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5', Java: '#b07219',
    Go: '#00ADD8', Rust: '#dea584', Ruby: '#701516', PHP: '#4F5D95', 'C++': '#f34b7d',
    C: '#555555', 'C#': '#178600', Swift: '#F05138', Kotlin: '#A97BFF', Dart: '#00B4AB',
    HTML: '#e34c26', CSS: '#563d7c', Shell: '#89e051', Lua: '#000080', Vim: '#199f4b',
  };
  return colors[lang] || '#6366f1';
}

export default TopRepos;