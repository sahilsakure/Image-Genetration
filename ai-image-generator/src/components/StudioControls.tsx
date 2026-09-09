import React, { useRef, useEffect } from 'react';
import {
  Sparkle,
  Sparkles,
  Dices,
  X,
  Palette,
  Proportions,
  Sliders,
  ChevronDown,
  ShieldAlert,
  Hash,
  Shuffle,
  Wand2,
  CheckCircle2,
} from 'lucide-react';
import { StylePresetName, AspectRatioType } from '../types';

interface StudioControlsProps {
  prompt: string;
  onPromptChange: (val: string) => void;
  selectedStyle: StylePresetName;
  onSelectStyle: (style: StylePresetName) => void;
  selectedRatio: AspectRatioType;
  onSelectRatio: (ratio: AspectRatioType) => void;
  negativePrompt: string;
  onNegativePromptChange: (val: string) => void;
  seed: string;
  onSeedChange: (val: string) => void;
  onRandomizeSeed: () => void;
  onSurpriseMe: () => void;
  onClearPrompt: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const STYLES: StylePresetName[] = [
  'Photorealistic',
  'Anime',
  'Cyberpunk',
  'Cinematic',
  '3D Render',
  'Oil Painting',
  'Minimalist',
  'Fantasy',
];

export const StudioControls: React.FC<StudioControlsProps> = ({
  prompt,
  onPromptChange,
  selectedStyle,
  onSelectStyle,
  selectedRatio,
  onSelectRatio,
  negativePrompt,
  onNegativePromptChange,
  seed,
  onSeedChange,
  onRandomizeSeed,
  onSurpriseMe,
  onClearPrompt,
  onGenerate,
  isGenerating,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on input content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(
        96,
        Math.min(220, textareaRef.current.scrollHeight)
      )}px`;
    }
  }, [prompt]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onGenerate();
    }
  };

  const ratioDimensions: Record<AspectRatioType, string> = {
    '1:1': '1024 × 1024 (1:1)',
    '16:9': '1280 × 720 (16:9)',
    '9:16': '720 × 1280 (9:16)',
  };

  return (
    <div className="bg-white dark:bg-[#11141c] border border-black/10 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-2xl flex flex-col gap-5 transition-colors">
      {/* Panel Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-['Outfit'] text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Studio Canvas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Craft visuals with neural precision and high-fidelity diffusion.
          </p>
        </div>
        <button
          type="button"
          id="surprisePromptBtn"
          onClick={onSurpriseMe}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold whitespace-nowrap transition-all duration-150 active:scale-95"
          title="Inject an expertly crafted prompt"
        >
          <Dices className="w-3.5 h-3.5" />
          <span>Surprise Me</span>
        </button>
      </div>

      {/* Form Controls */}
      <form onSubmit={(e) => { e.preventDefault(); onGenerate(); }} className="flex flex-col gap-5">
        {/* Creative Prompt Textarea */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="promptInput"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >
              <Sparkle className="w-3.5 h-3.5 text-indigo-500" />
              <span>Creative Prompt</span>
            </label>
            <div className="flex items-center gap-2">
              <span id="charCounter" className="font-mono text-xs text-slate-400 dark:text-slate-500">
                {prompt.length} / 1000
              </span>
              {prompt.length > 0 && (
                <button
                  type="button"
                  id="clearPromptBtn"
                  onClick={onClearPrompt}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded transition-colors"
                  title="Clear prompt"
                  aria-label="Clear prompt"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="relative">
            <textarea
              ref={textareaRef}
              id="promptInput"
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your visual concept... (e.g., A cybernetic samurai standing under glowing neon cherry blossoms in rain, reflections on katana, cinematic 8k)"
              maxLength={1000}
              rows={3}
              className="w-full min-h-[96px] p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm leading-relaxed outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-y"
            />
          </div>

          <div className="flex justify-end">
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] border border-black/10 dark:border-white/10 font-mono text-[10px]">
                Ctrl
              </kbd>{' '}
              +{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] border border-black/10 dark:border-white/10 font-mono text-[10px]">
                Enter
              </kbd>{' '}
              to generate
            </span>
          </div>
        </div>

        {/* Style Selector Pills */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Palette className="w-3.5 h-3.5 text-indigo-500" />
              <span>Aesthetic Style Preset</span>
            </label>
            <span id="activeStyleIndicator" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              {selectedStyle}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup" aria-label="Style Presets">
            {STYLES.map((styleName) => {
              const isActive = selectedStyle === styleName;
              return (
                <button
                  key={styleName}
                  type="button"
                  onClick={() => onSelectStyle(styleName)}
                  role="radio"
                  aria-checked={isActive}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-medium transition-all duration-150 border ${
                    isActive
                      ? 'bg-indigo-500/15 border-indigo-500 text-indigo-600 dark:text-indigo-300 font-semibold shadow-sm shadow-indigo-500/20'
                      : 'bg-slate-50 hover:bg-slate-100 dark:bg-white/[0.03] dark:hover:bg-white/[0.07] border-black/5 dark:border-white/10 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  />
                  <span className="truncate">{styleName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Aspect Ratio Selector */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Proportions className="w-3.5 h-3.5 text-indigo-500" />
              <span>Canvas Dimensions</span>
            </label>
            <span id="activeRatioIndicator" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 font-mono">
              {ratioDimensions[selectedRatio]}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5" role="radiogroup" aria-label="Aspect Ratio">
            {/* 1:1 Square */}
            <button
              type="button"
              onClick={() => onSelectRatio('1:1')}
              role="radio"
              aria-checked={selectedRatio === '1:1'}
              className={`flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border transition-all ${
                selectedRatio === '1:1'
                  ? 'bg-indigo-500/15 border-indigo-500 text-indigo-600 dark:text-indigo-300 shadow-sm shadow-indigo-500/20'
                  : 'bg-slate-50 hover:bg-slate-100 dark:bg-white/[0.03] dark:hover:bg-white/[0.07] border-black/5 dark:border-white/10 text-slate-600 dark:text-slate-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-sm border ${
                  selectedRatio === '1:1'
                    ? 'border-indigo-500 bg-indigo-500/25'
                    : 'border-slate-400 dark:border-slate-500'
                }`}
              />
              <span className="font-mono text-xs font-semibold">1:1</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">Square</span>
            </button>

            {/* 16:9 Landscape */}
            <button
              type="button"
              onClick={() => onSelectRatio('16:9')}
              role="radio"
              aria-checked={selectedRatio === '16:9'}
              className={`flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border transition-all ${
                selectedRatio === '16:9'
                  ? 'bg-indigo-500/15 border-indigo-500 text-indigo-600 dark:text-indigo-300 shadow-sm shadow-indigo-500/20'
                  : 'bg-slate-50 hover:bg-slate-100 dark:bg-white/[0.03] dark:hover:bg-white/[0.07] border-black/5 dark:border-white/10 text-slate-600 dark:text-slate-300'
              }`}
            >
              <div
                className={`w-5 h-3 rounded-sm border ${
                  selectedRatio === '16:9'
                    ? 'border-indigo-500 bg-indigo-500/25'
                    : 'border-slate-400 dark:border-slate-500'
                }`}
              />
              <span className="font-mono text-xs font-semibold">16:9</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">Landscape</span>
            </button>

            {/* 9:16 Portrait */}
            <button
              type="button"
              onClick={() => onSelectRatio('9:16')}
              role="radio"
              aria-checked={selectedRatio === '9:16'}
              className={`flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border transition-all ${
                selectedRatio === '9:16'
                  ? 'bg-indigo-500/15 border-indigo-500 text-indigo-600 dark:text-indigo-300 shadow-sm shadow-indigo-500/20'
                  : 'bg-slate-50 hover:bg-slate-100 dark:bg-white/[0.03] dark:hover:bg-white/[0.07] border-black/5 dark:border-white/10 text-slate-600 dark:text-slate-300'
              }`}
            >
              <div
                className={`w-3 h-5 rounded-sm border ${
                  selectedRatio === '9:16'
                    ? 'border-indigo-500 bg-indigo-500/25'
                    : 'border-slate-400 dark:border-slate-500'
                }`}
              />
              <span className="font-mono text-xs font-semibold">9:16</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">Portrait</span>
            </button>
          </div>
        </div>

        {/* Advanced Accordion */}
        <details className="group border border-black/10 dark:border-white/10 rounded-xl bg-slate-50/50 dark:bg-white/[0.02] overflow-hidden">
          <summary className="flex items-center justify-between p-3.5 cursor-pointer text-xs font-semibold text-slate-600 dark:text-slate-300 select-none">
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-indigo-500" />
              <span>Advanced Pipeline Options</span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform duration-200" />
          </summary>
          <div className="p-4 pt-1 border-t border-black/5 dark:border-white/5 flex flex-col gap-3">
            {/* Negative Prompt */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="negativePromptInput"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400"
              >
                <ShieldAlert className="w-3 h-3 text-rose-400" />
                <span>Negative Prompt (Exclude attributes)</span>
              </label>
              <input
                type="text"
                id="negativePromptInput"
                value={negativePrompt}
                onChange={(e) => onNegativePromptChange(e.target.value)}
                placeholder="blur, low quality, deformed limbs, watermark, artifacts"
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-indigo-500"
              />
            </div>

            {/* Seed */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="seedInput"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400"
                >
                  <Hash className="w-3 h-3 text-indigo-400" />
                  <span>Seed (Unique or Reproducible)</span>
                </label>
                <button
                  type="button"
                  onClick={onRandomizeSeed}
                  className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <Shuffle className="w-3 h-3" />
                  <span>Randomize</span>
                </button>
              </div>
              <input
                type="number"
                id="seedInput"
                value={seed}
                onChange={(e) => onSeedChange(e.target.value)}
                placeholder="Leave blank for automatic randomized seed"
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </details>

        {/* Generate Button */}
        <div className="flex flex-col gap-2 mt-1">
          <button
            type="button"
            id="generateBtn"
            disabled={isGenerating}
            onClick={onGenerate}
            className="relative w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-['Outfit'] font-bold text-base tracking-wide shadow-lg shadow-indigo-500/30 transition-all duration-200 active:scale-[0.99] overflow-hidden"
          >
            {/* Shimmer animation on hover/active */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000" />
            <div className="relative flex items-center justify-center gap-2">
              <Wand2 className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span id="generateBtnText">
                {isGenerating ? 'Synthesizing Canvas...' : 'Generate Artwork'}
              </span>
            </div>
          </button>

          <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 text-center">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Unmetered AI inference via Pollinations Flux. Free & ready out-of-the-box.</span>
          </p>
        </div>
      </form>
    </div>
  );
};
