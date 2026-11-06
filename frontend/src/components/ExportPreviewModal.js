import React, { useEffect, useCallback } from 'react';
import { Download, X, FileText, Image as ImageIcon } from 'lucide-react';

/**
 * ExportPreviewModal: Intercepts PDF and Image downloads, rendering a
 * rich image-based preview before the user triggers the actual download.
 * Using <img> instead of <iframe>/<embed>/<object> completely bypasses
 * Anna OS iframe CSP blob: blocking restrictions.
 */
function ExportPreviewModal({
  isOpen,
  fileUrl,
  fileType = 'image', // 'image' | 'pdf'
  fileName = 'gitfolioscore-export',
  onClose,
  onDownload,
}) {
  const handleClose = useCallback(() => {
    if (fileUrl && typeof URL.revokeObjectURL === 'function' && fileUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(fileUrl);
      } catch (err) {
        // ignore
      }
    }
    onClose?.();
  }, [fileUrl, onClose]);

  // Ensure blob URL is safely revoked on unmount or when fileUrl changes
  useEffect(() => {
    return () => {
      if (fileUrl && typeof URL.revokeObjectURL === 'function' && fileUrl.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(fileUrl);
        } catch (err) {
          // ignore
        }
      }
    };
  }, [fileUrl]);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen || !fileUrl) return null;

  const handleTriggerDownload = async () => {
    if (fileType === 'pdf') {
      try {
        // When fileUrl is a PNG data URL or image, embed it into a fresh jsPDF instance
        const { jsPDF } = await import('jspdf');
        const pdf = new jsPDF({ unit: 'pt', format: 'letter' });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        let imgWidth = pageWidth;
        let imgHeight = pageHeight;
        if (typeof pdf.getImageProperties === 'function') {
          try {
            const props = pdf.getImageProperties(fileUrl);
            if (props && props.width && props.height) {
              imgHeight = (props.height * pageWidth) / props.width;
            }
          } catch {
            // fallback to standard letter aspect ratio
          }
        }
        pdf.addImage(fileUrl, 'PNG', 0, 0, imgWidth, Math.min(pageHeight, imgHeight));
        const outName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
        pdf.save(outName);

        onDownload?.();
        handleClose();
        return;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('jsPDF generation failed in modal, falling back to anchor download:', err);
      }
    }

    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    onDownload?.();
    handleClose();
  };

  const isPdf = fileType === 'pdf';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm modal-backdrop-fade"
    >
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-2xl rounded-3xl bg-slate-900 border border-white/15 p-6 shadow-2xl max-h-[90vh] flex flex-col justify-between manga-panel-modal">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              {isPdf ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="preview-modal-title" className="text-base font-bold text-white font-gaming">
                  Preview Before Download
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300">
                  {isPdf ? 'PDF DOCUMENT' : 'PNG SCORECARD'}
                </span>
              </div>
              <p className="text-xs text-gray-400 truncate max-w-sm">
                File: <span className="font-mono text-gray-300">{fileName}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close preview"
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Content Area - Rendered via <img> to avoid CSP iframe/blob blocking */}
        <div className="my-4 flex-1 overflow-y-auto max-h-[60vh] flex flex-col items-center justify-center rounded-2xl bg-slate-950/80 border border-white/10 p-3">
          <div className="flex flex-col items-center justify-center p-2 w-full">
            <img
              src={fileUrl}
              alt={fileName}
              className="max-h-[52vh] max-w-full rounded-xl object-contain shadow-2xl border border-white/15 bg-white"
            />
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10 gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition active:scale-95"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleTriggerDownload}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all active:scale-95 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-500/20 font-gaming"
          >
            <Download className="w-4 h-4" />
            <span>Download File</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExportPreviewModal;
