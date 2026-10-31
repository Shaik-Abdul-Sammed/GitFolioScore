import React, { useState } from 'react';
import { Wrench, Copy, Check, X, GitPullRequest, AlertCircle, ExternalLink } from 'lucide-react';

function QuickFixModal({ redFlag, username, topRepos = [], onClose }) {
  const [tab, setTab] = useState('issue');
  const [copied, setCopied] = useState(false);

  const targetRepo = topRepos?.[0]?.name || 'my-repository';
  const repoUrl = username ? `https://github.com/${username}/${targetRepo}` : '#';

  const issueTemplate = `### 🐛 Portfolio Audit Issue: ${redFlag}

**Reported By**: GitFolioScore Recruiter AI Audit
**Target Repository**: \`${targetRepo}\`

#### Summary
During the automated portfolio review, the following critical red flag was identified:
> **${redFlag}**

#### Proposed Action Items
- [ ] Add comprehensive documentation addressing this issue.
- [ ] Verify badges, setup instructions, and contributing guides.
- [ ] Ensure repository topics and social preview cards are properly configured.

#### Why This Matters
Recruiters spend < 60 seconds reviewing a GitHub profile. Resolving this issue immediately increases portfolio ranking and ATS match score.
`;

  const prTemplate = `## Description of Changes
Resolves GitFolioScore audit recommendation: **${redFlag}**

### Changes Made
- Added missing documentation / license / setup instructions for \`${targetRepo}\`.
- Polished README formatting with clear architecture overview.
- Added verified technology stack tags.

### Checklist
- [x] Tested locally and confirmed clean build
- [x] Documentation follows standard markdown practices
- [x] Verified links and demo endpoints
`;

  const contentToCopy = tab === 'issue' ? issueTemplate : prTemplate;

  const handleCopy = () => {
    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-y-auto max-h-[85vh] pb-20 flex flex-col"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              Quick Fix · <span className="text-amber-400">{targetRepo}</span>
            </h4>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subhead with warning */}
        <div className="px-5 pt-4 pb-2">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span><b>Red Flag:</b> {redFlag}</span>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => setTab('issue')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition border ${
                tab === 'issue'
                  ? 'bg-indigo-500 text-white border-indigo-400 shadow'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              GitHub Issue Template
            </button>
            <button
              onClick={() => setTab('pr')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition border ${
                tab === 'pr'
                  ? 'bg-indigo-500 text-white border-indigo-400 shadow'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <GitPullRequest className="w-3.5 h-3.5" />
              PR Description Template
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-5 flex-1 overflow-y-auto">
          <pre
            className="p-3 rounded-xl text-xs font-mono whitespace-pre-wrap select-all max-h-56 overflow-y-auto border"
            style={{ background: 'rgba(0, 0, 0, 0.35)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            {contentToCopy}
          </pre>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t flex items-center justify-between gap-3" style={{ borderColor: 'var(--border)' }}>
          {username && (
            <a
              href={`${repoUrl}/issues/new`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              Open on GitHub <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <button
            onClick={handleCopy}
            className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition active:scale-95"
            style={{ background: 'var(--gradient-primary)' }}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied Template!' : 'Copy Template'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuickFixModal;
