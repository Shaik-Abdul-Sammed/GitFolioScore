import React, { useState } from 'react';
import { Download, Briefcase } from 'lucide-react';

function OpenToWorkBanner({ username = 'developer', score = 88, profile = {}, repos = [], onToast }) {
  const [downloading, setDownloading] = useState(false);

  const topLanguages = Array.from(
    new Set(repos.map((r) => r.language).filter(Boolean))
  ).slice(0, 4);

  const languagesText = topLanguages.length ? topLanguages.join('  •  ') : 'React  •  TypeScript  •  Node.js  •  Python';
  const roleTitle = profile.bio ? profile.bio.slice(0, 45) : 'Senior Full-Stack Software Engineer';

  const generateAndDownloadPNG = () => {
    setDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1584;
      canvas.height = 396;
      const ctx = canvas.getContext('2d');

      // 1. Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 1584, 396);
      bgGrad.addColorStop(0, '#090d16');
      bgGrad.addColorStop(0.5, '#0f172a');
      bgGrad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1584, 396);

      // 2. Subtle cyber grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < 1584; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 396);
        ctx.stroke();
      }
      for (let y = 0; y < 396; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1584, y);
        ctx.stroke();
      }

      // 3. Glowing orb in top right
      const radialGrad = ctx.createRadialGradient(1300, 120, 10, 1300, 120, 300);
      radialGrad.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
      radialGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
      ctx.fillStyle = radialGrad;
      ctx.fillRect(1000, 0, 584, 396);

      // 4. "Open to Work" Pill Badge
      ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(80, 55, 210, 42, 21);
      ctx.fill();
      ctx.stroke();

      // Pulsing green dot
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(104, 76, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
      ctx.fillText('OPEN TO WORK', 124, 82);

      // 5. Name / Handle
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
      ctx.fillText(profile.name || `@${username}`, 80, 160);

      // 6. Subtitle / Bio
      ctx.fillStyle = '#94a3b8';
      ctx.font = '22px system-ui, -apple-system, sans-serif';
      ctx.fillText(roleTitle, 80, 205);

      // 7. Tech Stack Chips
      ctx.fillStyle = '#818cf8';
      ctx.font = 'bold 18px monospace, system-ui';
      ctx.fillText(languagesText, 80, 255);

      // 8. Verified URL footer
      ctx.fillStyle = '#64748b';
      ctx.font = '16px monospace';
      ctx.fillText(`github.com/${username}  •  anna.partners/apps/gitfolioscore`, 80, 330);

      // 9. Score Card Badge on Right
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(1180, 60, 320, 276, 24);
      ctx.fill();
      ctx.stroke();

      // GitFolioScore Header
      ctx.fillStyle = '#818cf8';
      ctx.font = 'bold 14px system-ui';
      ctx.fillText('⚡ GITFOLIOSCORE VERIFIED', 1215, 110);

      // Large Score
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 84px system-ui';
      ctx.fillText(`${score}`, 1215, 200);

      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 28px system-ui';
      ctx.fillText('/100', 1335, 175);

      // Tier label
      ctx.fillStyle = '#a5b4fc';
      ctx.font = 'bold 17px system-ui';
      const tierText = score >= 80 ? 'Senior Staff Level' : score >= 60 ? 'Competent Builder' : 'Rising Engineer';
      ctx.fillText(tierText, 1215, 240);

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 14px system-ui';
      ctx.fillText('Top 15% Verified Portfolio', 1215, 275);

      // Download triggered
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `gitfolioscore-linkedin-banner-${username}.png`;
      a.click();

      if (onToast) {
        onToast('LinkedIn banner downloaded (1584x396 px)!', 'success');
      }
    } catch {
      if (onToast) {
        onToast('Failed to generate banner image.', 'error');
      }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 shadow-[inset_0_0_15px_rgba(255,255,255,0.05)] backdrop-blur-xl p-6 transition-all hover:border-indigo-500/30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              {'"Open to Work" LinkedIn Banner Generator'}
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                1584 x 396 px
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              Generate a high-resolution, custom-designed LinkedIn background banner verified with your score.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={generateAndDownloadPNG}
          disabled={downloading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-xl transition active:scale-95 disabled:opacity-50"
          style={{ background: 'var(--gradient-primary)' }}
        >
          <Download className="w-4 h-4" />
          <span>{downloading ? 'Rendering PNG...' : 'Download Banner PNG'}</span>
        </button>
      </div>

      {/* Live Responsive Visual Preview */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
          LinkedIn Banner Preview (1584 x 396 Aspect Ratio)
        </div>

        <div className="relative w-full rounded-2xl overflow-hidden border border-white/15 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              OPEN TO WORK
            </div>

            <div>
              <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {profile.name || `@${username}`}
              </h4>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                {roleTitle}
              </p>
            </div>

            <div className="text-xs font-mono font-semibold text-indigo-300">
              {languagesText}
            </div>

            <div className="text-[11px] font-mono text-gray-500 pt-1">
              github.com/{username} • anna.partners/apps/gitfolioscore
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col justify-center min-w-[200px] text-center md:text-right">
            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
              ⚡ GitFolioScore Verified
            </div>
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 mt-1">
              {score}<span className="text-sm font-normal text-gray-400"> / 100 max</span>
            </div>
            <div className="text-xs font-bold text-emerald-400 mt-1">
              Top 15% Verified Engineer
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OpenToWorkBanner;
