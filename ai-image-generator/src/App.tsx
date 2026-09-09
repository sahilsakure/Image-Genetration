import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { StudioControls } from './components/StudioControls';
import { PreviewStage } from './components/PreviewStage';
import { GalleryDrawer } from './components/GalleryDrawer';
import { ZoomModal } from './components/ZoomModal';
import { ToastContainer } from './components/ToastContainer';
import {
  GeneratedImageRecord,
  StylePresetName,
  AspectRatioType,
  ToastMessage,
} from './types';

const SURPRISE_PROMPTS = [
  'A hyper-detailed mechanical cybernetic fox wandering through a neon-lit rain-slicked Tokyo alley, chrome reflections, vibrant cyberpunk tones',
  'A bioluminescent jellyfish floating gracefully through an ancient submerged gothic cathedral, ethereal cyan and magenta light rays, underwater photography',
  'An ancient cozy library nested inside the hollow of a gigantic glowing redwood tree, spiral wooden staircases, floating golden dust motes, warm fireplace',
  'A futuristic solar-punk greenhouse conservatory perched on a cliff above cloud oceans, glass domes, lush hanging gardens, golden sunrise light',
  'A majestic samurai cat wearing ornate gilded lacquered armor standing in a tranquil cherry blossom blizzard, ukiyo-e woodblock inspired',
  'A surreal hourglass on an infinite obsidian beach where nebulae and galaxies pour like cosmic sand between glass chambers, star dust',
  'A whimsical miniature steampunk airship floating over a cup of swirling chamomile tea, brass gears, tiny glowing portholes, macro photography',
  'An astronaut discovering a crystalline alien garden on an asteroid, violet prism reflections, high contrast cosmic backdrop, deep space explorer',
  'A mythical phoenix woven entirely from swirling autumn leaves and molten golden light ascending into a dusk sky, cinematic wide angle',
  'An enchanted tea apothecary filled with hundreds of glowing herb jars, dried lavender bundles hanging from ceiling, gentle morning sunlight',
];

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('lumina-theme') as 'dark' | 'light') || 'dark';
  });

  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<StylePresetName>('Photorealistic');
  const [selectedRatio, setSelectedRatio] = useState<AspectRatioType>('1:1');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [seed, setSeed] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [progressStep, setProgressStep] = useState({
    main: 'Crafting neural canvas...',
    sub: 'Initializing diffusion seeds with Flux',
  });

  const [currentArtwork, setCurrentArtwork] = useState<GeneratedImageRecord | null>(null);
  const [history, setHistory] = useState<GeneratedImageRecord[]>([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [zoomedArtwork, setZoomedArtwork] = useState<GeneratedImageRecord | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const progressIntervalRef = useRef<any>(null);

  // Sync theme class on HTML element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('lumina-theme', theme);
  }, [theme]);

  // Load initial history
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history?limit=100');
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.images)) {
        setHistory(data.images);
        if (data.images.length > 0 && !currentArtwork) {
          setCurrentArtwork(data.images[0]);
        }
      }
    } catch (err) {
      console.warn('Initial history fetch notice:', err);
    }
  };

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const handleToggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    showToast(`Switched to ${next} theme`, 'info');
  };

  const handleSurpriseMe = () => {
    const randomIndex = Math.floor(Math.random() * SURPRISE_PROMPTS.length);
    setPrompt(SURPRISE_PROMPTS[randomIndex]);
    showToast('Injected creative surprise prompt', 'info');
  };

  const handleRandomizeSeed = () => {
    const r = Math.floor(Math.random() * 999999999) + 1;
    setSeed(String(r));
    showToast(`Seed set to ${r}`, 'info');
  };

  const handleGenerate = async () => {
    if (isGenerating) return;

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      showToast('Please enter a concept prompt before generating.', 'error');
      return;
    }

    setIsGenerating(true);

    const steps = [
      { main: 'Crafting neural canvas...', sub: 'Initializing diffusion seeds with Flux' },
      { main: 'Rendering lighting & geometry...', sub: 'Synthesizing high-frequency prompt features' },
      { main: 'Applying style aesthetics...', sub: `Refining palette for ${selectedStyle}` },
      { main: 'Finalizing rasterization...', sub: 'Assembling lossless pixels for output' },
    ];

    let stepIndex = 0;
    setProgressStep(steps[0]);

    clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = setInterval(() => {
      stepIndex = (stepIndex + 1) % steps.length;
      setProgressStep(steps[stepIndex]);
    }, 2800);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          prompt: trimmedPrompt,
          style: selectedStyle,
          aspect_ratio: selectedRatio,
          negative_prompt: negativePrompt.trim(),
          seed: seed.trim() ? parseInt(seed.trim(), 10) : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || `Inference error: HTTP status ${response.status}`);
      }

      setCurrentArtwork(result.image);
      setHistory((prev) => [result.image, ...prev.filter((i) => i.id !== result.image.id)]);
      showToast('Artwork synthesized successfully!', 'success');
    } catch (err: any) {
      console.error('Generation failure:', err);
      showToast(err.message || 'Generation failed. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
      clearInterval(progressIntervalRef.current);
    }
  };

  const handleReusePrompt = (item: GeneratedImageRecord) => {
    setPrompt(item.prompt);
    if (item.style) setSelectedStyle(item.style as StylePresetName);
    if (item.aspect_ratio) setSelectedRatio(item.aspect_ratio as AspectRatioType);
    if (item.negative_prompt) setNegativePrompt(item.negative_prompt);
    if (item.seed) setSeed(String(item.seed));
    setIsGalleryOpen(false);
    showToast('Historical settings loaded into studio canvas', 'info');
  };

  const handleDeleteImage = async (id: number) => {
    try {
      const res = await fetch(`/api/history/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete record');
      }

      setHistory((prev) => prev.filter((item) => item.id !== id));
      if (currentArtwork?.id === id) {
        setCurrentArtwork(null);
      }
      if (zoomedArtwork?.id === id) {
        setZoomedArtwork(null);
      }
      showToast('Artwork permanently deleted', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error deleting artwork', 'error');
    }
  };

  const handleDownload = (id?: number) => {
    const targetId = id || currentArtwork?.id;
    if (!targetId) return;

    const downloadUrl = `/api/download/${targetId}`;
    const cleanDate = new Date().toISOString().split('T')[0];
    const filename = `sqrock-gen-${cleanDate}.png`;

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    showToast('Downloading high-resolution artwork...', 'info');
  };

  const handleCopyPrompt = async (textToCopy?: string) => {
    const targetText =
      textToCopy ||
      currentArtwork?.enhanced_prompt ||
      currentArtwork?.prompt ||
      prompt;

    if (!targetText) return;

    try {
      await navigator.clipboard.writeText(targetText);
      showToast('Enhanced prompt copied to clipboard!', 'success');
    } catch {
      const el = document.createElement('textarea');
      el.value = targetText;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      showToast('Prompt copied to clipboard!', 'success');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0c10] text-slate-900 dark:text-white transition-colors duration-200 relative overflow-x-hidden font-['Plus_Jakarta_Sans']">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-24 left-1/4 w-[500px] h-[500px] rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 blur-[120px]" />
        <div className="absolute top-1/3 -right-24 w-[450px] h-[450px] rounded-full bg-purple-500/10 dark:bg-purple-500/15 blur-[120px]" />
        <div className="absolute -bottom-24 left-1/3 w-[400px] h-[400px] rounded-full bg-pink-500/10 dark:bg-pink-500/10 blur-[120px]" />
      </div>

      {/* App Header */}
      <Header
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenGallery={() => setIsGalleryOpen(true)}
        galleryCount={history.length}
      />

      {/* Main Workspace Layout */}
      <main className="relative z-10 max-w-[1560px] mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[480px_1fr] gap-6 items-start">
          {/* Left Column: Generation Studio Form */}
          <StudioControls
            prompt={prompt}
            onPromptChange={setPrompt}
            selectedStyle={selectedStyle}
            onSelectStyle={setSelectedStyle}
            selectedRatio={selectedRatio}
            onSelectRatio={setSelectedRatio}
            negativePrompt={negativePrompt}
            onNegativePromptChange={setNegativePrompt}
            seed={seed}
            onSeedChange={setSeed}
            onRandomizeSeed={handleRandomizeSeed}
            onSurpriseMe={handleSurpriseMe}
            onClearPrompt={() => setPrompt('')}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />

          {/* Right Column: Interactive Canvas Viewport */}
          <PreviewStage
            currentArtwork={currentArtwork}
            isGenerating={isGenerating}
            progressStep={progressStep}
            onOpenZoom={(art) => setZoomedArtwork(art)}
            onDownload={() => handleDownload()}
            onCopyPrompt={() => handleCopyPrompt()}
            onQuickTagClick={(tagText) => setPrompt(tagText)}
          />
        </div>
      </main>

      {/* Creation History Gallery Drawer */}
      <GalleryDrawer
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        images={history}
        onOpenZoom={(art) => setZoomedArtwork(art)}
        onReusePrompt={handleReusePrompt}
        onDeleteImage={handleDeleteImage}
      />

      {/* Fullscreen Lightbox Zoom Modal */}
      <ZoomModal
        artwork={zoomedArtwork}
        onClose={() => setZoomedArtwork(null)}
        onCopyPrompt={handleCopyPrompt}
        onDownload={(id) => handleDownload(id)}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} />
    </div>
  );
}
