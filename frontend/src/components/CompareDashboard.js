import React from 'react';
import { Trophy, Star, GitBranch, Users, X, ArrowUpRight, Award } from 'lucide-react';

function CompareDashboard({ user1, user2, onClose }) {
  if (!user1?.report || !user2?.report) return null;

  const r1 = user1.report;
  const r2 = user2.report;
  const u1Name = user1.username;
  const u2Name = user2.username;

  const u1Stars = r1.topRepos?.reduce((acc, curr) => acc + (curr.stars || 0), 0) || 0;
  const u2Stars = r2.topRepos?.reduce((acc, curr) => acc + (curr.stars || 0), 0) || 0;

  const u1Followers = r1.profile?.followers || 0;
  const u2Followers = r2.profile?.followers || 0;

  const u1Repos = r1.profile?.public_repos || r1.topRepos?.length || 0;
  const u2Repos = r2.profile?.public_repos || r2.topRepos?.length || 0;

  const winner =
    r1.score > r2.score ? u1Name : r2.score > r1.score ? u2Name : 'Tie';

  return (
    <div className="premium-card p-6 border-indigo-500/40 bg-gradient-to-b from-indigo-950/40 to-slate-900/60 shadow-2xl animate-fade-in-up">
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
        <div className="flex items-center gap-2.5">
          <Trophy className="w-6 h-6 text-amber-400" />
          <h3 className="text-xl font-bold tracking-tight text-white">
            Head-to-Head Developer Comparison
          </h3>
          <span className="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
            Winner: @{winner}
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
            aria-label="Close Comparison"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Side by side overview cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* User 1 */}
        <div
          className={`glass-card p-5 rounded-2xl relative ${
            winner === u1Name ? 'border-amber-400/50 ring-2 ring-amber-400/20' : ''
          }`}
        >
          {winner === u1Name && (
            <span className="absolute -top-3 right-4 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950 flex items-center gap-1 shadow">
              <Trophy className="w-3 h-3" /> Winner
            </span>
          )}
          <div className="flex items-center gap-4 mb-4">
            <img
              src={r1.profile?.avatar_url || 'https://github.com/ghost.png'}
              alt={u1Name}
              className="w-16 h-16 rounded-xl border-2 border-indigo-500/40 object-cover"
            />
            <div>
              <h4 className="text-lg font-bold text-white flex items-center gap-1.5">
                {r1.profile?.name || u1Name}
                <a
                  href={`https://github.com/${u1Name}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-400 hover:text-indigo-300"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </h4>
              <p className="text-xs text-indigo-300">@{u1Name}</p>
            </div>
            <div className="ml-auto text-right">
              <span className="text-3xl font-extrabold text-indigo-400">{r1.score}</span>
              <span className="text-xs text-gray-400 block">/ 100</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-white/5">
              <span className="text-gray-400 block text-[10px]">STARS</span>
              <b className="text-white text-sm">{u1Stars}</b>
            </div>
            <div className="p-2 rounded-lg bg-white/5">
              <span className="text-gray-400 block text-[10px]">REPOS</span>
              <b className="text-white text-sm">{u1Repos}</b>
            </div>
            <div className="p-2 rounded-lg bg-white/5">
              <span className="text-gray-400 block text-[10px]">FOLLOWERS</span>
              <b className="text-white text-sm">{u1Followers}</b>
            </div>
          </div>
        </div>

        {/* User 2 */}
        <div
          className={`glass-card p-5 rounded-2xl relative ${
            winner === u2Name ? 'border-amber-400/50 ring-2 ring-amber-400/20' : ''
          }`}
        >
          {winner === u2Name && (
            <span className="absolute -top-3 right-4 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950 flex items-center gap-1 shadow">
              <Trophy className="w-3 h-3" /> Winner
            </span>
          )}
          <div className="flex items-center gap-4 mb-4">
            <img
              src={r2.profile?.avatar_url || 'https://github.com/ghost.png'}
              alt={u2Name}
              className="w-16 h-16 rounded-xl border-2 border-purple-500/40 object-cover"
            />
            <div>
              <h4 className="text-lg font-bold text-white flex items-center gap-1.5">
                {r2.profile?.name || u2Name}
                <a
                  href={`https://github.com/${u2Name}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-400 hover:text-purple-300"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </h4>
              <p className="text-xs text-purple-300">@{u2Name}</p>
            </div>
            <div className="ml-auto text-right">
              <span className="text-3xl font-extrabold text-purple-400">{r2.score}</span>
              <span className="text-xs text-gray-400 block">/ 100</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-white/5">
              <span className="text-gray-400 block text-[10px]">STARS</span>
              <b className="text-white text-sm">{u2Stars}</b>
            </div>
            <div className="p-2 rounded-lg bg-white/5">
              <span className="text-gray-400 block text-[10px]">REPOS</span>
              <b className="text-white text-sm">{u2Repos}</b>
            </div>
            <div className="p-2 rounded-lg bg-white/5">
              <span className="text-gray-400 block text-[10px]">FOLLOWERS</span>
              <b className="text-white text-sm">{u2Followers}</b>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div className="rounded-xl border border-white/10 overflow-hidden text-xs">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-gray-300">
            <tr>
              <th className="p-3">Metric</th>
              <th className="p-3 text-center text-indigo-300">@{u1Name}</th>
              <th className="p-3 text-center text-purple-300">@{u2Name}</th>
              <th className="p-3 text-right">Advantage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-gray-200">
            <tr>
              <td className="p-3 font-medium flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-400" /> Overall Score
              </td>
              <td className="p-3 text-center font-bold">{r1.score}/100</td>
              <td className="p-3 text-center font-bold">{r2.score}/100</td>
              <td className="p-3 text-right font-semibold">
                {r1.score > r2.score ? `+${r1.score - r2.score} (@${u1Name})` : r2.score > r1.score ? `+${r2.score - r1.score} (@${u2Name})` : 'Tied'}
              </td>
            </tr>
            <tr>
              <td className="p-3 font-medium flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" /> Star Impact
              </td>
              <td className="p-3 text-center">{u1Stars}</td>
              <td className="p-3 text-center">{u2Stars}</td>
              <td className="p-3 text-right font-semibold">
                {u1Stars > u2Stars ? `@${u1Name}` : u2Stars > u1Stars ? `@${u2Name}` : 'Tied'}
              </td>
            </tr>
            <tr>
              <td className="p-3 font-medium flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-blue-400" /> Public Repos
              </td>
              <td className="p-3 text-center">{u1Repos}</td>
              <td className="p-3 text-center">{u2Repos}</td>
              <td className="p-3 text-right font-semibold">
                {u1Repos > u2Repos ? `@${u1Name}` : u2Repos > u1Repos ? `@${u2Name}` : 'Tied'}
              </td>
            </tr>
            <tr>
              <td className="p-3 font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" /> Community Reach
              </td>
              <td className="p-3 text-center">{u1Followers} followers</td>
              <td className="p-3 text-center">{u2Followers} followers</td>
              <td className="p-3 text-right font-semibold">
                {u1Followers > u2Followers ? `@${u1Name}` : u2Followers > u1Followers ? `@${u2Name}` : 'Tied'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CompareDashboard;
