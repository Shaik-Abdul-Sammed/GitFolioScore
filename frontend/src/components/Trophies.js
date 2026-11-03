import React from 'react';
import { Trophy, Lock, Sparkles, CheckCircle } from 'lucide-react';

export default function Trophies({ data = {} }) {
  const score = data?.score ?? 0;
  const reposCount = data?.profile?.public_repos ?? data?.topRepos?.length ?? 0;
  const languagesCount = data?.mostUsedLanguages?.length ?? 0;
  const redFlagsCount = data?.redFlags?.length ?? 0;
  const totalStars = data?.topRepos?.reduce((acc, r) => acc + (r.stars || 0), 0) ?? 0;
  const docsScore = data?.scoreBreakdown?.docs ?? 0;

  const trophies = [
    {
      id: 'first_blood',
      title: 'First Blood',
      icon: '⚔️',
      description: 'Analyzed first public codebase repository',
      unlocked: reposCount > 0,
      xp: '+50 XP',
      tier: 'Common',
    },
    {
      id: 'centurion',
      title: 'Centurion',
      icon: '👑',
      description: 'Achieved an elite portfolio score over 80',
      unlocked: score >= 80,
      xp: '+200 XP',
      tier: 'Legendary',
    },
    {
      id: 'polyglot',
      title: 'Polyglot',
      icon: '🌐',
      description: 'Used 5+ distinct programming languages',
      unlocked: languagesCount >= 5,
      xp: '+100 XP',
      tier: 'Rare',
    },
    {
      id: 'dragon_slayer',
      title: 'Dragon Slayer',
      icon: '🐉',
      description: 'Zero critical red flags detected in portfolio',
      unlocked: redFlagsCount === 0,
      xp: '+150 XP',
      tier: 'Epic',
    },
    {
      id: 'star_lord',
      title: 'Star Lord',
      icon: '⭐',
      description: 'Accumulated 10+ GitHub community stars',
      unlocked: totalStars >= 10,
      xp: '+100 XP',
      tier: 'Rare',
    },
    {
      id: 'doc_paladin',
      title: 'Doc Paladin',
      icon: '📜',
      description: 'Scored 8/10 or higher on documentation standards',
      unlocked: docsScore >= 8,
      xp: '+75 XP',
      tier: 'Uncommon',
    },
  ];

  const unlockedCount = trophies.filter((t) => t.unlocked).length;

  return (
    <div className="premium-card p-6 animate-fade-in-up" data-testid="trophies-cabinet">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Trophy className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-gaming flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              RPG Achievements &amp; Trophies
            </h3>
            <p className="text-xs text-gray-400">Unlock developer badges by leveling up code quality</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-gaming font-bold text-amber-300">
            {unlockedCount} / {trophies.length} UNLOCKED
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {trophies.map((trophy) => (
          <div
            key={trophy.id}
            className={`relative p-4 rounded-xl border transition-all duration-300 ${
              trophy.unlocked
                ? 'bg-gradient-to-b from-white/10 to-white/5 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.12)]'
                : 'bg-black/20 border-white/5 opacity-60'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                  trophy.unlocked
                    ? 'bg-gradient-to-br from-amber-400/20 to-yellow-500/20 border border-amber-400/50 shadow-inner'
                    : 'bg-slate-800/80 border border-slate-700 text-gray-500'
                }`}
              >
                {trophy.unlocked ? trophy.icon : <Lock className="w-4 h-4 text-gray-500" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <h4
                    className={`text-sm font-bold truncate ${
                      trophy.unlocked ? 'text-white' : 'text-gray-400'
                    }`}
                  >
                    {trophy.title}
                  </h4>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${
                      trophy.unlocked
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-gray-500'
                    }`}
                  >
                    {trophy.xp}
                  </span>
                </div>

                <p className="text-xs text-gray-400 leading-snug line-clamp-2">
                  {trophy.description}
                </p>

                <div className="mt-2 flex items-center justify-between text-[10px]">
                  <span
                    className={`font-semibold uppercase tracking-wider ${
                      trophy.unlocked ? 'text-amber-400' : 'text-gray-600'
                    }`}
                  >
                    {trophy.tier}
                  </span>
                  {trophy.unlocked ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <CheckCircle className="w-3 h-3" /> Unlocked
                    </span>
                  ) : (
                    <span className="text-gray-500 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Locked
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
