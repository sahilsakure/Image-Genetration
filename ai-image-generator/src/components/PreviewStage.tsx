import React from 'react';
import {
  Maximize2,
  Download,
  Copy,
  ZoomIn,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { GeneratedImageRecord } from '../types';

interface PreviewStageProps {
  currentArtwork: GeneratedImageRecord | null;
  isGenerating: boolean;
  progressStep: { main: string; sub: string };
  onOpenZoom: (artwork: GeneratedImageRecord) => void;
  onDownload: () => void;
  onCopyPrompt: () => void;
  onQuickTagClick: (prompt: string) => void;
}

export const PreviewStage: React.FC<PreviewStageProps> = ({
  currentArtwork,
  isGenerating,
  progressStep,
  onOpenZoom,
  onDownload,
  onCopyPrompt,
  onQuickTagClick,
}) => {
  return (
    <div className="bg-white dark:bg-[#11141c] border border-black/10 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-2xl flex flex-col gap-4 min-h-[580px] transition-colors">
      {/* Viewport Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h2 className="font-['Outfit'] text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Viewport
          </h2>
          <span
            id="previewStatusBadge"
            className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
              isGenerating
                ? 'bg-indigo-500/15 border-indigo-500 text-indigo-600 dark:text-indigo-400 animate-pulse'
                : currentArtwork
                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'bg-slate-100 dark:bg-white/[0.05] border-black/10 dark:border-white/10 text-slate-500 dark:text-slate-400'
            }`}
          >
            {isGenerating ? 'Synthesizing' : currentArtwork ? 'Ready' : 'Standby'}
          </span>
        </div>

        {/* Quick Actions Bar (Visible when artwork exists and not generating) */}
        {currentArtwork && !isGenerating && (
          <div id="previewActionsBar" className="flex items-center gap-2">
            <button
              type="button"
              id="copyPromptBtn"
              onClick={onCopyPrompt}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-black/5 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all active:scale-95"
              title="Copy prompt"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Prompt</span>
            </button>
            <button
              type="button"
              id="zoomImageBtn"
              onClick={() => onOpenZoom(currentArtwork)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-black/5 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all active:scale-95"
              title="Zoom full screen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Zoom</span>
            </button>
            <button
              type="button"
              id="downloadImageBtn"
              onClick={onDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
              title="Download PNG"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Viewport Stage Container */}
      <div
        id="previewStageContainer"
        className="relative flex-1 min-h-[440px] rounded-xl border border-dashed border-black/15 dark:border-white/10 bg-slate-50 dark:bg-black/40 flex items-center justify-center overflow-hidden transition-colors"
      >
        {/* State 1: Generating Shimmer Skeleton Loader */}
        {isGenerating && (
          <div
            id="skeletonLoader"
            className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20 bg-slate-100/90 dark:bg-[#0a0c10]/95 backdrop-blur-sm"
          >
            {/* Shimmer wave effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent animate-[shimmer_2s_infinite_ease-in-out]" />

            <div className="relative z-10 flex flex-col items-center gap-3">
              {/* Spinning glowing core */}
              <div className="relative w-14 h-14 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 opacity-90 animate-pulse" />
              </div>

              <div className="flex flex-col items-center gap-1 mt-2">
                <h3
                  id="progressStatusText"
                  className="font-['Outfit'] text-base sm:text-lg font-bold text-slate-900 dark:text-white"
                >
                  {progressStep.main}
                </h3>
                <p id="progressSubText" className="text-xs text-slate-500 dark:text-slate-400">
                  {progressStep.sub}
                </p>
              </div>

              {/* Indeterminate progress track */}
              <div className="w-48 sm:w-60 h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden mt-2">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full animate-[pulse_1.5s_infinite]" />
              </div>
            </div>
          </div>
        )}

        {/* State 2: Finished Rendered Artwork */}
        {currentArtwork && !isGenerating && (
          <div
            id="renderedImageWrapper"
            className="relative w-full h-full flex items-center justify-center p-2"
          >
            <img
              id="renderedImage"
              src={currentArtwork.image_url}
              alt={currentArtwork.prompt}
              onClick={() => onOpenZoom(currentArtwork)}
              className="max-w-full max-h-[500px] object-contain rounded-lg shadow-lg cursor-zoom-in transition-transform duration-200 hover:scale-[1.01]"
            />

            {/* Floating Resolution Badge and Zoom controls */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
              <span
                id="previewResolutionBadge"
                className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-black/75 backdrop-blur-md text-white shadow-sm pointer-events-auto"
              >
                {currentArtwork.width} × {currentArtwork.height} ({currentArtwork.aspect_ratio})
              </span>

              <div className="flex items-center gap-2 pointer-events-auto">
                <button
                  type="button"
                  id="overlayZoomBtn"
                  onClick={() => onOpenZoom(currentArtwork)}
                  className="w-9 h-9 rounded-full bg-black/75 hover:bg-indigo-600 backdrop-blur-md text-white flex items-center justify-center shadow-md transition-all active:scale-95"
                  title="Zoom full screen"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  id="overlayDownloadBtn"
                  onClick={onDownload}
                  className="w-9 h-9 rounded-full bg-black/75 hover:bg-indigo-600 backdrop-blur-md text-white flex items-center justify-center shadow-md transition-all active:scale-95"
                  title="Download PNG"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* State 3: Empty Placeholder State */}
        {!currentArtwork && !isGenerating && (
          <div
            id="emptyPreviewState"
            className="flex flex-col items-center justify-center p-8 text-center max-w-md"
          >
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-500 mb-4 shadow-sm">
              <ImageIcon className="w-8 h-8" />
            </div>

            <h3 className="font-['Outfit'] text-lg font-bold text-slate-900 dark:text-white mb-1">
              Canvas Awaiting Input
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
              Select an aesthetic preset, enter your concept prompt, or choose one of our curated themes below.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                'Cyberpunk neon city in rain',
                'Ethereal fantasy landscape with glowing flora',
                'Studio portrait with volumetric Rembrandt lighting',
              ].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => onQuickTagClick(sample)}
                  className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-indigo-50 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-black/5 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/30 text-xs text-slate-600 dark:text-slate-300 transition-all active:scale-95"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-indigo-500" />
                    <span>{sample}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Metadata Inspector Card Footer */}
      {currentArtwork && !isGenerating && (
        <div
          id="renderedMetaCard"
          className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-black/10 dark:border-white/10 flex flex-col gap-2.5 transition-colors"
        >
          <div className="flex flex-wrap items-center gap-4 text-xs border-b border-black/5 dark:border-white/5 pb-2.5">
            <div>
              <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider block">
                Style
              </span>
              <span id="metaStyleValue" className="font-semibold text-slate-800 dark:text-slate-200">
                {currentArtwork.style}
              </span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider block">
                Ratio
              </span>
              <span id="metaRatioValue" className="font-semibold text-slate-800 dark:text-slate-200">
                {currentArtwork.aspect_ratio}
              </span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider block">
                Seed
              </span>
              <span id="metaSeedValue" className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                {currentArtwork.seed || 'Auto'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider block">
                Created
              </span>
              <span id="metaDateValue" className="text-slate-600 dark:text-slate-300">
                {currentArtwork.formatted_date || 'Just now'}
              </span>
            </div>
          </div>

          <p
            id="metaPromptValue"
            className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed"
            title={currentArtwork.enhanced_prompt || currentArtwork.prompt}
          >
            {currentArtwork.enhanced_prompt || currentArtwork.prompt}
          </p>
        </div>
      )}
    </div>
  );
};
