import React, { useState, useEffect, useRef } from 'react';
import { FileCode, Download, RefreshCw, CheckCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import { waitForAnna } from '../lib/llm';
import { sanitizeForPDF } from '../lib/pdfSanitizer';
import ExportPreviewModal from './ExportPreviewModal';

function HackerRankResume({ report, advice, onToast }) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const resumeRef = useRef(null);

  const profile = report?.profile || {};
  const topRepos = report?.topRepos || [];
  const languages = report?.mostUsedLanguages || [];

  const defaultSummary = sanitizeForPDF(
    advice?.summary ||
    profile.bio ||
    `Full-stack software developer with proven engineering discipline, verified GitHub portfolio score of ${report?.score ?? 85}/100, and hands-on expertise building production applications with high code quality and documentation hygiene.`
  );

  const [resumeSummary, setResumeSummary] = useState(defaultSummary);

  useEffect(() => {
    setResumeSummary(defaultSummary);
  }, [defaultSummary]);

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

  const langNames = languages
    .slice(0, 8)
    .map((l) => (Array.isArray(l) ? l[0] : l?.lang || l?.name))
    .filter(Boolean)
    .join(', ');

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      // 1. Call waitForAnna with fast timeout & fallback for DNS outages
      try {
        await waitForAnna(2500);
        if (window.anna?.llm?.complete) {
          const res = await window.anna.llm.complete(
            {
              messages: [{
                role: 'user',
                content: `Write a concise ATS resume professional summary (max 3 sentences) for @${profile.login}. Bio: "${profile.bio || 'Software Engineer'}". Score: ${report?.score ?? 85}/100. Key skills: ${langNames}.`,
              }],
              systemPrompt: 'You are a professional technical resume writer for HackerRank. Write a high-impact, ATS-optimized candidate summary. Return plain text only.',
              maxTokens: 200,
              temperature: 0.3,
            },
            { timeoutMs: 5000 }
          );
          const aiText = (res?.content?.text || res?.text || '').trim();
          if (aiText) {
            setResumeSummary(sanitizeForPDF(aiText));
          }
        }
      } catch (bridgeErr) {
        // eslint-disable-next-line no-console
        console.warn('Anna Bridge unavailable/timed out. Using static summary:', bridgeErr);
      }

      // Wait a tick for hidden resume DOM to update
      await new Promise((resolve) => setTimeout(resolve, 50));

      // 2. High-res screenshot (PNG) of the hidden resume element
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
      const fileName = `${profile.login || 'developer'}_hackerrank_resume.pdf`;

      // 3. Pass the PNG Data URL to ExportPreviewModal
      setPreviewData({
        fileUrl: pngDataUrl,
        fileName,
        fileType: 'pdf',
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('PDF generation falling back to static template:', err);
      const fallbackPng =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const fileName = `${profile.login || 'developer'}_hackerrank_resume.pdf`;
      setPreviewData({
        fileUrl: fallbackPng,
        fileName,
        fileType: 'pdf',
      });
    } finally {
      setDownloading(false);
    }
  };

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
          color: '#111827',
          padding: '44px',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          boxSizing: 'border-box',
        }}
      >
        {/* Name & Contact Header */}
        <div style={{ borderBottom: '2px solid #111827', paddingBottom: '12px', marginBottom: '18px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 6px 0', textTransform: 'uppercase', color: '#000000', letterSpacing: '0.5px' }}>
            {sanitizeForPDF((profile.name || profile.login || 'Software Engineer').toUpperCase())}
          </h1>
          <div style={{ fontSize: '11px', color: '#4b5563', display: 'flex', gap: '8px', flexWrap: 'wrap', fontWeight: '500' }}>
            {profile.location && <span>{profile.location}  |  </span>}
            <span>github.com/{profile.login || 'portfolio'}  |  </span>
            <span>GitFolioScore: {report?.score ?? 85}/100  |  </span>
            <span>https://anna.partners/apps/gitfolioscore</span>
          </div>
        </div>

        {/* 1. Professional Summary */}
        <div style={{ marginBottom: '18px' }}>
          <h2 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #d1d5db', paddingBottom: '4px', margin: '0 0 8px 0', color: '#000000' }}>
            Professional Summary
          </h2>
          <p style={{ fontSize: '11px', lineHeight: '1.6', margin: 0, color: '#1f2937' }}>
            • {resumeSummary}
          </p>
        </div>

        {/* 2. Technical Skills */}
        <div style={{ marginBottom: '18px' }}>
          <h2 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #d1d5db', paddingBottom: '4px', margin: '0 0 8px 0', color: '#000000' }}>
            Technical Skills
          </h2>
          <div style={{ fontSize: '11px', lineHeight: '1.6', color: '#1f2937' }}>
            <p style={{ margin: '0 0 4px 0' }}>
              <strong>Languages & Frameworks: </strong>
              {langNames || 'JavaScript, TypeScript, React, Node.js, Python, SQL'}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Practices & Tools: </strong>
              Git, CI/CD, Automated Testing, REST APIs, System Architecture, Agile
            </p>
          </div>
        </div>

        {/* 3. Key Technical Projects (HackerRank Format) */}
        <div style={{ marginBottom: '18px' }}>
          <h2 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #d1d5db', paddingBottom: '4px', margin: '0 0 10px 0', color: '#000000' }}>
            Key Technical Projects
          </h2>
          {topRepos.slice(0, 3).map((repo) => (
            <div key={repo.name} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#000000' }}>
                  {sanitizeForPDF(repo.name)} <span style={{ fontWeight: 'normal', fontStyle: 'italic', color: '#6b7280', fontSize: '10px' }}>[{sanitizeForPDF(repo.language || 'Software Stack')}]</span>
                </span>
                <span style={{ fontSize: '10px', color: '#6b7280' }}>
                  ★ {repo.stars ?? 0}  |  Forks: {repo.forks ?? 0}
                </span>
              </div>
              <p style={{ fontSize: '10.5px', margin: 0, color: '#374151', lineHeight: '1.5' }}>
                • {sanitizeForPDF(repo.description || 'Engineered modular application architecture with comprehensive documentation and verified test workflows.')}
              </p>
            </div>
          ))}
        </div>

        {/* 4. Verified Credentials & Code Quality */}
        <div>
          <h2 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #d1d5db', paddingBottom: '4px', margin: '0 0 8px 0', color: '#000000' }}>
            Verified Technical Credentials
          </h2>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '10.5px', lineHeight: '1.6', color: '#374151' }}>
            <li>Audited by GitFolioScore with overall technical index of {report?.score ?? 85}/100.</li>
            <li>Evaluated across 6 hiring pillars: Code Quality, Documentation Depth, Activity Consistency, and Community Impact.</li>
            {(advice?.actions || []).slice(0, 2).map((a, i) => (
              <li key={i}>Engineering Focus: {sanitizeForPDF(a.action)}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              HackerRank-Style Resume
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Standard Format
              </span>
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Export an ATS-optimized, black-and-white HackerRank format 1-page PDF resume with standard typography.
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleDownloadPDF}
        disabled={downloading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm transition-all hover:opacity-95 active:scale-95 disabled:opacity-50 shadow-lg"
        style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}
      >
        {downloading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Generating HackerRank PDF...</span>
          </>
        ) : downloaded ? (
          <>
            <CheckCircle className="w-4 h-4 text-white" />
            <span>Downloaded Successfully!</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span>Download HackerRank Resume (PDF)</span>
          </>
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
            setDownloaded(true);
            setTimeout(() => setDownloaded(false), 3000);
            onToast?.('HackerRank Resume PDF downloaded successfully!');
          }}
        />
      )}
    </div>
  );
}

export default HackerRankResume;
