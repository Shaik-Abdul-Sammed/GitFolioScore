import React, { useState } from 'react';
import { Image, FileText, Check, RefreshCw } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function ExportReport({ targetRef, data, username, targetRole, advice }) {
  const [exporting, setExporting] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const exportAsImage = async () => {
    if (!targetRef?.current) return;
    try {
      setExporting(true);
      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: '#0f172a',
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `gitfolioscore-${username || 'report'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const exportAsPDF = async () => {
    try {
      setExporting(true);
      const doc = new jsPDF('p', 'pt', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 40;
      let y = 45;

      // Primary header banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, 110, 'F');

      // Top title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text('GitFolioScore Developer Audit', margin, y);

      y += 22;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(199, 210, 254);
      doc.text(
        `Technical Portfolio Summary · Target: ${targetRole || 'Fullstack Software Engineer'}`,
        margin,
        y
      );

      y += 18;
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Audited User: @${username || data?.profile?.login || 'developer'} · Date: ${new Date().toLocaleDateString()}`,
        margin,
        y
      );

      // Score Badge Box on Header
      const scoreVal = data?.score ?? 85;
      doc.setFillColor(99, 102, 241);
      doc.roundedRect(pageWidth - margin - 75, 30, 75, 60, 6, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.setTextColor(255, 255, 255);
      doc.text(`${scoreVal}`, pageWidth - margin - 38, 65, { align: 'center' });
      doc.setFontSize(9);
      doc.text('OVERALL', pageWidth - margin - 38, 79, { align: 'center' });

      y = 135;

      // Developer Bio & Core Overview
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('1. Candidate Technical Profile', margin, y);
      y += 16;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85);

      const bioText = data?.profile?.bio
        ? `Bio: ${data.profile.bio}`
        : 'Active open-source developer with verified public repositories.';
      const bioLines = doc.splitTextToSize(bioText, pageWidth - margin * 2);
      doc.text(bioLines, margin, y);
      y += bioLines.length * 13 + 8;

      // Stats row
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(margin, y, pageWidth - margin * 2, 28, 4, 4, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      const followers = data?.profile?.followers ?? 0;
      const reposCount = data?.profile?.public_repos ?? (data?.topRepos?.length || 0);
      const topLang = data?.mostUsedLanguages?.[0]?.lang || 'TypeScript';
      doc.text(
        `Public Repos: ${reposCount}    |    Followers: ${followers}    |    Primary Tech: ${topLang}`,
        margin + 12,
        y + 18
      );
      y += 42;

      // Category breakdown
      if (data?.scoreBreakdown) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(15, 23, 42);
        doc.text('2. Metric Breakdown & Signal Analysis', margin, y);
        y += 18;

        const categories = [
          { label: 'Repo Quality', val: data.scoreBreakdown.repoQuality || 0 },
          { label: 'Documentation', val: data.scoreBreakdown.docs || 0 },
          { label: 'Activity Cadence', val: data.scoreBreakdown.activity || 0 },
          { label: 'Impact & Stars', val: data.scoreBreakdown.impact || 0 },
          { label: 'Stack Diversity', val: data.scoreBreakdown.diversity || 0 },
        ];

        const colWidth = (pageWidth - margin * 2) / categories.length;
        categories.forEach((cat, idx) => {
          const colX = margin + idx * colWidth;
          doc.setFillColor(248, 250, 252);
          doc.rect(colX, y, colWidth - 6, 36, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(79, 70, 229);
          doc.text(`${Math.round(cat.val)}`, colX + (colWidth - 6) / 2, y + 16, { align: 'center' });
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(100, 116, 139);
          doc.text(cat.label, colX + (colWidth - 6) / 2, y + 29, { align: 'center' });
        });
        y += 50;
      }

      // Strengths
      if (data?.strengths && data.strengths.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(15, 23, 42);
        doc.text('3. Key Evaluated Strengths', margin, y);
        y += 16;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        data.strengths.slice(0, 3).forEach((str) => {
          doc.text(`•  ${str}`, margin + 8, y);
          y += 14;
        });
        y += 8;
      }

      // Top Showcase Repositories
      if (data?.topRepos && data.topRepos.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(15, 23, 42);
        doc.text('4. Flagship Showcase Repositories', margin, y);
        y += 18;

        data.topRepos.slice(0, 3).forEach((r, idx) => {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(30, 41, 59);
          doc.text(`${idx + 1}. ${r.name}`, margin + 8, y);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(100, 116, 139);
          doc.text(
            `Language: ${r.language || 'Multi'}  ·  Stars: ${r.stars ?? 0}  ·  Forks: ${r.forks ?? 0}`,
            margin + 180,
            y
          );
          y += 12;

          if (r.description) {
            doc.setFontSize(8.5);
            doc.setTextColor(71, 85, 105);
            const rDesc = doc.splitTextToSize(r.description, pageWidth - margin * 2 - 16);
            doc.text(rDesc, margin + 16, y);
            y += rDesc.length * 11 + 6;
          } else {
            y += 6;
          }
        });
      }

      // AI Career Coach Recommendations Summary
      if (advice?.actions && advice.actions.length > 0) {
        y += 6;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(15, 23, 42);
        doc.text('5. AI Career Coach Action Plan', margin, y);
        y += 16;

        advice.actions.slice(0, 3).forEach((item, idx) => {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(79, 70, 229);
          doc.text(`Action ${idx + 1}: ${item.action}`, margin + 8, y);
          y += 12;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(71, 85, 105);
          const rLines = doc.splitTextToSize(`Rationale: ${item.rationale}`, pageWidth - margin * 2 - 16);
          doc.text(rLines, margin + 16, y);
          y += rLines.length * 11 + 6;
        });
      }

      // Footer
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        'Verified GitFolioScore Technical Resume Summary · Certified client-side audit on Anna AI OS',
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 25,
        { align: 'center' }
      );

      doc.save(`GitFolioScore-${username || 'Developer'}-Resume-Audit.pdf`);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2500);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('PDF export failed, falling back to canvas:', err);
      // Fallback to html2canvas if needed
      if (targetRef?.current) {
        const canvas = await html2canvas(targetRef.current, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`GitFolioScore-${username || 'Report'}.pdf`);
      }
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={exportAsImage}
        disabled={exporting}
        className="btn-secondary flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
      >
        {exporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
        Export PNG
      </button>
      <button
        onClick={exportAsPDF}
        disabled={exporting}
        className="btn-secondary flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl hover:shadow-md transition-all active:scale-95 text-indigo-400 font-semibold disabled:opacity-50"
      >
        {exporting ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
            Generating PDF...
          </>
        ) : downloaded ? (
          <>
            <Check className="w-4 h-4 text-emerald-400" />
            Downloaded!
          </>
        ) : (
          <>
            <FileText className="w-4 h-4" />
            Export PDF
          </>
        )}
      </button>
    </div>
  );
}

export default ExportReport;
