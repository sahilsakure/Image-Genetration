import React from 'react';
import { Sparkles, LayoutGrid, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenGallery: () => void;
  galleryCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onOpenGallery,
  galleryCount,
}) => {
  return (
    <header className="sticky top-0 z-40 h-[70px] backdrop-blur-md bg-white/80 dark:bg-[#11141c]/80 border-b border-black/10 dark:border-white/10 transition-colors duration-200">
      <div className="max-w-[1560px] h-full mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand Group */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-['Outfit'] font-bold text-lg tracking-tight text-slate-900 dark:text-white leading-tight">
              Lumina AI
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Flux v2.4 • Studio
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Gallery Drawer Toggle */}
          <button
            type="button"
            id="galleryToggleBtn"
            onClick={onOpenGallery}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-black/5 dark:border-white/10 text-slate-800 dark:text-white text-sm font-semibold transition-all duration-150 active:scale-95"
            title="Open Creation History"
          >
            <LayoutGrid className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">Creations</span>
            <span
              id="headerGalleryCount"
              className="px-2 py-0.5 text-xs font-bold rounded-full bg-indigo-600 text-white"
            >
              {galleryCount}
            </span>
          </button>

          {/* Engine Status Badge */}
          <div
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-black/5 dark:border-white/10 text-xs font-medium text-slate-600 dark:text-slate-300"
            title="Pollinations AI Engine Active"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
            <span>Online & Ready</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            id="themeToggleBtn"
            onClick={onToggleTheme}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-black/5 dark:border-white/10 text-slate-700 dark:text-slate-200 transition-all duration-150 active:scale-95"
            title="Toggle theme"
            aria-label="Toggle dark/light theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
