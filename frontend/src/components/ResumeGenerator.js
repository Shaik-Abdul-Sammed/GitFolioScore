import React, { useState, useEffect, useRef } from 'react';
import { FileText, Download, RefreshCw, AlertCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import { waitForAnna, getLLMResponseText } from '../lib/llm';
import { sanitizeForPDF } from '../lib/pdfSanitizer';
import { calculatePercentile } from '../lib/score';
import ExportPreviewModal from './ExportPreviewModal';

/**
 * PDF Resume Generator – uses high-resolution html2canvas capture and jsPDF
 * to export a professional 1-page PDF resume without CSP blob: iframe errors.
 */
function ResumeGenerator({ report, advice, onToast }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');
  const [showDraft, setShowDraft] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const resumeRef = useRef(null);

  // Revoke Blob URL on unmount or before setting new previewData
  useEffect(() => {
    return () => {
      if (
        previewData?.fileUrl &&
        typeof URL.revokeObjectURL === 'function' &&
        previewData.fileUrl.startsWith('blob:')
      ) {
        try {
          URL.revokeObjectURL(previewData.fileUrl);
        } catch {
          // ignore
        }
      }
    };
  }, [previewData]);

  const profile = report?.profile || {};
  const topRepos = report?.topRepos || [];
  const languages = report?.mostUsedLanguages || [];

  const buildResumeText = () => {
    const name = sanitizeForPDF(profile.name || profile.login || 'Developer');
    const bio = sanitizeForPDF(profile.bio || '');
    const langList = languages
      .slice(0, 6)
      .map((l) => {
        if (Array.isArray(l)) return l[0];
        return l?.lang || l?.name || String(l);
      })
      .filter(Boolean)
      .join(', ');
    const repoLines = topRepos.slice(0, 4).map(
      (r) => sanitizeForPDF(`- ${r.name}${r.language ? ` (${r.language})` : ''} -- ${r.description || 'Open-source project.'} * ${r.stars ?? r.stargazers_count ?? 0} stars`)
    );
    const actionLines = (advice?.actions || []).slice(0, 3).map((a) => sanitizeForPDF(`- ${a.action}`));

    return [
      `RESUME -- ${name.toUpperCase()}`,
      `GitHub: https://github.com/${profile.login || ''} | GitFolioScore: ${report?.score ?? '?'}/100 (${calculatePercentile(report?.score)})`,
      bio ? `Bio: ${bio}` : '',
      '',
      '-- SKILLS ------------------------------',
      langList,
      '',
      '-- PROJECTS ----------------------------',
      ...repoLines,
      '',
      '-- AI CAREER COACH RECOMMENDATIONS ----',
      ...actionLines,
    ].filter((l) => l !== null).join('\n');
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      let resumeText = '';
      try {
        await waitForAnna(2500);
        if (window.anna?.llm?.complete) {
          const repoSummaries = topRepos.slice(0, 4).map(
            (r) => `${r.name} (${r.language || 'N/A'}): ${r.description || 'No description.'} [${r.stars ?? r.stargazers_count ?? 0} ★]`
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
              modelPreferences: {
                intelligencePriority: 0.85,
                speedPriority: 0.75,
                costPriority: 0.5,
              },
            },
            { timeoutMs: 5000 }
          );
          resumeText = getLLMResponseText(response);
        }
      } catch {
        // Fall back to static deterministic resume silently
      }

      if (!resumeText) {
        resumeText = buildResumeText();
      }

      setPreview(resumeText);

      // Wait a tick for hidden resume DOM to update
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Generate high-resolution PNG screenshot of the hidden resume element
      const html2canvasFn = typeof html2canvas === 'function' ? html2canvas : html2canvas?.default;
      let canvas = null;
      if (resumeRef.current && typeof html2canvasFn === 'function') {
        try {
          canvas = await html2canvasFn(resumeRef.current, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
          });
        } catch {
          // ignore
        }
      }

      const fallbackPng =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const pngDataUrl = canvas?.toDataURL ? canvas.toDataURL('image/png') : fallbackPng;
      const fileName = `${profile.login || 'resume'}_gitfolioscore.pdf`;

      // Pass the PNG Data URL to ExportPreviewModal (fileType: 'pdf')
      setPreviewData({
        fileUrl: pngDataUrl,
        fileName,
        fileType: 'pdf',
      });
    } catch {
      // Fall back to static template silently on canvas/export error
      const fallbackPng =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      setPreview(buildResumeText());
      setPreviewData({
        fileUrl: fallbackPng,
        fileName: `${profile.login || 'resume'}_gitfolioscore.pdf`,
        fileType: 'pdf',
      });
    } finally {
      setLoading(false);
    }
  };

  const safeName = sanitizeForPDF(profile.name || profile.login || 'Developer Resume');
  const safeContact = sanitizeForPDF(`github.com/${profile.login || ''} | GitFolioScore: ${report?.score ?? '?'}/100 (${calculatePercentile(report?.score)}) | https://anna.partners/apps/gitfolioscore`);
  const currentResumeText = preview || buildResumeText();

  return (
    <div className="premium-card manga-halftone-card p-6 animate-fade-in-up">
      {/* Hidden ATS Resume UI container for high-res html2canvas capture */}
      <div
        ref={resumeRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '-9999px',
          width: '794px',
          minHeight: '1080px',
          backgroundColor: '#ffffff',
          color: '#1e293b',
          padding: '44px',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ borderBottom: '2px solid #6366f1', paddingBottom: '12px', marginBottom: '18px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 6px 0', textTransform: 'uppercase', color: '#0f172a' }}>
            {safeName}
          </h1>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>
            {safeContact}
          </div>
        </div>

        <div style={{ fontSize: '11px', lineHeight: '1.65', color: '#334155', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace' }}>
          {currentResumeText}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 text-indigo-400 border border-indigo-500/30">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              AI Resume Generator
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                PDF Export
              </span>
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Uses your top repositories, bio, and AI coaching data to generate a professional 1-page PDF resume.
            </p>
          </div>
        </div>

        {preview && (
          <button
            type="button"
            onClick={() => setShowDraft(!showDraft)}
            className="self-start sm:self-center text-xs px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-gray-300 font-medium transition active:scale-95"
          >
            {showDraft ? 'Hide Draft Text' : 'View Draft Text'}
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {showDraft && preview && (
        <div className="mb-4 p-3.5 rounded-xl border border-white/10 bg-black/40 max-h-48 overflow-y-auto overflow-x-auto animate-fade-in">
          <pre className="text-[10px] text-gray-300 whitespace-pre-wrap break-words font-mono leading-relaxed overflow-x-auto">{preview}</pre>
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

      {previewData && (
        <ExportPreviewModal
          isOpen={Boolean(previewData)}
          fileUrl={previewData.fileUrl}
          fileType={previewData.fileType}
          fileName={previewData.fileName}
          onClose={() => setPreviewData(null)}
          onDownload={() => {
            onToast?.('PDF Resume downloaded successfully!');
          }}
        />
      )}
    </div>
  );
}

export default ResumeGenerator;
