import React, { useEffect } from 'react';
import { X, Copy, Download } from 'lucide-react';
import { GeneratedImageRecord } from '../types';

interface ZoomModalProps {
  artwork: GeneratedImageRecord | null;
  onClose: () => void;
  onCopyPrompt: (text: string) => void;
  onDownload: (id: number) => void;
}

export const ZoomModal: React.FC<ZoomModalProps> = ({
  artwork,
  onClose,
  onCopyPrompt,
  onDownload,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!artwork) return null;

  return (
    <div
      id="zoomModal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        id="modalBackdrop"
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative z-10 max-w-4xl w-full max-h-[92vh] bg-white dark:bg-[#11141c] border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-[scaleUp_0.2s_ease-out]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-black/10 dark:border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <span
              id="modalStyleBadge"
              className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500 text-indigo-600 dark:text-indigo-400"
            >
              {artwork.style}
            </span>
            <span id="modalTimestamp" className="text-xs text-slate-400 dark:text-slate-500">
              {artwork.formatted_date || 'Created recently'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="modalCopyBtn"
              onClick={() => onCopyPrompt(artwork.enhanced_prompt || artwork.prompt)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-xs font-semibold text-slate-800 dark:text-white transition-colors"
              title="Copy prompt"
            >
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Copy Prompt</span>
            </button>
            <button
              type="button"
              id="modalDownloadBtn"
              onClick={() => onDownload(artwork.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
              title="Download PNG"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              type="button"
              id="closeModalBtn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors ml-1"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Image Stage */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className="bg-black/95 flex items-center justify-center min-h-[360px] sm:min-h-[440px] max-h-[62vh] p-4">
            <img
              id="modalImage"
              src={artwork.image_url}
              alt={artwork.prompt}
              className="max-w-full max-h-full object-contain rounded shadow-2xl"
            />
          </div>

          {/* Details & Caption */}
          <div className="p-4 sm:p-5 bg-slate-50 dark:bg-white/[0.02] border-t border-black/10 dark:border-white/10 flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Prompt Details
            </span>
            <p
              id="modalPromptText"
              className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed"
            >
              {artwork.enhanced_prompt || artwork.prompt}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span
                id="modalDimensionsChip"
                className="font-mono text-xs px-2.5 py-1 rounded bg-white dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-300"
              >
                {artwork.width} × {artwork.height} ({artwork.aspect_ratio})
              </span>
              <span
                id="modalSeedChip"
                className="font-mono text-xs px-2.5 py-1 rounded bg-white dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-300"
              >
                Seed: {artwork.seed || 'Auto'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
