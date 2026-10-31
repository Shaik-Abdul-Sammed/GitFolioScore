import React, { useState } from 'react';
import { GitPullRequest, ExternalLink, Copy, Check, FileText } from 'lucide-react';

function generateReadmeContent(repo, username) {
  const repoName = repo?.name || 'project';
  const desc = repo?.description || 'A modern full-stack web application with high performance and clean architecture.';
  const lang = repo?.language || 'JavaScript';

  return `# ${repoName}

> ${desc}

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitFolioScore](https://img.shields.io/badge/GitFolioScore-Verified-6366f1.svg)](https://anna.partners/apps/gitfolioscore)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://makeapullrequest.com)

## ⚡ Overview
${desc} Built with ${lang} focusing on developer ergonomics, test coverage, and modular code design.

## ✨ Key Features
- **Modern Architecture**: Clean separation of concerns with reusable modules.
- **Fast Performance**: Optimized for rapid execution and low memory footprint.
- **Type Safety & Reliability**: Built following strict industry coding guidelines.
- **Production Ready**: Fully automated CI/CD pipeline and container support.

## 🚀 Quick Start

\`\`\`bash
# 1. Clone the repository
git clone https://github.com/${username}/${repoName}.git

# 2. Enter project directory
cd ${repoName}

# 3. Install dependencies
npm install

# 4. Start local development server
npm run dev
\`\`\`

## 🛠️ Tech Stack
- **Primary Language**: ${lang}
- **Tooling**: Git, GitHub Actions, ESLint
- **Testing**: Jest / Playwright

## 📄 License
Distributed under the MIT License. See \`LICENSE\` for more information.

---
*Generated via [GitFolioScore](https://anna.partners/apps/gitfolioscore) AI Portfolio Suite.*
`;
}

function FakePRGenerator({ username, repos = [], onToast }) {
  const [selectedRepoName, setSelectedRepoName] = useState(repos[0]?.name || '');
  const [copied, setCopied] = useState(false);

  if (!repos.length) return null;

  const selectedRepo = repos.find((r) => r.name === selectedRepoName) || repos[0];
  const readmeContent = generateReadmeContent(selectedRepo, username);

  // GitHub URL to create new README.md with pre-filled content
  const branch = selectedRepo?.default_branch || 'main';
  const prUrl = `https://github.com/${username}/${selectedRepo?.name}/new/${branch}?filename=README.md&value=${encodeURIComponent(
    readmeContent
  )}`;

  const handleCopy = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(readmeContent);
    }
    setCopied(true);
    if (onToast) {
      onToast(`Copied README markdown for ${selectedRepo?.name}!`, 'success');
    }
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 shadow-[inset_0_0_15px_rgba(255,255,255,0.05)] backdrop-blur-xl p-6 transition-all hover:border-emerald-500/30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <GitPullRequest className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              {'Instant "1-Click PR" README Generator'}
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                1-Click GitHub
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              Instantly open GitHub with a pre-filled, production-ready README pull request.
            </p>
          </div>
        </div>

        {/* Repo selector */}
        <div className="flex items-center gap-2">
          <select
            value={selectedRepoName}
            onChange={(e) => setSelectedRepoName(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 border border-white/15 focus:ring-2 focus:ring-emerald-400 cursor-pointer max-w-[200px] truncate"
          >
            {repos.map((r) => (
              <option key={r.name} value={r.name}>
                {r.name} ({r.language || 'Code'})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {/* Preview box */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400 pb-2 border-b border-white/5">
            <span className="font-mono text-indigo-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> {selectedRepo?.name} / README.md
            </span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Score Boost: +8.5 pts
            </span>
          </div>
          <pre className="text-[11px] font-mono text-gray-300 max-h-48 overflow-y-auto whitespace-pre-wrap p-2 bg-black/40 rounded-lg">
            {readmeContent}
          </pre>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <a
            href={prUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-white shadow-xl transition active:scale-95"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          >
            <GitPullRequest className="w-4 h-4" />
            <span>Open Pre-filled Pull Request on GitHub</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition active:scale-95"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Markdown' : 'Copy Raw Markdown'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default FakePRGenerator;
