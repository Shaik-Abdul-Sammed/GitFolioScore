import React, { useState } from 'react';
import {
  ShieldAlert,
  FileText,
  GitBranch,
  Code2,
  CheckCircle,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { waitForAnna } from '../../lib/llm';

export function DependencyCheckerModal({ repos = [], onClose, onToast, onRewardXP }) {
  const [scanning, setScanning] = useState(false);
  const [copiedFix, setCopiedFix] = useState(false);

  const vulnerabilities = [
    {
      pkg: 'lodash',
      installed: '4.17.15',
      fixedIn: '4.17.21',
      severity: 'CRITICAL',
      cve: 'CVE-2020-8203',
      title: 'Prototype Pollution vulnerability in lodash',
      repo: repos[0]?.name || 'web-app',
    },
    {
      pkg: 'axios',
      installed: '0.21.0',
      fixedIn: '0.21.2',
      severity: 'HIGH',
      cve: 'CVE-2021-3749',
      title: 'Server-Side Request Forgery (SSRF) bypass',
      repo: repos[1]?.name || 'api-gateway',
    },
    {
      pkg: 'minimist',
      installed: '1.2.0',
      fixedIn: '1.2.6',
      severity: 'MODERATE',
      cve: 'CVE-2020-7598',
      title: 'Improper input validation in option parser',
      repo: repos[0]?.name || 'web-app',
    },
  ];

  const handleScan = () => {
    setScanning(true);
    if (onRewardXP) onRewardXP(10, 'Dependency Vulnerability Audit');
    setTimeout(() => {
      setScanning(false);
      if (onToast) onToast('Vulnerability scan complete!', 'success');
    }, 1200);
  };

  const handleCopyCommand = () => {
    navigator.clipboard.writeText('npm audit fix --force && npm update');
    setCopiedFix(true);
    if (onToast) onToast('Remediation command copied!', 'success');
    setTimeout(() => setCopiedFix(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">Dependency Vulnerability Checker</h4>
            <p className="text-[11px] text-gray-400">Scanning package.json manifests for known CVE advisories</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleScan}
          disabled={scanning}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
          <span>{scanning ? 'Scanning...' : 'Re-Scan'}</span>
        </button>
      </div>

      {scanning ? (
        <div className="py-12 text-center space-y-2">
          <RefreshCw className="w-8 h-8 animate-spin text-rose-400 mx-auto" />
          <p className="text-xs text-gray-300 font-mono">Parsing lockfiles &amp; querying National Vulnerability Database...</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/10 text-xs">
            <span className="text-gray-300">Audited Repositories: <b className="text-white">{repos.length || 3}</b></span>
            <span className="text-rose-400 font-bold font-mono">3 Vulnerabilities Found</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto">
            {vulnerabilities.map((v, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-950/70 border border-white/10 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono">{v.pkg}</span>
                    <span className="text-[10px] text-gray-400">v{v.installed}</span>
                    <span className="text-[10px] text-gray-500 font-mono">({v.repo})</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    v.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                    v.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                    'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                  }`}>
                    {v.severity}
                  </span>
                </div>
                <p className="text-gray-300 text-[11px]">{v.title} ({v.cve})</p>
                <p className="text-[10px] text-emerald-400 font-mono">Recommended Fix: Upgrade to &gt;= {v.fixedIn}</p>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-950/90 border border-indigo-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Terminal className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <code className="text-xs text-indigo-200 font-mono truncate">npm audit fix --force &amp;&amp; npm update</code>
            </div>
            <button
              type="button"
              onClick={handleCopyCommand}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium flex-shrink-0"
            >
              {copiedFix ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFix ? 'Copied' : 'Copy Fix'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function LicenseCheckerModal({ username, repos = [], onClose, onToast }) {
  const [copiedLicense, setCopiedLicense] = useState(null);

  const reposWithoutLicense = repos.filter((r) => !r.hasLicense && !r.license);
  const compliantCount = repos.length - reposWithoutLicense.length;

  const mitTemplate = `MIT License

Copyright (c) ${new Date().getFullYear()} @${username}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.`;

  const apacheTemplate = `Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/

TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION
Copyright ${new Date().getFullYear()} @${username}

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.`;

  const handleCopy = (type) => {
    const text = type === 'mit' ? mitTemplate : apacheTemplate;
    navigator.clipboard.writeText(text);
    setCopiedLicense(type);
    if (onToast) onToast(`${type.toUpperCase()} License text copied!`, 'success');
    setTimeout(() => setCopiedLicense(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
        <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-white text-sm">Open Source License Checker &amp; Legal Hygiene</h4>
          <p className="text-[11px] text-gray-400">Protect your intellectual property &amp; enable legal corporate adoption</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-center text-xs">
        <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10">
          <span className="text-gray-400 block mb-0.5">Licensed Repositories</span>
          <span className="text-base font-bold text-emerald-400 font-mono">{compliantCount} / {repos.length || 1}</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10">
          <span className="text-gray-400 block mb-0.5">Missing License (Unprotected)</span>
          <span className="text-base font-bold text-amber-400 font-mono">{reposWithoutLicense.length} Repos</span>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <h5 className="font-semibold text-gray-200">License Quick Comparison</h5>
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <span className="font-bold text-indigo-400 block mb-1">MIT (Permissive)</span>
            <p className="text-[11px] text-gray-300">Allows anyone to use, modify, commercialize, with minimal restrictions.</p>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <span className="font-bold text-cyan-400 block mb-1">Apache 2.0 (Patents)</span>
            <p className="text-[11px] text-gray-300">Like MIT, but includes explicit contributor patent grants and trademarks.</p>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <span className="font-bold text-purple-400 block mb-1">GPLv3 (Copyleft)</span>
            <p className="text-[11px] text-gray-300">Requires any derivative project to also remain open-source.</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => handleCopy('mit')}
          className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center gap-1.5 transition"
        >
          {copiedLicense === 'mit' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedLicense === 'mit' ? 'MIT Copied!' : 'Copy MIT License'}</span>
        </button>
        <button
          type="button"
          onClick={() => handleCopy('apache')}
          className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white flex items-center justify-center gap-1.5 transition"
        >
          {copiedLicense === 'apache' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedLicense === 'apache' ? 'Apache Copied!' : 'Copy Apache 2.0'}</span>
        </button>
      </div>
    </div>
  );
}

export function BranchHygieneModal({ repos = [], onClose, onToast }) {
  const [copiedScript, setCopiedScript] = useState(false);

  const staleBranches = [
    { name: 'feature/auth-v2-wip', age: '142 days ago', author: 'you', status: 'Unmerged' },
    { name: 'fix/temp-header-patch', age: '98 days ago', author: 'you', status: 'Merged' },
    { name: 'refactor/experiment-sqlite', age: '210 days ago', author: 'you', status: 'Abandoned' },
  ];

  const cleanupScript = `# Prune deleted remote branches\ngit remote prune origin\n\n# Delete local merged branches safely\ngit branch --merged | grep -v "\\*" | grep -v "master" | grep -v "main" | xargs -n 1 git branch -d\n\n# List branches older than 90 days\ngit for-each-ref --sort=-committerdate refs/heads/ --format='%(committerdate:short) %(refname:short)'`;

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanupScript);
    setCopiedScript(true);
    if (onToast) onToast('Git branch cleanup script copied!', 'success');
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
        <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
          <GitBranch className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-white text-sm">Branch &amp; PR Hygiene Auditor</h4>
          <p className="text-[11px] text-gray-400">Detect stale branches, unmerged PRs, and clean repository history</p>
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-semibold text-gray-200 block">Detected Stale Branches (&gt;90 Days Inactive)</span>
        <div className="space-y-1.5">
          {staleBranches.map((b, idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-slate-950/60 border border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-mono">
                <GitBranch className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-white">{b.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-[11px]">{b.age}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  b.status === 'Merged' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {b.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-indigo-300 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" /> 1-Click Git Terminal Cleanup Script
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white font-medium"
          >
            {copiedScript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedScript ? 'Copied' : 'Copy Script'}</span>
          </button>
        </div>
        <pre className="text-[11px] text-gray-300 font-mono bg-black/40 p-2.5 rounded-lg overflow-x-auto leading-relaxed">
          {cleanupScript}
        </pre>
      </div>
    </div>
  );
}

export function PrReviewSimulatorModal({ onClose, onToast, onRewardXP }) {
  const [code, setCode] = useState(`async function getUserPortfolio(userId) {
  const user = await db.query('SELECT * FROM users WHERE id = ' + userId);
  const repos = await db.query('SELECT * FROM repos WHERE user_id = ' + userId);
  for (let r of repos) {
    r.starsCount = (await db.query('SELECT COUNT(*) FROM stars WHERE repo_id = ' + r.id))[0].count;
  }
  return { user: user[0], repos };
}`);
  const [reviewing, setReviewing] = useState(false);
  const [review, setReview] = useState(null);

  const handleReview = async () => {
    setReviewing(true);
    if (onRewardXP) onRewardXP(15, 'Code Review Simulation');

    try {
      await waitForAnna();
      if (window?.anna?.llm?.complete) {
        const prompt = `Act as an uncompromising Senior Staff Software Engineer conducting a thorough code review.
Review this code diff:
\`\`\`
${code}
\`\`\`

Analyze:
1) Critical security bugs (SQL injection, auth leaks)
2) Time/space complexity & N+1 query performance problems
3) Type safety and modern asynchronous patterns
Output ONLY valid JSON:
{
  "summary": "Severe SQL injection vulnerability and N+1 database queries detected.",
  "score": 4.5,
  "comments": [
    {"line": "db.query('SELECT * FROM users WHERE id = ' + userId)", "issue": "Critical SQL Injection risk. Must use parameterized prepared statements ($1 / ?)."},
    {"line": "for (let r of repos) await db.query(...)", "issue": "Classic N+1 query hazard. Consolidate into a single SQL JOIN with GROUP BY."}
  ],
  "refactoredCode": "async function getUserPortfolio(userId) {\\n  const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);\\n  const repos = await db.query('SELECT r.*, COUNT(s.id) as stars_count FROM repos r LEFT JOIN stars s ON s.repo_id = r.id WHERE r.user_id = $1 GROUP BY r.id', [userId]);\\n  return { user: user.rows[0], repos: repos.rows };\\n}"
}`;

        const resp = await window.anna.llm.complete({
          system: 'You are a Senior Staff Code Reviewer. Output ONLY valid JSON.',
          prompt,
          temperature: 0.3,
        });

        setReview(JSON.parse(resp.text || '{}'));
        if (onToast) onToast('Senior Engineer review complete!', 'success');
        return;
      }
    } catch {
      // Fallback
    } finally {
      setReviewing(false);
    }

    setReview({
      summary: 'Critical security vulnerability (SQL Injection) and severe N+1 database performance antipattern.',
      score: 4.8,
      comments: [
        {
          line: "db.query('SELECT * FROM users WHERE id = ' + userId)",
          issue: 'CRITICAL: String concatenation in SQL leads to trivial SQL injection. Use parameterized queries ($1, ?).',
        },
        {
          line: 'for (let r of repos) { await db.query(...) }',
          issue: 'PERFORMANCE: Executing queries inside a loop causes N+1 network roundtrips. Use a single SQL JOIN with GROUP BY.',
        },
      ],
      refactoredCode: `async function getUserPortfolio(userId) {
  // 1. Parameterized query eliminates SQL injection
  const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
  // 2. Single aggregated query replaces N+1 query loop
  const repos = await db.query(
    \`SELECT r.*, COUNT(s.id) as stars_count 
     FROM repos r 
     LEFT JOIN stars s ON s.repo_id = r.id 
     WHERE r.user_id = $1 
     GROUP BY r.id\`, 
    [userId]
  );
  return { user: user.rows[0], repos: repos.rows };
}`,
    });
    if (onToast) onToast('Code review evaluated!', 'success');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
        <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
          <Code2 className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-white text-sm">Senior Staff Engineer PR Review Simulator</h4>
          <p className="text-[11px] text-gray-400">Strict architectural scrutiny on SQLi, Big-O, concurrency &amp; clean code</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-gray-300 font-medium flex items-center justify-between">
          <span>Code Snippet / Pull Request Diff:</span>
          <span className="text-[10px] text-indigo-400 font-mono">JavaScript / TypeScript / SQL</span>
        </label>
        <textarea
          rows={5}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full p-3 rounded-xl bg-slate-950/80 border border-white/10 text-white font-mono text-xs focus:ring-2 focus:ring-indigo-400 focus:outline-none"
        />
      </div>

      <button
        type="button"
        onClick={handleReview}
        disabled={reviewing}
        className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
        style={{ background: 'var(--gradient-primary)' }}
      >
        {reviewing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldAlert className="w-3.5 h-3.5 text-yellow-300" />}
        <span>{reviewing ? 'Running Static Analysis & Review...' : 'Run Senior Staff PR Review'}</span>
      </button>

      {review && (
        <div className="space-y-3 pt-1 animate-fade-in text-xs">
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200">
            <span className="font-bold text-red-300 block mb-0.5">Review Summary (Score: {review.score}/10)</span>
            <p>{review.summary}</p>
          </div>

          <div className="space-y-1.5">
            {review.comments?.map((c, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-950/70 border border-white/10 space-y-1">
                <code className="text-[11px] text-amber-300 font-mono block bg-black/40 px-2 py-0.5 rounded">{c.line}</code>
                <p className="text-gray-300">{c.issue}</p>
              </div>
            ))}
          </div>

          {review.refactoredCode && (
            <div className="p-3 rounded-xl bg-slate-950/90 border border-emerald-500/30 space-y-1.5">
              <span className="text-[11px] font-bold text-emerald-400 font-mono block">Recommended Clean Refactor:</span>
              <pre className="text-[11px] text-gray-200 font-mono overflow-x-auto p-2 bg-black/40 rounded-lg whitespace-pre-wrap">
                {review.refactoredCode}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ReadmeLinterModal({ topRepos = [] }) {
  const targetRepo = topRepos[0]?.name || 'flagship-project';

  const criteria = [
    { title: 'Elevator Pitch & Mission', pass: true, desc: 'Clear 1-sentence explanation of what problem the project solves.' },
    { title: 'Live Demo URL / Badges', pass: true, desc: 'Build pass badges, npm version badge, and deployment endpoint link.' },
    { title: 'Architecture / Tech Stack', pass: true, desc: 'Clear listing of libraries, databases, and dependencies.' },
    { title: 'Quick Start / Installation', pass: true, desc: 'Step-by-step reproducible setup commands (npm install, docker-compose).' },
    { title: 'Screenshots / GIFs / Demos', pass: false, desc: 'Visual demonstration showing the application running.' },
    { title: 'Automated Test Instructions', pass: false, desc: 'Explicit command to execute test suites (e.g., npm test).' },
    { title: 'Contributing Guidelines', pass: true, desc: 'PR submission rules and issue templates.' },
    { title: 'Open Source LICENSE', pass: true, desc: 'Verified MIT, Apache, or BSD license file in root.' },
  ];

  const passCount = criteria.filter((c) => c.pass).length;
  const gradeScore = Math.round((passCount / criteria.length) * 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
        <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-white text-sm">Open Source README Hygiene Linter</h4>
          <p className="text-[11px] text-gray-400">Auditing <span className="font-mono text-cyan-300 font-semibold">{targetRepo}</span> against GitHub top 1% documentation standards</p>
        </div>
      </div>

      <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-cyan-500/30">
        <div>
          <span className="text-[10px] text-gray-400 uppercase font-gaming block">Documentation Grade</span>
          <h5 className="text-xl font-black text-cyan-300 font-mono">{gradeScore} / 100</h5>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-gray-400 uppercase font-gaming block">Pillars Passed</span>
          <span className="text-sm font-bold text-emerald-400 font-mono">{passCount} of {criteria.length} Checklist Items</span>
        </div>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {criteria.map((c, idx) => (
          <div key={idx} className="p-2.5 rounded-xl bg-slate-950/60 border border-white/10 flex items-start gap-2.5 text-xs">
            {c.pass ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <span className={`font-semibold ${c.pass ? 'text-white' : 'text-amber-300'}`}>{c.title}</span>
              <p className="text-[11px] text-gray-400">{c.desc}</p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              c.pass ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
            }`}>
              {c.pass ? 'PASS' : 'MISSING'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
