import React, { useEffect, useCallback } from 'react';
import { Download, X, FileText, Image as ImageIcon, ExternalLink } from 'lucide-react';

/**
 * ExportPreviewModal: Intercepts PDF and Image downloads, rendering a
 * rich preview before the user triggers the actual download.
 * Ensures the Blob URL is safely revoked on close/unmount to prevent memory leaks.
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

  const handleTriggerDownload = () => {
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

        {/* Preview Content Area */}
        <div className="my-4 flex-1 overflow-y-auto max-h-[60vh] flex flex-col items-center justify-center rounded-2xl bg-slate-950/80 border border-white/10 p-3">
          {isPdf ? (
            <div className="w-full h-[52vh] flex flex-col items-center">
              <iframe
                src={fileUrl}
                title={fileName}
                className="w-full flex-1 rounded-xl border border-white/10 bg-white"
              />
              <div className="pt-2 text-center">
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline"
                >
                  <span>Open PDF in new tab</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-2">
              <img
                src={fileUrl}
                alt={fileName}
                className="max-h-[50vh] max-w-full rounded-xl object-contain shadow-2xl border border-white/15"
              />
            </div>
          )}
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
