import React, { useState } from 'react';
import { Skull, Archive, Check, Clock, AlertOctagon } from 'lucide-react';

function TechDebtGraveyard({ repos = [], username, onToast }) {
  const [copiedRepo, setCopiedRepo] = useState(null);

  const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
  const now = Date.now();

  const deadRepos = repos.filter((r) => {
    const lastUpdate = new Date(r.pushed_at || r.updated_at).getTime();
    const isOverOneYear = now - lastUpdate > ONE_YEAR_MS;
    const zeroStars = (r.stargazers_count || 0) === 0;
    return isOverOneYear && zeroStars;
  });

  const handleCopyArchiveCmd = (repoName) => {
    const cmd = `gh repo archive ${username}/${repoName} -y`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(cmd);
    }
    setCopiedRepo(repoName);
    if (onToast) {
      onToast(`Copied archive command: ${cmd}`, 'success');
    }
    setTimeout(() => setCopiedRepo(null), 2500);
  };

  if (!repos.length) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 shadow-[inset_0_0_15px_rgba(255,255,255,0.05)] backdrop-blur-xl p-6 transition-all hover:border-amber-500/30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Skull className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Tech Debt Graveyard 🪦
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {deadRepos.length} Ghost {deadRepos.length === 1 ? 'Repo' : 'Repos'}
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              Repositories abandoned for over 1 year with 0 stars that dilute your profile score.
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-xs text-gray-400 block">Quality Drag</span>
          <span className="text-sm font-bold text-rose-400">
            {deadRepos.length > 0 ? `-${deadRepos.length * 3.5} pts penalty` : 'Zero Debt 🎉'}
          </span>
        </div>
      </div>

      {deadRepos.length === 0 ? (
        <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
          <div className="text-emerald-400 text-sm font-bold">No Abandoned Tech Debt Found!</div>
          <p className="text-xs text-emerald-200/80">
            Every repository in this profile has recent commits or community stars. Your portfolio hygiene is immaculate.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {deadRepos.map((repo) => {
              const lastUpdated = new Date(repo.pushed_at || repo.updated_at);
              const daysInactive = Math.floor((now - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
              const yearsInactive = (daysInactive / 365).toFixed(1);

              return (
                <div
                  key={repo.name}
                  className="p-4 rounded-xl bg-slate-950/50 border border-white/10 hover:border-amber-500/40 transition space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                        <span>🪦</span>
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline text-indigo-300 truncate"
                        >
                          {repo.name}
                        </a>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">
                        {repo.description || 'No description provided'}
                      </p>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 flex-shrink-0">
                      0 ⭐
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-white/5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      Inactive {yearsInactive} yrs ({daysInactive}d ago)
                    </span>

                    <button
                      type="button"
                      onClick={() => handleCopyArchiveCmd(repo.name)}
                      className="flex items-center gap-1 text-[10px] font-semibold text-indigo-300 hover:text-white transition px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95"
                      title="Copy GitHub CLI archive command"
                    >
                      {copiedRepo === repo.name ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Archive className="w-3 h-3" />
                          <span>Copy CLI Archive</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2.5 text-xs text-amber-200">
            <AlertOctagon className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Recruiter recommendation:</strong> Archiving or making dead repos private will immediately raise your average repository quality score.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default TechDebtGraveyard;
