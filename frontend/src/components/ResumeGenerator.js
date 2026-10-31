import React, { useState } from 'react';
import { FileText, Download, RefreshCw, AlertCircle } from 'lucide-react';

/**
 * PDF Resume Generator – uses jsPDF (already in package.json) to export a
 * 1-page professional resume from the analysed portfolio.
 */
function ResumeGenerator({ report, advice }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');

  const profile = report?.profile || {};
  const topRepos = report?.topRepos || [];
  const languages = report?.mostUsedLanguages || [];

  const buildResumeText = () => {
    const name = profile.name || profile.login || 'Developer';
    const bio = profile.bio || '';
    const langList = languages.slice(0, 6).map((l) => l.lang || l.name || l).join(', ');
    const repoLines = topRepos.slice(0, 4).map(
      (r) => `• ${r.name}${r.language ? ` (${r.language})` : ''} — ${r.description || 'Open-source project.'} ★${r.stars ?? 0}`
    );
    const actionLines = (advice?.actions || []).slice(0, 3).map((a) => `• ${a.action}`);

    return [
      `RESUME — ${name.toUpperCase()}`,
      `GitHub: https://github.com/${profile.login || ''} | GitFolioScore: ${report?.score ?? '—'}/100`,
      bio ? `Bio: ${bio}` : '',
      '',
      '── SKILLS ──────────────────────────────',
      langList,
      '',
      '── PROJECTS ────────────────────────────',
      ...repoLines,
      '',
      '── AI CAREER COACH RECOMMENDATIONS ────',
      ...actionLines,
    ].filter((l) => l !== null).join('\n');
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      let resumeText;
      if (window.anna?.llm?.complete) {
        const repoSummaries = topRepos.slice(0, 4).map(
          (r) => `${r.name} (${r.language || 'N/A'}): ${r.description || 'No description.'} [${r.stars ?? 0} ★]`
        ).join('\n');

        const response = await window.anna.llm.complete(
          {
            messages: [{
              role: 'user',
              content: `Generate a concise 1-page developer resume for @${profile.login}. Bio: "${profile.bio || 'Software developer'}". Score: ${report.score}/100. Top repos:\n${repoSummaries}\n\nLanguages: ${languages.slice(0, 6).map((l) => l.lang || l.name || l).join(', ')}\n\nFormat as plain text with clear SKILLS, EXPERIENCE/PROJECTS, and SUMMARY sections.`,
            }],
            systemPrompt: 'You are a professional technical recruiter and resume writer. Generate clean, ATS-friendly resume content in plain text. Do NOT use markdown or brackets.',
            maxTokens: 900,
            temperature: 0.4,
          },
          { timeoutMs: 40000 }
        );
        resumeText = (response?.content?.text || '').trim() || buildResumeText();
      } else {
        resumeText = buildResumeText();
      }

      setPreview(resumeText);

      // Lazy-load jsPDF and export
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const usableWidth = pageWidth - margin * 2;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text(profile.name || profile.login || 'Developer Resume', margin, 20);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`github.com/${profile.login || ''} | GitFolioScore: ${report?.score ?? '?'}/100 | https://anna.partners/apps/gitfolioscore`, margin, 27);

      doc.setDrawColor(99, 102, 241);
      doc.setLineWidth(0.5);
      doc.line(margin, 30, pageWidth - margin, 30);

      doc.setTextColor(30, 30, 30);
      doc.setFontSize(9.5);

      const lines = doc.splitTextToSize(resumeText, usableWidth);
      doc.text(lines, margin, 38);

      doc.save(`${profile.login || 'resume'}_gitfolioscore.pdf`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Resume generation error:', err);
      setError(err.userMessage || err.message || 'Failed to generate resume.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="premium-card p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            AI Resume Generator
          </h3>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
            PDF Export
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-4">
        Uses your top repositories, bio, and AI coaching data to generate a professional 1-page PDF resume.
      </p>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {preview && (
        <div className="mb-4 p-3 rounded-xl border border-white/10 bg-black/30 max-h-48 overflow-y-auto">
          <pre className="text-[10px] text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">{preview}</pre>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
        style={{ background: 'var(--gradient-primary)' }}
      >
        {loading ? (
          <><RefreshCw className="w-4 h-4 animate-spin" /> Generating PDF Resume...</>
        ) : (
          <><Download className="w-4 h-4" /> Generate & Download PDF Resume</>
        )}
      </button>
    </div>
  );
}

export default ResumeGenerator;
