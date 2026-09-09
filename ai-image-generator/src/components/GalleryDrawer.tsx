import React, { useState, useMemo } from 'react';
import {
  Library,
  X,
  Search,
  Maximize2,
  RotateCcw,
  Download,
  Trash2,
  Images,
} from 'lucide-react';
import { GeneratedImageRecord, StylePresetName } from '../types';

interface GalleryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  images: GeneratedImageRecord[];
  onOpenZoom: (item: GeneratedImageRecord) => void;
  onReusePrompt: (item: GeneratedImageRecord) => void;
  onDeleteImage: (id: number) => Promise<void>;
}

const STYLES: (StylePresetName | 'All')[] = [
  'All',
  'Photorealistic',
  'Anime',
  'Cyberpunk',
  'Cinematic',
  '3D Render',
  'Oil Painting',
  'Minimalist',
  'Fantasy',
];

export const GalleryDrawer: React.FC<GalleryDrawerProps> = ({
  isOpen,
  onClose,
  images,
  onOpenZoom,
  onReusePrompt,
  onDeleteImage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filteredImages = useMemo(() => {
    return images.filter((item) => {
      const matchesFilter =
        selectedFilter === 'All' ||
        item.style.toLowerCase() === selectedFilter.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.prompt.toLowerCase().includes(q) ||
        (item.enhanced_prompt && item.enhanced_prompt.toLowerCase().includes(q));
      return matchesFilter && matchesSearch;
    });
  }, [images, searchQuery, selectedFilter]);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to permanently delete this artwork?')) {
      setDeletingId(id);
      try {
        await onDeleteImage(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="galleryDrawer"
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Creation History Drawer"
    >
      {/* Backdrop */}
      <div
        id="drawerBackdrop"
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Body */}
      <div className="relative z-10 w-full max-w-md h-full bg-white dark:bg-[#11141c] border-l border-black/10 dark:border-white/10 shadow-2xl flex flex-col animate-[slideInRight_0.25s_ease-out]">
        {/* Header */}
        <div className="p-5 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <Library className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-['Outfit'] font-bold text-lg text-slate-900 dark:text-white">
                Creation History
              </h2>
              <span id="galleryTotalBadge" className="text-xs text-slate-400 dark:text-slate-500">
                {images.length} {images.length === 1 ? 'artwork' : 'artworks'}
              </span>
            </div>
          </div>

          <button
            type="button"
            id="closeDrawerBtn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Live Search Bar */}
        <div className="p-4 border-b border-black/10 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] flex flex-col gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              id="gallerySearchInput"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by prompt keyword..."
              className="w-full pl-9 pr-8 py-2 rounded-lg bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-indigo-500"
            />
            {searchQuery && (
              <button
                type="button"
                id="clearSearchBtn"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Style Filter Pills (Horizontal Scroll) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {STYLES.map((styleOption) => {
              const isSelected = selectedFilter === styleOption;
              return (
                <button
                  key={styleOption}
                  type="button"
                  onClick={() => setSelectedFilter(styleOption)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-white dark:bg-white/[0.04] border border-black/5 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.08]'
                  }`}
                >
                  {styleOption}
                </button>
              );
            })}
          </div>
        </div>

        {/* Gallery Cards Grid */}
        <div id="galleryCardsGrid" className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3.5 content-start">
          {filteredImages.map((item) => (
            <article
              key={item.id}
              className={`group relative flex flex-col rounded-xl overflow-hidden bg-slate-50 dark:bg-white/[0.03] border border-black/10 dark:border-white/10 hover:shadow-md transition-all ${
                deletingId === item.id ? 'opacity-40 pointer-events-none' : ''
              }`}
            >
              {/* Media Thumbnail & Overlay Actions */}
              <div className="relative aspect-square bg-slate-200 dark:bg-black overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.prompt}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-semibold text-white">
                  {item.style}
                </span>

                <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-mono text-white">
                  {item.aspect_ratio}
                </span>

                {/* Hover Action Overlay Buttons */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition-opacity duration-200">
                  <button
                    type="button"
                    onClick={() => onOpenZoom(item)}
                    className="w-7 h-7 rounded-full bg-white/20 hover:bg-indigo-600 text-white flex items-center justify-center transition-colors"
                    title="Zoom in"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onReusePrompt(item)}
                    className="w-7 h-7 rounded-full bg-white/20 hover:bg-indigo-600 text-white flex items-center justify-center transition-colors"
                    title="Reuse prompt settings"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={`/api/download/${item.id}`}
                    download
                    className="w-7 h-7 rounded-full bg-white/20 hover:bg-indigo-600 text-white flex items-center justify-center transition-colors"
                    title="Download PNG"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, item.id)}
                    className="w-7 h-7 rounded-full bg-white/20 hover:bg-rose-600 text-white flex items-center justify-center transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-2.5 flex flex-col gap-1">
                <p
                  className="text-xs text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight"
                  title={item.prompt}
                >
                  {item.prompt}
                </p>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  {item.formatted_date || 'Saved'}
                </span>
              </div>
            </article>
          ))}
        </div>

        {/* Empty State */}
        {filteredImages.length === 0 && (
          <div
            id="galleryEmptyState"
            className="flex-1 flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center text-slate-400 mb-3">
              <Images className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">
              No artworks found
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
              {searchQuery
                ? 'No matching creations match your current query. Try adjusting your keywords.'
                : 'Your generated artworks will automatically appear and persist here.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
