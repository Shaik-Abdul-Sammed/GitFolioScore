import React, { useState } from 'react';
import {
  GitPullRequest,
  Users,
  Trophy,
  Compass,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';

export function GoodFirstIssuesModal({ languages = [], onClose, onToast }) {
  const primaryLang = languages?.[0]
    ? (Array.isArray(languages[0]) ? languages[0][0] : languages[0].lang || languages[0].name || 'JavaScript')
    : 'JavaScript';

  const issues = [
    {
      repo: 'facebook/react',
      title: 'Add detailed TypeScript typing for experimental useActionState hooks',
      label: 'good first issue',
      difficulty: 'Beginner Friendly',
      time: '1–2 hrs',
      hint: 'Inspect packages/react/src/ReactHooks.js and add corresponding index.d.ts declarations.',
      url: 'https://github.com/facebook/react/issues',
    },
    {
      repo: 'vercel/next.js',
      title: 'Improve error message when middleware matcher regex fails to parse',
      label: 'help wanted',
      difficulty: 'Intermediate',
      time: '2–3 hrs',
      hint: 'Wrap regex parsing in a try/catch block inside packages/next/src/build/webpack/plugins.',
      url: 'https://github.com/vercel/next.js/issues',
    },
    {
      repo: 'tailwindlabs/tailwindcss',
      title: 'Support custom CSS grid line fractional shorthand in utility generator',
      label: 'good first issue',
      difficulty: 'Beginner Friendly',
      time: '1 hr',
      hint: 'Add a new utility rule in src/plugins/gridTemplateColumns.js with test coverage in tests/plugins.test.js.',
      url: 'https://github.com/tailwindlabs/tailwindcss/issues',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <GitPullRequest className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">&ldquo;Good First Issue&rdquo; Open Source Finder</h4>
            <p className="text-[11px] text-gray-400">Curated starter contributions matching your stack: <b className="text-emerald-400">{primaryLang}</b></p>
          </div>
        </div>
      </div>

      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {issues.map((iss, i) => (
          <div key={i} className="p-3.5 rounded-xl bg-slate-950/70 border border-white/10 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-300 font-mono">{iss.repo}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {iss.difficulty}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">⏱️ {iss.time}</span>
              </div>
            </div>
            <h5 className="font-semibold text-white leading-snug">{iss.title}</h5>
            <div className="p-2 rounded-lg bg-black/40 border border-white/5 text-[11px] text-gray-300">
              <span className="text-yellow-400 font-bold">💡 Starter Hint:</span> {iss.hint}
            </div>
            <div className="flex justify-end pt-1">
              <a
                href={iss.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                View Issue on GitHub <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ContributionMatchmakerModal({ languages = [], onClose }) {
  const recommendations = [
    {
      category: 'Developer Tooling & CLI Utilities',
      reason: 'Your code patterns show high utility module architecture. CLI tools value clear argument parsing and zero dependency footprint.',
      examples: 'esbuild plugins, linting rules, npm package utilities',
      impact: 'High visibility with recruiters and fellow engineers',
    },
    {
      category: 'Framework Ecosystem Plugins & UI Hooks',
      reason: 'Your frontend component distribution and state management skills map directly to reusable hook libraries.',
      examples: 'React hook collections, Tailwind plugins, accessible UI primitives',
      impact: 'Rapid community star adoption and high download counts',
    },
    {
      category: 'Automated Testing & Documentation DX',
      reason: 'Contributing missing test suites and reproducible example apps to flagship open-source libraries is the fastest path to maintainer trust.',
      examples: 'Adding Jest/Vitest coverage to core libraries, writing getting-started recipes',
      impact: 'Builds permanent public code review credibility',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
        <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
          <Compass className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-white text-sm">Open Source Contribution Matchmaker</h4>
          <p className="text-[11px] text-gray-400">Targeted open-source niches where your skill set delivers maximum impact</p>
        </div>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, i) => (
          <div key={i} className="p-3.5 rounded-xl bg-slate-950/70 border border-white/10 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-cyan-300 text-sm">#{i + 1} {rec.category}</h5>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200">
                RECOMMENDED
              </span>
            </div>
            <p className="text-gray-200 leading-relaxed">{rec.reason}</p>
            <div className="pt-1 flex items-center justify-between text-[11px] text-gray-400 border-t border-white/5">
              <span><b>Target Ecosystems:</b> {rec.examples}</span>
              <span className="text-emerald-400 font-medium">{rec.impact}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HackathonScoutModal({ onClose }) {
  const hackathons = [
    {
      name: 'Anna AI OS Global Hackathon',
      sponsor: 'Anna AI / Deep Learning Hub',
      prize: '$50,000 in Prizes',
      dates: 'Active Now · Nov 2026',
      theme: 'Autonomous AI Agents & Native Desktop OS Integrations',
      url: 'https://anna.partners',
    },
    {
      name: 'Global AI Web Agents Challenge',
      sponsor: 'Open Source AI Consortium',
      prize: '$25,000 + Cloud Grants',
      dates: 'Dec 1 – Dec 15, 2026',
      theme: 'LLM Function Calling & Multi-Agent Collaboration',
      url: 'https://github.com',
    },
    {
      name: 'Next-Gen Developer Experience Hack',
      sponsor: 'DevTool Collective',
      prize: '$15,000 Cash',
      dates: 'Jan 10 – Jan 20, 2027',
      theme: 'Local-First Dev Tools, Linters & Code Telemetry',
      url: 'https://github.com',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
          <Trophy className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-white text-sm">Global AI &amp; Developer Hackathon Scout</h4>
          <p className="text-[11px] text-gray-400">Curated high-signal competitive coding &amp; agent hackathons</p>
        </div>
      </div>

      <div className="space-y-3">
        {hackathons.map((h, i) => (
          <div key={i} className="p-3.5 rounded-xl bg-slate-950/70 border border-white/10 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-bold text-white text-sm">{h.name}</h5>
                <span className="text-[11px] text-gray-400">{h.sponsor}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-amber-400 font-mono block">{h.prize}</span>
                <span className="text-[10px] text-gray-400">{h.dates}</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-300"><b>Theme:</b> {h.theme}</p>
            <div className="flex justify-end pt-1">
              <a
                href={h.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                Register &amp; Learn More <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DeveloperMatchmakerModal({ username, score, languages = [], onClose }) {
  const peers = [
    {
      handle: 'alex-systems',
      avatar: 'https://avatars.githubusercontent.com/u/1024025?v=4',
      matchScore: '96% Match',
      focus: 'Distributed Systems & Go',
      synergy: 'Complementary: Pairs their backend scalability with your application UI architecture.',
    },
    {
      handle: 'elena-ai-dev',
      avatar: 'https://avatars.githubusercontent.com/u/2048050?v=4',
      matchScore: '92% Match',
      focus: 'LLM Tooling & Python',
      synergy: 'Shared Stack: Perfect for co-authoring autonomous AI extensions and hackathon entries.',
    },
    {
      handle: 'marcus-cloud',
      avatar: 'https://avatars.githubusercontent.com/u/3072075?v=4',
      matchScore: '89% Match',
      focus: 'Kubernetes & CI/CD Telemetry',
      synergy: 'DevOps Synergy: Automates cloud infrastructure for your open-source projects.',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
        <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-white text-sm">Developer Peer Matchmaker</h4>
          <p className="text-[11px] text-gray-400">Discover complementary GitHub engineers for open-source side projects</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {peers.map((p, i) => (
          <div key={i} className="p-3.5 rounded-xl bg-slate-950/70 border border-white/10 flex items-start gap-3 text-xs">
            <img
              src={p.avatar}
              alt={p.handle}
              onError={(e) => { e.currentTarget.src = 'https://github.com/github.png'; }}
              className="w-10 h-10 rounded-full border border-purple-400/50 object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white font-mono">@{p.handle}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                  {p.matchScore}
                </span>
              </div>
              <span className="text-[11px] text-indigo-300 block mb-1">{p.focus}</span>
              <p className="text-gray-300 text-[11px]">{p.synergy}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MentorMatcherModal({ username, score, topRepos = [], onClose, onToast }) {
  const [targetSpecialty, setTargetSpecialty] = useState('Staff Distributed Systems Engineer');
  const [copied, setCopied] = useState(false);
  const firstRepo = topRepos?.[0]?.name || 'flagship-project';

  const pitch = `Hi [Mentor Name],

I really admire your engineering writing and open-source leadership around ${targetSpecialty}.

I'm a software engineer building projects like ${firstRepo} (https://github.com/${username}/${firstRepo}), and I recently achieved an objective portfolio score of ${score}/100 on GitFolioScore.

I have a specific question regarding high-throughput architecture trade-offs that I'd love your 2-minute perspective on:
"[Insert 1 concise, specific technical question here]"

I deeply respect your time and would be grateful for any quick guidance.

Thank you,
@${username}
https://github.com/${username}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(pitch);
    setCopied(true);
    if (onToast) onToast('Mentorship outreach message copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
        <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
          <MessageCircle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-white text-sm">Senior Engineering Mentor Outreach Pitch</h4>
          <p className="text-[11px] text-gray-400">Respectful, high-conversion async cold message to Staff/Principal Engineers</p>
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-300 font-medium block mb-1">Target Mentor Specialty:</label>
        <input
          type="text"
          value={targetSpecialty}
          onChange={(e) => setTargetSpecialty(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-white/10 text-white text-xs"
        />
      </div>

      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10 max-h-56 overflow-y-auto">
        <pre className="text-xs text-gray-200 font-sans whitespace-pre-wrap leading-relaxed">
          {pitch}
        </pre>
      </div>

      <button
        type="button"
        onClick={handleCopy}
        className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
          copied ? 'bg-emerald-500 text-white' : 'bg-white/10 hover:bg-white/15 text-white'
        }`}
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        <span>{copied ? 'Copied Outreach Message!' : 'Copy Mentorship Message'}</span>
      </button>
    </div>
  );
}
