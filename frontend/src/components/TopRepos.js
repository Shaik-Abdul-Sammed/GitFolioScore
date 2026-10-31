import React, { useState, useMemo, useEffect } from 'react';
import {
  Star,
  GitFork,
  Calendar,
  ExternalLink,
  FolderGit2,
  Filter,
  Pin,
  Sparkles,
  Copy,
  Check,
  X,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { generateReadme } from '../lib/llm';
import { checkRepoDemoLinks } from '../lib/demoChecker';

function TopRepos({ repos, username }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('stars');
  const [langFilter, setLangFilter] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 6;

  // Phase 3, Feature 8: Live Demo Link Statuses
  const [demoStatuses, setDemoStatuses] = useState({});

  useEffect(() => {
    let isMounted = true;
    if (repos && repos.length > 0) {
      checkRepoDemoLinks(repos).then((res) => {
        if (isMounted) setDemoStatuses(res);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [repos]);

  // State for README generation modal
  const [readmeModalRepo, setReadmeModalRepo] = useState(null);
  const [generatedReadme, setGeneratedReadme] = useState('');
  const [isGeneratingReadme, setIsGeneratingReadme] = useState(false);
  const [readmeCopied, setReadmeCopied] = useState(false);
  const [readmeError, setReadmeError] = useState('');

  const languages = useMemo(() => {
    if (!repos) return [];
    return [...new Set(repos.map((r) => r.language).filter(Boolean))].sort();
  }, [repos]);

  // Feature 4: Top 3 Repos to Pin
  const top3ToPin = useMemo(() => {
    if (!repos || repos.length === 0) return [];
    return [...repos]
      .map((r) => {
        let pinScore = (r.stars || 0) * 3 + (r.forks || 0) * 2;
        if (r.description && r.description.trim().length > 15) pinScore += 20;
        if (r.language) pinScore += 10;
        if (r.hasReadme) pinScore += 15;
        return { ...r, pinScore };
      })
      .sort((a, b) => b.pinScore - a.pinScore)
      .slice(0, 3);
  }, [repos]);

  const filtered = useMemo(() => {
    if (!repos) return [];
    let list = [...repos];
    if (search) list = list.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));
    if (langFilter) list = list.filter((r) => r.language === langFilter);
    list.sort((a, b) => {
      if (sortBy === 'stars') return (b.stars || 0) - (a.stars || 0);
      if (sortBy === 'forks') return (b.forks || 0) - (a.forks || 0);
      return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    });
    return list;
  }, [repos, search, sortBy, langFilter]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const handleOpenReadmeModal = async (repo) => {
    setReadmeModalRepo(repo);
    setGeneratedReadme('');
    setReadmeError('');
    setIsGeneratingReadme(true);
    setReadmeCopied(false);

    try {
      const markdown = await generateReadme(repo);
      setGeneratedReadme(markdown);
    } catch (err) {
      setReadmeError(err.userMessage || 'Could not generate README. Please check AI connection.');
    } finally {
      setIsGeneratingReadme(false);
    }
  };

  const handleCopyReadme = () => {
    if (!generatedReadme) return;
    navigator.clipboard.writeText(generatedReadme);
    setReadmeCopied(true);
    setTimeout(() => setReadmeCopied(false), 2000);
  };

  if (!repos || repos.length === 0) return null;

  return (
    <div className="premium-card p-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <FolderGit2 className="w-5 h-5" style={{ color: 'var(--primary)' }} />
        <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Top Repositories</h3>
        <span className="badge badge-purple ml-auto">{repos.length} repos</span>
      </div>

      {/* Feature 4: Top 3 Repos to Pin on GitHub */}
      {top3ToPin.length > 0 && !search && page === 1 && (
        <div className="mb-6 p-4 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Pin className="w-4 h-4 text-indigo-400 rotate-45" />
            <h4 className="text-sm font-bold tracking-tight text-indigo-200">
              Recommended Top 3 Repos to Pin on GitHub
            </h4>
          </div>
          <p className="text-xs text-indigo-300/70 mb-3">
            These flagship repositories showcase your strongest code velocity, documentation depth, and technical architecture:
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {top3ToPin.map((repo, idx) => (
              <div
                key={repo.name}
                className="p-3 rounded-xl border border-white/10 bg-white/5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300">
                      #{idx + 1} Pin
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                      <Star className="w-3 h-3 fill-amber-400" /> {repo.stars ?? 0}
                    </span>
                  </div>
                  <h5 className="font-semibold text-xs truncate" style={{ color: 'var(--text-primary)' }}>
                    {repo.name}
                  </h5>
                  <p className="text-[11px] line-clamp-2 text-gray-400 mt-1">
                    {repo.description || 'Core technical implementation project.'}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] font-medium text-indigo-300">
                    {repo.language || 'Codebase'}
                  </span>
                  <button
                    onClick={() => handleOpenReadmeModal(repo)}
                    className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <Sparkles className="w-2.5 h-2.5" /> README
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[140px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input
            className="premium-input pl-9 py-2 w-full text-sm"
            placeholder="Search repos..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="premium-input py-2 text-sm"
          value={langFilter}
          aria-label="Filter by language"
          onChange={(e) => { setLangFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Languages</option>
          {languages.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <select
          className="premium-input py-2 text-sm"
          value={sortBy}
          aria-label="Sort repositories by"
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="stars">⭐ Stars</option>
          <option value="forks">🔱 Forks</option>
          <option value="updated">📅 Updated</option>
        </select>
      </div>

      {/* Repo cards */}
      <div className="grid grid-cols-1 gap-3 stagger-children">
        {paged.map((repo) => (
          <RepoCard
            key={repo.name}
            repo={repo}
            username={username}
            demoStatus={demoStatuses[repo.name]}
            onGenerateReadme={() => handleOpenReadmeModal(repo)}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-5">
          <button
            className="btn-secondary text-sm px-3 py-1.5"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Prev
          </button>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Page {page} of {totalPages}
          </span>
          <button
            className="btn-secondary text-sm px-3 py-1.5"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Next →
          </button>
        </div>
      )}

      {/* Feature 5: Missing README Generator Modal */}
      {readmeModalRepo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden"
            style={{
              background: 'var(--bg-secondary)',
              borderColor: 'var(--border)',
            }}
          >
            {/* Modal Header */}
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                  README.md Generator · <span className="text-indigo-400">{readmeModalRepo.name}</span>
                </h4>
              </div>
              <button
                onClick={() => setReadmeModalRepo(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 flex-1 overflow-y-auto font-mono text-xs leading-relaxed">
              {isGeneratingReadme ? (
                <div className="py-16 text-center space-y-3">
                  <RefreshCw className="w-7 h-7 text-indigo-400 animate-spin mx-auto" />
                  <p className="text-sm font-sans font-medium text-indigo-200">
                    Drafting professional README for {readmeModalRepo.name}...
                  </p>
                  <p className="text-xs font-sans text-gray-400">
                    Synthesizing architecture, setup instructions, and feature sections.
                  </p>
                </div>
              ) : readmeError ? (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-sans text-sm">
                  {readmeError}
                </div>
              ) : (
                <pre
                  className="p-4 rounded-xl overflow-x-auto whitespace-pre-wrap select-all border"
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {generatedReadme}
                </pre>
              )}
            </div>

            {/* Modal Footer */}
            <div
              className="p-4 border-t flex items-center justify-between gap-3"
              style={{ borderColor: 'var(--border)' }}
            >
              <span className="text-xs font-sans text-gray-400">
                Ready to commit directly to your GitHub repo.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setReadmeModalRepo(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-white/20 text-gray-300 hover:bg-white/10 transition"
                >
                  Close
                </button>
                <button
                  onClick={handleCopyReadme}
                  disabled={!generatedReadme || isGeneratingReadme}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow transition flex items-center gap-1.5 disabled:opacity-50"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  {readmeCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Markdown</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RepoCard({ repo, username, demoStatus, onGenerateReadme }) {
  return (
    <div className="glass-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-indigo-500/40 group transition-all">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <a
            href={username ? `https://github.com/${username}/${repo.name}` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-sm truncate group-hover:text-indigo-400 transition-colors flex items-center gap-1"
            style={{ color: 'var(--text-primary)' }}
          >
            {repo.name}
            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--primary)' }} />
          </a>

          {/* Phase 3, Feature 8: Live Demo Link Checker Badge */}
          {demoStatus && demoStatus.checked && (
            <a
              href={demoStatus.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition ${
                demoStatus.isLive
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
              }`}
            >
              {demoStatus.isLive ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Demo OK
                </>
              ) : (
                <>
                  <X className="w-2.5 h-2.5 text-rose-400" />
                  Broken Demo Link
                </>
              )}
            </a>
          )}
        </div>
        {repo.description && (
          <p className="text-xs line-clamp-2 mb-2" style={{ color: 'var(--text-muted)' }}>
            {repo.description}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
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

      {/* Feature 5: Generate README action */}
      <div className="flex-shrink-0 flex items-center gap-2">
        <button
          type="button"
          onClick={onGenerateReadme}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-400/20 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-semibold shadow-sm transition active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Generate README</span>
        </button>
      </div>
    </div>
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