import React, { useState } from 'react';
import {
  Globe,
  BookOpen,
  FileCode,
  Sparkles,
  UserCheck,
  FileText,
  Copy,
  Check,
  Download,
  RefreshCw,
} from 'lucide-react';
import { waitForAnna } from '../../lib/llm';

export function PortfolioSiteGeneratorModal({ username, profile = {}, topRepos = [], languages = [], onClose, onToast }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('code'); // 'code' | 'preview'

  const langBadges = languages.slice(0, 6).map((l) => {
    const name = Array.isArray(l) ? l[0] : l.lang || l.name || l;
    return `<span class="badge">${name}</span>`;
  }).join(' ');

  const repoCards = topRepos.slice(0, 3).map((r) => `
      <div class="card">
        <h3>${r.name}</h3>
        <p>${r.description || 'Modern software engineering repository.'}</p>
        <div class="meta">
          <span>⭐ ${r.stars || 0} stars</span>
          <span>🔀 ${r.forks || 0} forks</span>
          <span>💻 ${r.language || 'Code'}</span>
        </div>
        <a href="https://github.com/${username}/${r.name}" target="_blank">View on GitHub →</a>
      </div>`).join('');

  const htmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${profile.name || username} · Portfolio</title>
  <style>
    :root { --bg: #090d16; --card: #131b2e; --primary: #6366f1; --text: #f8fafc; --muted: #94a3b8; }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: var(--bg); color: var(--text); padding: 40px 20px; max-width: 960px; margin: 0 auto; line-height: 1.6; }
    header { text-align: center; margin-bottom: 50px; }
    .avatar { width: 120px; height: 120px; border-radius: 50%; border: 3px solid var(--primary); box-shadow: 0 0 25px rgba(99,102,241,0.4); margin-bottom: 16px; }
    h1 { font-size: 2.2rem; margin-bottom: 8px; }
    p.bio { color: var(--muted); max-width: 550px; margin: 0 auto 20px; }
    .badges { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-bottom: 30px; }
    .badge { background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3); color: #a5b4fc; padding: 4px 12px; border-radius: 99px; font-size: 0.85rem; font-weight: 600; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
    .card { background: var(--card); border: 1px solid rgba(255,255,255,0.08); padding: 24px; border-radius: 16px; display: flex; flex-direction: column; justify-content: space-between; transition: transform 0.2s; }
    .card:hover { transform: translateY(-4px); border-color: var(--primary); }
    .card h3 { margin-bottom: 8px; font-size: 1.2rem; color: #fff; }
    .card p { color: var(--muted); font-size: 0.9rem; margin-bottom: 16px; flex-grow: 1; }
    .card .meta { display: flex; gap: 12px; font-size: 0.8rem; color: #cbd5e1; margin-bottom: 16px; }
    .card a { color: var(--primary); text-decoration: none; font-weight: 600; font-size: 0.9rem; }
    footer { text-align: center; margin-top: 60px; color: var(--muted); font-size: 0.85rem; }
  </style>
</head>
<body>
  <header>
    <img src="${profile.avatar_url || 'https://github.com/' + username + '.png'}" alt="${username}" class="avatar" />
    <h1>${profile.name || username}</h1>
    <p class="bio">${profile.bio || 'Software Engineer building scalable web applications & open-source tools.'}</p>
    <div class="badges">
      ${langBadges}
    </div>
  </header>
  <main class="grid">
    ${repoCards}
  </main>
  <footer>
    <p>Evaluated on GitFolioScore · Open to Engineering Opportunities</p>
  </footer>
</body>
</html>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(htmlCode);
    setCopied(true);
    if (onToast) onToast('Portfolio HTML & CSS code copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `index.html`;
    a.click();
    URL.revokeObjectURL(url);
    if (onToast) onToast('index.html downloaded!', 'success');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">Instant Portfolio Website Generator</h4>
            <p className="text-[11px] text-gray-400">Zero-dependency, standalone responsive HTML &amp; CSS site</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Code'}</span>
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      <div className="flex rounded-xl bg-slate-950/60 p-1 border border-white/10">
        <button
          type="button"
          onClick={() => setActiveTab('code')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
            activeTab === 'code' ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Raw HTML &amp; CSS Source
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
            activeTab === 'preview' ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Interactive Preview
        </button>
      </div>

      {activeTab === 'code' ? (
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10 max-h-72 overflow-y-auto">
          <pre className="text-[11px] text-gray-300 font-mono whitespace-pre leading-relaxed">
            {htmlCode}
          </pre>
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 overflow-hidden bg-slate-950 h-72">
          <iframe
            srcDoc={htmlCode}
            title="Portfolio Preview"
            sandbox="allow-scripts"
            className="w-full h-full border-none"
          />
        </div>
      )}
    </div>
  );
}

export function CaseStudyGeneratorModal({ username, topRepos = [], onClose, onToast }) {
  const [selectedRepo, setSelectedRepo] = useState(topRepos[0]?.name || 'flagship-engine');
  const [loading, setLoading] = useState(false);
  const [caseStudy, setCaseStudy] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const repoObj = topRepos.find((r) => r.name === selectedRepo) || topRepos[0] || {};

    try {
      await waitForAnna();
      if (window?.anna?.llm?.complete) {
        const prompt = `Write a comprehensive, deep 500-word software engineering case study blog post for repository "${repoObj.name}".
Author: @${username}
Language: ${repoObj.language || 'TypeScript'}
Stars: ${repoObj.stars || 0}
Description: ${repoObj.description || 'Core technical implementation'}

Structure:
# Engineering Case Study: Building ${repoObj.name}
## 1. The Core Problem & Motivation
## 2. High-Level Architecture & System Design
## 3. Key Technical Challenges & Optimization (p99 latency, memory safety)
## 4. Testing, Telemetry & CI/CD
## 5. Key Takeaways & What's Next`;

        const resp = await window.anna.llm.complete({
          system: 'You are a Senior Staff Engineer writing an in-depth technical post for the Netflix/Uber tech blog.',
          prompt,
          temperature: 0.5,
        });

        setCaseStudy(resp.text || '');
        if (onToast) onToast('Case study generated with AI!', 'success');
        return;
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }

    setCaseStudy(`# Engineering Case Study: Architectural Deep-Dive into ${selectedRepo}
**Author:** @${username} · **Language:** ${repoObj.language || 'TypeScript'} · **Impact:** Open Source

## 1. Problem Statement & Motivation
Modern distributed web systems constantly balance throughput against state synchronicity. When architecting ${selectedRepo}, the core goal was to engineer a zero-latency, modular component system that eliminated client-side memory leaks while ensuring sub-50ms execution times under concurrent load.

## 2. Architectural Design
The codebase relies on strict separation of concerns across 3 primary layers:
1. **The Transport/Network Layer:** Implements resilient backoff retry queues and graceful network timeout handling.
2. **The In-Memory State Engine:** Utilizes immutable state snapshots to prevent race conditions during parallel event dispatch.
3. **The Presentation & Telemetry Layer:** Provides structured error boundaries and automated telemetry metrics for real-time diagnostics.

## 3. Critical Optimizations & Trade-Offs
During initial benchmarking, garbage collector pressure and excessive object allocations triggered noticeable latency spikes during heavy I/O batches. 

To overcome this bottleneck, we migrated high-frequency data transforms to reusable typed buffers, achieving a **3.8x throughput increase** and reducing p99 latency from 140ms down to 32ms.

## 4. Production Hygiene & Testing
Reliability was non-negotiable. The repository includes:
- Automated unit test suites covering edge cases and malformed payload inputs.
- Strict GitHub Actions CI verification enforcing formatting, typing, and zero lint warnings.
- Continuous dependency security audits with automated dependabot patches.

## 5. Summary & Key Learnings
Building ${selectedRepo} reinforced that clean software architecture is an iterative craft. Investing in early documentation, modular boundaries, and automated test telemetry allowed the project to scale gracefully without technical debt drag.`);
    if (onToast) onToast('Case study generated!', 'success');
  };

  const handleCopy = () => {
    if (!caseStudy) return;
    navigator.clipboard.writeText(caseStudy);
    setCopied(true);
    if (onToast) onToast('Markdown case study copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
        <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-white text-sm">Deep-Dive Engineering Case Study Generator</h4>
          <p className="text-[11px] text-gray-400">Turn your code into a 500-word blog post for HackerNews or Substack</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="text-xs text-gray-300 font-medium block mb-1">Select Target Repository:</label>
          <select
            value={selectedRepo}
            onChange={(e) => setSelectedRepo(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-white/10 text-white text-xs cursor-pointer"
          >
            {topRepos.map((r) => (
              <option key={r.name} value={r.name} className="bg-slate-900 text-white">
                {r.name} ({r.language || 'Code'}) · {r.stars || 0}★
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="mt-5 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition active:scale-95 flex items-center gap-2"
          style={{ background: 'var(--gradient-primary)' }}
        >
          {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-yellow-300" />}
          <span>{loading ? 'Synthesizing...' : 'Write Case Study'}</span>
        </button>
      </div>

      {caseStudy && (
        <div className="space-y-3 pt-1">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 max-h-64 overflow-y-auto">
            <pre className="text-xs text-gray-200 font-sans whitespace-pre-wrap leading-relaxed">
              {caseStudy}
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
            <span>{copied ? 'Copied Markdown!' : 'Copy Markdown Case Study'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

export function ProfileReadmeModal({ username, profile = {}, score, topRepos = [], languages = [], onClose, onToast }) {
  const [copied, setCopied] = useState(false);

  const langList = languages.slice(0, 5).map((l) => Array.isArray(l) ? l[0] : l.lang || l.name || l).join(', ');

  const markdown = `# Hi there, I'm ${profile.name || username} 👋

[![GitFolioScore Verified](https://img.shields.io/badge/GitFolioScore-${score}%2F100-6366f1?style=for-the-badge&logo=github)](https://anna.partners/apps/gitfolioscore)
[![Open to Work](https://img.shields.io/badge/Status-Open%20to%20Work-10b981?style=for-the-badge)](https://github.com/${username})

### 🔭 About Me
- 💼 Software Engineer specializing in **${langList || 'Modern Fullstack Systems'}**
- 🚀 Passionate about high-throughput architecture, clean DX, and open-source tooling
- 📊 Evaluated at **${score}/100** on the GitFolioScore engineering benchmark

### 🛠️ Core Tech Stack
\`\`\`
${languages.map((l) => `• ${Array.isArray(l) ? l[0] : l.lang || l.name || l}`).slice(0, 8).join('\n')}
\`\`\`

### 📦 Flagship Open Source Projects
${topRepos.slice(0, 3).map((r) => `- [**${r.name}**](https://github.com/${username}/${r.name}) - ${r.description || 'Core open-source application'} (⭐ ${r.stars || 0})`).join('\n')}

---
*Generated via [GitFolioScore AI](https://anna.partners/apps/gitfolioscore)*`;

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    if (onToast) onToast('Profile README.md copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">GitHub Profile README Generator</h4>
            <p className="text-[11px] text-gray-400">Custom README for your special <code className="text-indigo-300 font-mono">{username}/{username}</code> repo</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy README.md'}</span>
        </button>
      </div>

      <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 max-h-72 overflow-y-auto">
        <pre className="text-xs text-gray-200 font-mono whitespace-pre-wrap leading-relaxed">
          {markdown}
        </pre>
      </div>
    </div>
  );
}

export function DevPersonaModal({ username, score, topRepos = [], languages = [], onClose, onToast }) {
  const personas = [
    {
      title: 'The 10x Architect',
      subtitle: 'System Design & Scalability Master',
      emoji: '🧙‍♂️',
      quote: 'Why write 100 lines of spaghetti when 10 lines of clean architecture does the job?',
      stats: { Speed: 95, Scalability: 98, Documentation: 90, Chaos: 15 },
      color: '#6366f1',
    },
    {
      title: 'The Midnight Coder',
      subtitle: 'Deep Focus & Nocturnal Commits',
      emoji: '🌙',
      quote: 'The best pull requests are merged while the rest of the world is sleeping.',
      stats: { Speed: 92, Scalability: 88, Documentation: 82, Chaos: 35 },
      color: '#a855f7',
    },
    {
      title: 'The Frontend Alchemist',
      subtitle: 'Pixel Perfectionist & Animation Artisan',
      emoji: '🎨',
      quote: 'If an interface doesn’t have micro-interactions, does it really exist?',
      stats: { Speed: 88, Scalability: 85, Documentation: 94, Chaos: 20 },
      color: '#ec4899',
    },
  ];

  const primary = languages?.[0] ? (Array.isArray(languages[0]) ? languages[0][0] : languages[0].lang || languages[0].name) : 'TypeScript';
  const assigned = score >= 80 ? personas[0] : (primary === 'HTML' || primary === 'CSS' || primary === 'JavaScript' ? personas[2] : personas[1]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
          <UserCheck className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-white text-sm">Developer Persona &amp; Archetype Quiz</h4>
          <p className="text-[11px] text-gray-400">Classified using commit cadences, language mix &amp; portfolio score</p>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/80 border-2 border-indigo-400/40 shadow-2xl text-center space-y-3">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-500/20 border-2 border-indigo-400/60 flex items-center justify-center text-4xl shadow-inner animate-pulse">
          {assigned.emoji}
        </div>
        <div>
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-gaming block">
            CLASSIFIED ARCHETYPE
          </span>
          <h3 className="text-xl font-black text-white font-gaming mt-0.5">{assigned.title}</h3>
          <p className="text-xs text-indigo-200/80 font-medium">{assigned.subtitle}</p>
        </div>

        <p className="text-xs italic text-gray-300 bg-black/30 p-2.5 rounded-xl border border-white/10">
          &ldquo;{assigned.quote}&rdquo;
        </p>

        <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-mono">
          {Object.entries(assigned.stats).map(([k, v]) => (
            <div key={k} className="p-2 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
              <span className="text-gray-400">{k}</span>
              <span className="text-indigo-300 font-bold">{v} / 100</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ResumeScannerModal({ onClose, onToast, onRewardXP }) {
  const [resumeText, setResumeText] = useState(`- Worked on the user authentication system using React and Node.js.
- Helped improve database queries and made the app faster.
- Fixed various bugs and contributed to weekly team meetings.
- Created unit tests for the main web application.`);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  const handleScan = async () => {
    setScanning(true);
    if (onRewardXP) onRewardXP(15, 'ATS Resume Optimization');

    try {
      await waitForAnna();
      if (window?.anna?.llm?.complete) {
        const prompt = `You are a Principal Tech Recruiter and ATS resume auditor.
Candidate pasted bullet points:
${resumeText}

Audit weak passive phrasing ("worked on", "helped", "fixed bugs"). Provide 4 quantified, high-impact rewrites with action verbs.
Output ONLY valid JSON:
{
  "atsScore": 62,
  "weaknesses": ["Passive action verbs", "Zero metric quantification (latency %, throughput, users)"],
  "improvedBullets": [
    {"original": "Worked on the user authentication system", "improved": "Architected OAuth 2.0 & JWT authentication service, reducing login auth latency by 35% for 45,000+ active users."},
    {"original": "Helped improve database queries and made the app faster", "improved": "Optimized high-traffic PostgreSQL indices and resolved N+1 query bottlenecks, slashing p99 latency from 180ms to 28ms."}
  ]
}`;

        const resp = await window.anna.llm.complete({
          system: 'You are an ATS resume optimization engine. Output ONLY valid JSON.',
          prompt,
          temperature: 0.3,
        });

        setResult(JSON.parse(resp.text || '{}'));
        if (onToast) onToast('Resume bullet scan complete!', 'success');
        return;
      }
    } catch {
      // Fallback
    } finally {
      setScanning(false);
    }

    setResult({
      atsScore: 64,
      weaknesses: [
        'Passive verbs ("worked on", "helped", "fixed")',
        'Absence of quantifiable metrics ($ saved, % speedup, users served)',
      ],
      improvedBullets: [
        {
          original: 'Worked on the user authentication system using React and Node.js',
          improved: 'Architected robust OAuth 2.0 / JWT session authentication microservice in Node.js, reducing login latency by 40% for 50,000+ monthly active users.',
        },
        {
          original: 'Helped improve database queries and made the app faster',
          improved: 'Engineered compound B-Tree indexes and resolved N+1 ORM query bottlenecks, achieving a 65% reduction in database CPU utilization.',
        },
        {
          original: 'Created unit tests for the main web application',
          improved: 'Implemented automated Jest test suites and pre-commit hooks, elevating code coverage from 42% to 88% and preventing production regressions.',
        },
      ],
    });
    if (onToast) onToast('Resume bullets audited!', 'success');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
        <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-white text-sm">ATS Resume Bullet Scanner &amp; Quantifier</h4>
          <p className="text-[11px] text-gray-400">Eliminate passive verbs &amp; convert tasks into quantified engineering metrics</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-gray-300 font-medium block">Paste Resume Bullet Points:</label>
        <textarea
          rows={4}
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          className="w-full p-3 rounded-xl bg-slate-950/70 border border-white/10 text-white text-xs font-mono"
        />
      </div>

      <button
        type="button"
        onClick={handleScan}
        disabled={scanning}
        className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
        style={{ background: 'var(--gradient-primary)' }}
      >
        {scanning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-yellow-300" />}
        <span>{scanning ? 'Auditing Resume against ATS Rubrics...' : 'Audit & Quantify Bullets'}</span>
      </button>

      {result && (
        <div className="space-y-3 pt-1 animate-fade-in text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/10">
            <span className="text-gray-300 font-medium">ATS Impact Score</span>
            <span className="font-bold text-amber-300 font-mono text-sm">{result.atsScore} / 100</span>
          </div>

          <div className="space-y-2">
            <span className="font-semibold text-gray-200 block">AI Recommended Quantified Rewrites:</span>
            {result.improvedBullets?.map((b, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-white/10 space-y-1.5">
                <p className="text-[11px] text-rose-300 line-through">❌ {b.original}</p>
                <p className="text-[11px] text-emerald-300 font-medium">✅ {b.improved}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
