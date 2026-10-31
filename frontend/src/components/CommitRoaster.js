import React, { useState } from 'react';
import { Flame, RefreshCw, GitCommit, AlertTriangle, CheckCircle } from 'lucide-react';

function CommitRoaster({ username, repos = [] }) {
  const [loading, setLoading] = useState(false);
  const [roast, setRoast] = useState(null);
  const [error, setError] = useState('');

  const fetchAndRoast = async () => {
    if (!username) return;
    setLoading(true);
    setError('');
    setRoast(null);

    let foundCommits = [];
    try {
      // 1. Try public events API first
      const res = await fetch(`https://api.github.com/users/${username}/events`, {
        headers: { Accept: 'application/vnd.github.v3+json' },
      });
      if (res.ok) {
        const events = await res.json();
        const pushEvents = (events || []).filter((e) => e.type === 'PushEvent');
        for (const ev of pushEvents) {
          if (ev.payload?.commits) {
            foundCommits.push(...ev.payload.commits.map((c) => c.message));
          }
        }
      }

      // 2. Fallback to top repo commits if needed
      if (foundCommits.length === 0 && repos.length > 0) {
        const topRepo = repos[0]?.name;
        if (topRepo) {
          const repoRes = await fetch(`https://api.github.com/repos/${username}/${topRepo}/commits?per_page=10`, {
            headers: { Accept: 'application/vnd.github.v3+json' },
          });
          if (repoRes.ok) {
            const repoData = await repoRes.json();
            foundCommits = (repoData || []).map((c) => c.commit?.message).filter(Boolean);
          }
        }
      }
    } catch {
      // Ignore network errors and use defaults
    }

    // Default sample messages if API is empty or rate-limited
    if (foundCommits.length === 0) {
      foundCommits = [
        'fixed bug',
        'update',
        'wip',
        'why is this not working',
        'fix typo in readme',
        'finally works',
        'asdf',
      ];
    }


    // 3. Call LLM for roast
    try {
      const prompt = `You are a savage, witty Staff Engineer doing a code review.
Roast these commit messages from GitHub user @${username}:
${foundCommits.slice(0, 8).map((m, i) => `${i + 1}. "${m}"`).join('\n')}

Produce a humorous and insightful JSON response in this exact format:
{
  "hygieneScore": 42,
  "headline": "Git Commit Catastrophe",
  "roastComment": "Your commit history looks like a cry for help. 'fixed bug' is not documentation.",
  "worstOffenders": [
    {"commit": "fixed bug", "critique": "Which of the 4,000 bugs did you fix?"},
    {"commit": "wip", "critique": "Work in progress? More like why in production."}
  ],
  "improvedSuggestion": "feat(auth): add OAuth2 refresh token rotation"
}`;

      let roastData = null;
      if (window?.anna?.llm?.complete) {
        const resp = await window.anna.llm.complete(
          {
            system: 'You are a witty, senior tech lead roaster. Output ONLY valid raw JSON with keys: hygieneScore, headline, roastComment, worstOffenders, improvedSuggestion.',
            prompt,
            temperature: 0.7,
          },
          { timeoutMs: 45000 }
        );

        const raw = resp?.text || '';
        const match = raw.match(/\{[\s\S]*\}/);
        if (match) {
          roastData = JSON.parse(match[0]);
        }
      }

      if (!roastData) {
        // Fallback roast heuristic
        roastData = {
          hygieneScore: Math.max(30, Math.floor(Math.random() * 45) + 30),
          headline: 'Git Commit Disaster Zone 🚨',
          roastComment: `Your commits read like a stream of consciousness at 3 AM. Writing 'fixed bug' 12 times gives recruiters existential dread.`,
          worstOffenders: [
            { commit: foundCommits[0] || 'fixed bug', critique: 'Zero context. Git blame will lead straight to regret.' },
            { commit: foundCommits[1] || 'update', critique: 'Vague enough to qualify as modern abstract art.' },
          ],
          improvedSuggestion: 'fix(core): resolve null pointer exception in user session parser',
        };
      }

      setRoast(roastData);
    } catch (err) {
      setError('Could not generate roast right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 shadow-[inset_0_0_15px_rgba(255,255,255,0.05)] backdrop-blur-xl p-6 transition-all hover:border-rose-500/30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              AI Commit Message Roaster
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                AI Powered
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              Audit recent commits from your Git log and see how a Staff Engineer judges your Git hygiene.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchAndRoast}
          disabled={loading || !username}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition active:scale-95 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Flame className="w-4 h-4 fill-white" />
          )}
          <span>{loading ? 'Roasting Commits...' : 'Roast My Commits 🔥'}</span>
        </button>
      </div>

      {error && (
        <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {!roast && !loading && (
        <div className="text-center py-8 text-gray-400 text-xs">
          <GitCommit className="w-8 h-8 mx-auto mb-2 opacity-40 text-rose-400" />
          Click above to fetch recent Git commits for <span className="text-white font-mono font-semibold">@{username}</span> and unleash the AI roaster.
        </div>
      )}

      {loading && (
        <div className="py-8 text-center space-y-3">
          <RefreshCw className="w-7 h-7 mx-auto animate-spin text-rose-400" />
          <p className="text-xs text-gray-300 font-medium animate-pulse">
            Inspecting commit history & consulting senior engineer...
          </p>
        </div>
      )}

      {roast && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                Staff Engineer Verdict
              </div>
              <div className="text-lg font-extrabold text-white mt-0.5">
                {roast.headline}
              </div>
              <p className="text-xs text-rose-200/90 mt-1 italic">
                &ldquo;{roast.roastComment}&rdquo;
              </p>
            </div>
            <div className="text-center sm:text-right flex-shrink-0">
              <div className="text-[10px] text-gray-400 uppercase font-bold">Commit Hygiene</div>
              <div className="text-3xl font-black text-rose-400">
                {roast.hygieneScore}<span className="text-sm font-normal text-gray-500">/100</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Worst Commit Message Offenders
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(roast.worstOffenders || []).map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                  <div className="font-mono text-rose-300 font-semibold mb-1 truncate">
                    git commit -m &quot;{item.commit}&quot;
                  </div>
                  <div className="text-gray-400 text-[11px]">{item.critique}</div>
                </div>
              ))}
            </div>
          </div>

          {roast.improvedSuggestion && (
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <span className="font-bold text-emerald-300">Pro Tip for Conventional Commits:</span>{' '}
                <span className="font-mono text-gray-200">{roast.improvedSuggestion}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CommitRoaster;
