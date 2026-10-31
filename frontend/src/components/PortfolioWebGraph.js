import React, { useState, useMemo } from 'react';
import { Network, FolderGit2, Code2 } from 'lucide-react';

const LANG_COLORS = {
  JavaScript: '#f59e0b',
  TypeScript: '#3b82f6',
  Python: '#10b981',
  Rust: '#ef4444',
  Go: '#06b6d4',
  HTML: '#f97316',
  CSS: '#8b5cf6',
  Java: '#b45309',
  'C++': '#ec4899',
  Ruby: '#dc2626',
};

function PortfolioWebGraph({ repos = [], languages = [] }) {
  const [hoveredNode, setHoveredNode] = useState(null);

  // Take top 5 repos and top 4 languages
  const { langNodes, repoNodes, links } = useMemo(() => {
    const activeRepos = (repos || []).slice(0, 5);
    const activeLangs = (languages || [])
      .slice(0, 4)
      .map((l) => (Array.isArray(l) ? l[0] : l.lang || l.name || ''));

    // Compute coordinate positions in a 500x260 viewBox
    // Left column: Languages
    const lNodes = activeLangs.map((lang, idx) => ({
      id: `lang-${lang}`,
      type: 'language',
      name: lang,
      color: LANG_COLORS[lang] || '#6366f1',
      x: 80,
      y: 40 + idx * 60,
    }));

    // Right column: Repositories
    const rNodes = activeRepos.map((repo, idx) => ({
      id: `repo-${repo.name}`,
      type: 'repo',
      name: repo.name,
      language: repo.language,
      stars: repo.stars ?? 0,
      x: 380,
      y: 30 + idx * 48,
    }));

    // Links between repo and matching language (or first language if no exact match)
    const connLinks = [];
    rNodes.forEach((r) => {
      const matchLang = lNodes.find(
        (l) => l.name.toLowerCase() === (r.language || '').toLowerCase()
      );
      if (matchLang) {
        connLinks.push({
          source: matchLang,
          target: r,
          color: matchLang.color,
        });
      } else if (lNodes.length > 0) {
        // connect to nearest
        connLinks.push({
          source: lNodes[0],
          target: r,
          color: '#64748b',
        });
      }
    });

    return { langNodes: lNodes, repoNodes: rNodes, links: connLinks };
  }, [repos, languages]);

  if (langNodes.length === 0 && repoNodes.length === 0) return null;

  return (
    <div className="premium-card p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Portfolio Web Connectivity
          </h3>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
            Node Graph
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-4">
        Interactive visualization connecting your primary tech stacks to active repositories.
      </p>

      <div className="relative w-full rounded-2xl border border-white/10 bg-slate-950/60 p-2 overflow-hidden shadow-inner">
        <svg
          viewBox="0 0 460 270"
          className="w-full h-auto"
          style={{ minHeight: '220px' }}
        >
          <defs>
            <linearGradient id="link-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.4" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Connection Lines (Cubic Bezier Curves) */}
          {links.map((link, idx) => {
            const isHighlighted =
              hoveredNode === link.source.id || hoveredNode === link.target.id;
            const pathData = `M ${link.source.x + 40} ${link.source.y} C ${
              (link.source.x + link.target.x) / 2
            } ${link.source.y}, ${(link.source.x + link.target.x) / 2} ${
              link.target.y
            }, ${link.target.x - 40} ${link.target.y}`;

            return (
              <g key={idx}>
                <path
                  d={pathData}
                  fill="none"
                  stroke={isHighlighted ? '#a855f7' : link.color}
                  strokeWidth={isHighlighted ? 3 : 1.5}
                  strokeOpacity={isHighlighted ? 0.95 : 0.45}
                  filter={isHighlighted ? 'url(#glow)' : undefined}
                  className="transition-all duration-300"
                />
              </g>
            );
          })}

          {/* Language Nodes (Left) */}
          {langNodes.map((node) => {
            const isHovered = hoveredNode === node.id;
            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer"
              >
                <circle
                  r={isHovered ? 26 : 22}
                  fill="rgba(15, 23, 42, 0.9)"
                  stroke={node.color}
                  strokeWidth={isHovered ? 3 : 2}
                  filter={isHovered ? 'url(#glow)' : undefined}
                  className="transition-all duration-200"
                />
                <circle r="4" fill={node.color} />
                <text
                  x="0"
                  y="36"
                  textAnchor="middle"
                  fill="#e2e8f0"
                  fontSize="11"
                  fontWeight="600"
                  className="select-none"
                >
                  {node.name}
                </text>
              </g>
            );
          })}

          {/* Repo Nodes (Right) */}
          {repoNodes.map((node) => {
            const isHovered = hoveredNode === node.id;
            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer"
              >
                <rect
                  x="-45"
                  y="-16"
                  width="110"
                  height="32"
                  rx="8"
                  fill="rgba(15, 23, 42, 0.9)"
                  stroke={isHovered ? '#a855f7' : 'rgba(255, 255, 255, 0.2)'}
                  strokeWidth={isHovered ? 2 : 1}
                  className="transition-all duration-200"
                />
                <text
                  x="10"
                  y="4"
                  textAnchor="middle"
                  fill="#f1f5f9"
                  fontSize="10"
                  fontWeight="bold"
                  className="select-none"
                >
                  {node.name.length > 12 ? node.name.slice(0, 10) + '..' : node.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-between px-3 py-1.5 border-t border-white/5 text-[11px] text-gray-400">
          <span className="flex items-center gap-1">
            <Code2 className="w-3.5 h-3.5 text-indigo-400" /> Languages (Left)
          </span>
          <span className="flex items-center gap-1">
            <FolderGit2 className="w-3.5 h-3.5 text-purple-400" /> Repositories (Right)
          </span>
        </div>
      </div>
    </div>
  );
}

export default PortfolioWebGraph;
