import React, { useState } from 'react';
import { FileCode, Download, RefreshCw, CheckCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';

function HackerRankResume({ report, advice }) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const profile = report?.profile || {};
  const topRepos = report?.topRepos || [];
  const languages = report?.mostUsedLanguages || [];

  const handleDownloadPDF = () => {
    setDownloading(true);
    try {
      const doc = new jsPDF({
        unit: 'pt',
        format: 'letter',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      const usableWidth = pageWidth - margin * 2;

      // Force pure white background for PDF
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      let y = 45;

      // Name Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(20, 20, 20);
      const name = (profile.name || profile.login || 'Software Engineer').toUpperCase();
      doc.text(name, margin, y);

      // Contact & Links Subhead
      y += 16;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      const contactInfo = [
        profile.location ? profile.location : null,
        `github.com/${profile.login || 'portfolio'}`,
        `GitFolioScore: ${report?.score ?? 85}/100`,
        'https://anna.partners/apps/gitfolioscore',
      ].filter(Boolean).join('  |  ');
      doc.text(contactInfo, margin, y);

      y += 12;
      doc.setDrawColor(30, 30, 30);
      doc.setLineWidth(1);
      doc.line(margin, y, pageWidth - margin, y);

      // Helper to draw section header
      const drawSection = (title) => {
        y += 20;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(title.toUpperCase(), margin, y);
        y += 4;
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 12;
      };

      // 1. PROFESSIONAL SUMMARY
      drawSection('Professional Summary');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(40, 40, 40);
      const summaryText =
        advice?.summary ||
        profile.bio ||
        `Full-stack software developer with proven engineering discipline, verified GitHub portfolio score of ${report?.score ?? 85}/100, and hands-on expertise building production applications with high code quality and documentation hygiene.`;
      const splitSummary = doc.splitTextToSize(summaryText, usableWidth);
      doc.text(splitSummary, margin, y);
      y += splitSummary.length * 12;

      // 2. TECHNICAL SKILLS
      drawSection('Technical Skills');
      const langNames = languages
        .slice(0, 8)
        .map((l) => (Array.isArray(l) ? l[0] : l.lang || l.name))
        .filter(Boolean)
        .join(', ');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(20, 20, 20);
      doc.text('Languages & Frameworks: ', margin, y);
      const labelWidth = doc.getTextWidth('Languages & Frameworks: ');
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      doc.text(langNames || 'JavaScript, TypeScript, React, Node.js, Python, SQL', margin + labelWidth, y);
      y += 14;

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(20, 20, 20);
      doc.text('Practices & Tools: ', margin, y);
      const toolsWidth = doc.getTextWidth('Practices & Tools: ');
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      doc.text('Git, CI/CD, Automated Testing, REST APIs, System Architecture, Agile', margin + toolsWidth, y);
      y += 10;

      // 3. KEY OPEN SOURCE PROJECTS (HackerRank Format)
      drawSection('Key Technical Projects');
      const projectsToRender = topRepos.slice(0, 3);
      projectsToRender.forEach((repo) => {
        // Project Title and Tech
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(repo.name, margin, y);

        const titleW = doc.getTextWidth(repo.name);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(90, 90, 90);
        doc.text(` — [${repo.language || 'Software Stack'}]`, margin + titleW, y);

        // Right-aligned stars & forks
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(100, 100, 100);
        const statsStr = `★ ${repo.stars ?? 0}  |  Forks: ${repo.forks ?? 0}`;
        doc.text(statsStr, pageWidth - margin - doc.getTextWidth(statsStr), y);

        y += 12;

        // Project Description Bullet
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(40, 40, 40);
        const bulletDesc = `• ${repo.description || 'Engineered modular application architecture with comprehensive documentation and verified test workflows.'}`;
        const splitBullet = doc.splitTextToSize(bulletDesc, usableWidth - 10);
        doc.text(splitBullet, margin + 5, y);
        y += splitBullet.length * 11 + 6;
      });

      // 4. VERIFIED ACHIEVEMENTS & CODE QUALITY
      drawSection('Verified Technical Credentials');
      const bullets = [
        `• Audited by GitFolioScore with overall technical index of ${report?.score ?? 85}/100.`,
        `• Evaluated across 6 hiring pillars: Code Quality, Documentation Depth, Activity Consistency, and Community Impact.`,
        ...(advice?.actions || []).slice(0, 2).map((a) => `• Engineering Focus: ${a.action}`),
      ];

      bullets.forEach((b) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(40, 40, 40);
        const split = doc.splitTextToSize(b, usableWidth - 10);
        doc.text(split, margin + 5, y);
        y += split.length * 11 + 3;
      });

      // Save PDF file
      const fileName = `${profile.login || 'developer'}_hackerrank_resume.pdf`;
      doc.save(fileName);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('PDF generation error:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="premium-card p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileCode className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            HackerRank-Style Resume
          </h3>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
            Standard Format
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-4 leading-relaxed">
        Export an ATS-optimized, black-and-white HackerRank format 1-page PDF resume with standard Helvetica typography, right-aligned metrics, and bold tech stack callouts.
      </p>

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
    </div>
  );
}

export default HackerRankResume;
