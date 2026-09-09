/**
 * Lumina AI - Core Application Logic (app.js)
 * Coordinates generation pipeline, interactive studio controls,
 * image preview rendering, lightbox modal, themes, and clipboard notifications.
 */

class LuminaApp {
  constructor() {
    this.currentArtwork = null;
    this.isGenerating = false;
    this.selectedStyle = 'Photorealistic';
    this.selectedRatio = '1:1';
    this.progressInterval = null;

    // Expertly curated surprise prompts collection
    this.surprisePrompts = [
      "A hyper-detailed mechanical cybernetic fox wandering through a neon-lit rain-slicked Tokyo alley, chrome reflections, vibrant cyberpunk tones",
      "A bioluminescent jellyfish floating gracefully through an ancient submerged gothic cathedral, ethereal cyan and magenta light rays, underwater photography",
      "An ancient cozy library nested inside the hollow of a gigantic glowing redwood tree, spiral wooden staircases, floating golden dust motes, warm fireplace",
      "A futuristic solar-punk greenhouse conservatory perched on a cliff above cloud oceans, glass domes, lush hanging gardens, golden sunrise light",
      "A majestic samurai cat wearing ornate gilded lacquered armor standing in a tranquil cherry blossom blizzard, ukiyo-e woodblock inspired",
      "A surreal hourglass on an infinite obsidian beach where nebulae and galaxies pour like cosmic sand between glass chambers, star dust",
      "A whimsical miniature steampunk airship floating over a cup of swirling chamomile tea, brass gears, tiny glowing portholes, macro photography",
      "An astronaut discovering a crystalline alien garden on an asteroid, violet prism reflections, high contrast cosmic backdrop, deep space explorer",
      "A mythical phoenix woven entirely from swirling autumn leaves and molten golden light ascending into a dusk sky, cinematic wide angle",
      "An enchanted tea apothecary filled with hundreds of glowing herb jars, dried lavender bundles hanging from ceiling, gentle morning sunlight"
    ];

    this.cacheDom();
    this.initTheme();
    this.bindEvents();
    this.initLucide();
  }

  cacheDom() {
    // Inputs & Buttons
    this.promptInput = document.getElementById('promptInput');
    this.charCounter = document.getElementById('charCounter');
    this.clearPromptBtn = document.getElementById('clearPromptBtn');
    this.surprisePromptBtn = document.getElementById('surprisePromptBtn');
    this.generateBtn = document.getElementById('generateBtn');
    this.generateBtnText = document.getElementById('generateBtnText');
    this.stylePills = document.querySelectorAll('.style-pill');
    this.ratioBtns = document.querySelectorAll('.ratio-btn');
    this.activeStyleIndicator = document.getElementById('activeStyleIndicator');
    this.activeRatioIndicator = document.getElementById('activeRatioIndicator');
    this.negativePromptInput = document.getElementById('negativePromptInput');
    this.seedInput = document.getElementById('seedInput');
    this.randomSeedBtn = document.getElementById('randomSeedBtn');

    // Preview Viewport Elements
    this.previewStage = document.getElementById('previewStageContainer');
    this.emptyState = document.getElementById('emptyPreviewState');
    this.skeletonLoader = document.getElementById('skeletonLoader');
    this.progressStatusText = document.getElementById('progressStatusText');
    this.progressSubText = document.getElementById('progressSubText');
    this.renderedWrapper = document.getElementById('renderedImageWrapper');
    this.renderedImg = document.getElementById('renderedImage');
    this.previewStatusBadge = document.getElementById('previewStatusBadge');
    this.previewActionsBar = document.getElementById('previewActionsBar');
    this.previewResolutionBadge = document.getElementById('previewResolutionBadge');
    this.renderedMetaCard = document.getElementById('renderedMetaCard');

    // Metadata inspector items
    this.metaStyleValue = document.getElementById('metaStyleValue');
    this.metaRatioValue = document.getElementById('metaRatioValue');
    this.metaSeedValue = document.getElementById('metaSeedValue');
    this.metaDateValue = document.getElementById('metaDateValue');
    this.metaPromptValue = document.getElementById('metaPromptValue');

    // Action Buttons
    this.copyPromptBtn = document.getElementById('copyPromptBtn');
    this.zoomImageBtn = document.getElementById('zoomImageBtn');
    this.downloadImageBtn = document.getElementById('downloadImageBtn');
    this.overlayZoomBtn = document.getElementById('overlayZoomBtn');
    this.overlayDownloadBtn = document.getElementById('overlayDownloadBtn');

    // Lightbox Modal Elements
    this.zoomModal = document.getElementById('zoomModal');
    this.modalBackdrop = document.getElementById('modalBackdrop');
    this.closeModalBtn = document.getElementById('closeModalBtn');
    this.modalImage = document.getElementById('modalImage');
    this.modalPromptText = document.getElementById('modalPromptText');
    this.modalStyleBadge = document.getElementById('modalStyleBadge');
    this.modalTimestamp = document.getElementById('modalTimestamp');
    this.modalDimensionsChip = document.getElementById('modalDimensionsChip');
    this.modalSeedChip = document.getElementById('modalSeedChip');
    this.modalCopyBtn = document.getElementById('modalCopyBtn');
    this.modalDownloadBtn = document.getElementById('modalDownloadBtn');

    // Global
    this.themeToggleBtn = document.getElementById('themeToggleBtn');
    this.toastContainer = document.getElementById('toastContainer');
    this.quickTags = document.querySelectorAll('.quick-tag');
  }

  initLucide() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  initTheme() {
    const savedTheme = localStorage.getItem('lumina-theme') || 'dark';
    this.applyTheme(savedTheme);
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = theme === 'dark' ? 'theme-dark' : 'theme-light';
    localStorage.setItem('lumina-theme', theme);
    this.initLucide();
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(nextTheme);
    this.showToast(`Switched to ${nextTheme} theme`, 'info');
  }

  bindEvents() {
    // Theme Toggle
    if (this.themeToggleBtn) {
      this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
    }

    // Prompt Textarea: Auto-Resize & Character Counter
    if (this.promptInput) {
      this.promptInput.addEventListener('input', () => {
        this.updateCharCounter();
        this.autoResizeTextarea(this.promptInput);
      });

      // Keyboard Shortcut: Ctrl + Enter / Cmd + Enter inside prompt box
      this.promptInput.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          this.handleGenerate();
        }
      });
    }

    // Clear Prompt Button
    if (this.clearPromptBtn) {
      this.clearPromptBtn.addEventListener('click', () => {
        if (this.promptInput) {
          this.promptInput.value = '';
          this.updateCharCounter();
          this.autoResizeTextarea(this.promptInput);
          this.promptInput.focus();
        }
      });
    }

    // Surprise Me Prompt Button
    if (this.surprisePromptBtn) {
      this.surprisePromptBtn.addEventListener('click', () => this.injectSurprisePrompt());
    }

    // Quick Tag Clicks in Empty State
    this.quickTags.forEach((tag) => {
      tag.addEventListener('click', () => {
        const text = tag.dataset.tag || tag.textContent;
        if (this.promptInput) {
          this.promptInput.value = text;
          this.updateCharCounter();
          this.autoResizeTextarea(this.promptInput);
          this.promptInput.focus();
        }
      });
    });

    // Style Pills Selection
    this.stylePills.forEach((pill) => {
      pill.addEventListener('click', () => {
        this.stylePills.forEach((p) => {
          p.classList.remove('active');
          p.setAttribute('aria-checked', 'false');
        });
        pill.classList.add('active');
        pill.setAttribute('aria-checked', 'true');
        this.selectedStyle = pill.dataset.style || 'Photorealistic';
        if (this.activeStyleIndicator) {
          this.activeStyleIndicator.textContent = this.selectedStyle;
        }
      });
    });

    // Aspect Ratio Toggles
    this.ratioBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.ratioBtns.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-checked', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-checked', 'true');
        this.selectedRatio = btn.dataset.ratio || '1:1';
        
        const labels = {
          '1:1': '1024 × 1024 (1:1)',
          '16:9': '1280 × 720 (16:9)',
          '9:16': '720 × 1280 (9:16)'
        };
        if (this.activeRatioIndicator) {
          this.activeRatioIndicator.textContent = labels[this.selectedRatio] || this.selectedRatio;
        }
      });
    });

    // Randomize Seed Button
    if (this.randomSeedBtn) {
      this.randomSeedBtn.addEventListener('click', () => {
        const randomSeed = Math.floor(Math.random() * 999999999) + 1;
        if (this.seedInput) {
          this.seedInput.value = randomSeed;
          this.showToast(`Seed set to ${randomSeed}`, 'info');
        }
      });
    }

    // Generate Button Click
    if (this.generateBtn) {
      this.generateBtn.addEventListener('click', () => this.handleGenerate());
    }

    // Image Zoom Click
    if (this.renderedImg) {
      this.renderedImg.addEventListener('click', () => {
        if (this.currentArtwork) this.openZoomModal(this.currentArtwork);
      });
    }
    if (this.zoomImageBtn) {
      this.zoomImageBtn.addEventListener('click', () => {
        if (this.currentArtwork) this.openZoomModal(this.currentArtwork);
      });
    }
    if (this.overlayZoomBtn) {
      this.overlayZoomBtn.addEventListener('click', () => {
        if (this.currentArtwork) this.openZoomModal(this.currentArtwork);
      });
    }

    // Download Button Click
    if (this.downloadImageBtn) {
      this.downloadImageBtn.addEventListener('click', () => this.triggerDownload());
    }
    if (this.overlayDownloadBtn) {
      this.overlayDownloadBtn.addEventListener('click', () => this.triggerDownload());
    }

    // Copy Prompt Button Click
    if (this.copyPromptBtn) {
      this.copyPromptBtn.addEventListener('click', () => this.copyCurrentPrompt());
    }

    // Lightbox Modal Controls
    if (this.closeModalBtn) {
      this.closeModalBtn.addEventListener('click', () => this.closeZoomModal());
    }
    if (this.modalBackdrop) {
      this.modalBackdrop.addEventListener('click', () => this.closeZoomModal());
    }
    if (this.modalCopyBtn) {
      this.modalCopyBtn.addEventListener('click', () => this.copyCurrentPrompt());
    }
    if (this.modalDownloadBtn) {
      this.modalDownloadBtn.addEventListener('click', () => this.triggerDownload());
    }

    // Modal Escape Key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.zoomModal && this.zoomModal.classList.contains('open')) {
        this.closeZoomModal();
      }
    });
  }

  updateCharCounter() {
    if (!this.promptInput || !this.charCounter) return;
    const count = this.promptInput.value.length;
    this.charCounter.textContent = `${count} / 1000`;
  }

  autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.max(96, Math.min(240, textarea.scrollHeight)) + 'px';
  }

  injectSurprisePrompt() {
    const randomIndex = Math.floor(Math.random() * this.surprisePrompts.length);
    const chosenPrompt = this.surprisePrompts[randomIndex];
    if (this.promptInput) {
      this.promptInput.value = chosenPrompt;
      this.updateCharCounter();
      this.autoResizeTextarea(this.promptInput);
      this.promptInput.focus();
      this.showToast('Injected creative surprise prompt', 'info');
    }
  }

  populateStudioForm(artwork) {
    if (!artwork) return;
    if (this.promptInput) {
      this.promptInput.value = artwork.prompt || '';
      this.updateCharCounter();
      this.autoResizeTextarea(this.promptInput);
      this.promptInput.focus();
    }

    // Select Style Pill
    if (artwork.style) {
      this.stylePills.forEach((pill) => {
        if (pill.dataset.style.toLowerCase() === artwork.style.toLowerCase()) {
          pill.click();
        }
      });
    }

    // Select Aspect Ratio
    if (artwork.aspect_ratio) {
      this.ratioBtns.forEach((btn) => {
        if (btn.dataset.ratio === artwork.aspect_ratio) {
          btn.click();
        }
      });
    }

    // Negative Prompt & Seed
    if (this.negativePromptInput) {
      this.negativePromptInput.value = artwork.negative_prompt || '';
    }
    if (this.seedInput && artwork.seed) {
      this.seedInput.value = artwork.seed;
    }
  }

  async handleGenerate() {
    if (this.isGenerating) return;

    const rawPrompt = this.promptInput ? this.promptInput.value.trim() : '';
    if (!rawPrompt) {
      this.showToast('Please enter a concept prompt before generating.', 'error');
      if (this.promptInput) this.promptInput.focus();
      return;
    }

    const payload = {
      prompt: rawPrompt,
      style: this.selectedStyle,
      aspect_ratio: this.selectedRatio,
      negative_prompt: this.negativePromptInput ? this.negativePromptInput.value.trim() : '',
      seed: this.seedInput && this.seedInput.value.trim() ? parseInt(this.seedInput.value.trim(), 10) : null
    };

    this.startGeneratingState();

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || `Generation failed with HTTP status ${response.status}`);
      }

      this.currentArtwork = result.image;
      this.renderFinishedArtwork(result.image);

      // Prepend to Gallery Drawer
      if (window.galleryManager && typeof window.galleryManager.prependNewImage === 'function') {
        window.galleryManager.prependNewImage(result.image);
      }

      this.showToast('Artwork synthesized successfully!', 'success');
    } catch (err) {
      console.error('Generation Error:', err);
      this.revertToPreviousState();
      this.showToast(err.message || 'Error occurred during generation. Please try again.', 'error');
    } finally {
      this.stopGeneratingState();
    }
  }

  startGeneratingState() {
    this.isGenerating = true;

    // Button states
    if (this.generateBtn) {
      this.generateBtn.disabled = true;
      if (this.generateBtnText) this.generateBtnText.textContent = 'Rendering...';
    }

    // Viewport states
    if (this.emptyState) this.emptyState.style.display = 'none';
    if (this.renderedWrapper) this.renderedWrapper.style.display = 'none';
    if (this.skeletonLoader) this.skeletonLoader.style.display = 'flex';
    if (this.previewActionsBar) this.previewActionsBar.style.display = 'none';
    if (this.renderedMetaCard) this.renderedMetaCard.style.display = 'none';
    if (this.previewStatusBadge) {
      this.previewStatusBadge.textContent = 'Synthesizing';
      this.previewStatusBadge.classList.add('active');
    }

    // Stepped progress text animation
    const steps = [
      { main: 'Crafting neural canvas...', sub: 'Initializing diffusion seeds with Flux' },
      { main: 'Rendering lighting & geometry...', sub: 'Synthesizing high-frequency prompt features' },
      { main: 'Applying style aesthetics...', sub: `Refining palette for ${this.selectedStyle}` },
      { main: 'Finalizing rasterization...', sub: 'Assembling lossless pixels for output' }
    ];

    let currentStep = 0;
    if (this.progressStatusText) this.progressStatusText.textContent = steps[0].main;
    if (this.progressSubText) this.progressSubText.textContent = steps[0].sub;

    clearInterval(this.progressInterval);
    this.progressInterval = setInterval(() => {
      currentStep = (currentStep + 1) % steps.length;
      if (this.progressStatusText) this.progressStatusText.textContent = steps[currentStep].main;
      if (this.progressSubText) this.progressSubText.textContent = steps[currentStep].sub;
    }, 2800);
  }

  stopGeneratingState() {
    this.isGenerating = false;
    clearInterval(this.progressInterval);

    if (this.generateBtn) {
      this.generateBtn.disabled = false;
      if (this.generateBtnText) this.generateBtnText.textContent = 'Generate Artwork';
    }
    if (this.skeletonLoader) this.skeletonLoader.style.display = 'none';
    if (this.previewStatusBadge) {
      this.previewStatusBadge.classList.remove('active');
    }
  }

  revertToPreviousState() {
    if (this.currentArtwork) {
      this.renderFinishedArtwork(this.currentArtwork);
    } else {
      if (this.emptyState) this.emptyState.style.display = 'flex';
      if (this.previewStatusBadge) this.previewStatusBadge.textContent = 'Standby';
    }
  }

  renderFinishedArtwork(artwork) {
    if (!artwork || !artwork.image_url) return;

    if (this.renderedImg) {
      this.renderedImg.src = artwork.image_url;
      this.renderedImg.alt = artwork.prompt;
    }

    if (this.emptyState) this.emptyState.style.display = 'none';
    if (this.skeletonLoader) this.skeletonLoader.style.display = 'none';
    if (this.renderedWrapper) this.renderedWrapper.style.display = 'flex';
    if (this.previewActionsBar) this.previewActionsBar.style.display = 'flex';
    if (this.renderedMetaCard) this.renderedMetaCard.style.display = 'flex';

    if (this.previewResolutionBadge) {
      this.previewResolutionBadge.textContent = `${artwork.width} × ${artwork.height} (${artwork.aspect_ratio})`;
    }
    if (this.previewStatusBadge) {
      this.previewStatusBadge.textContent = 'Ready';
    }

    // Inspector fields
    if (this.metaStyleValue) this.metaStyleValue.textContent = artwork.style;
    if (this.metaRatioValue) this.metaRatioValue.textContent = artwork.aspect_ratio;
    if (this.metaSeedValue) this.metaSeedValue.textContent = artwork.seed || 'Auto';
    if (this.metaDateValue) this.metaDateValue.textContent = artwork.formatted_date || 'Just now';
    if (this.metaPromptValue) this.metaPromptValue.textContent = artwork.enhanced_prompt || artwork.prompt;

    this.initLucide();
  }

  openZoomModal(artwork) {
    if (!artwork || !this.zoomModal) return;

    if (this.modalImage) {
      this.modalImage.src = artwork.image_url;
      this.modalImage.alt = artwork.prompt;
    }
    if (this.modalPromptText) {
      this.modalPromptText.textContent = artwork.enhanced_prompt || artwork.prompt;
    }
    if (this.modalStyleBadge) {
      this.modalStyleBadge.textContent = artwork.style;
    }
    if (this.modalTimestamp) {
      this.modalTimestamp.textContent = artwork.formatted_date || 'Created recently';
    }
    if (this.modalDimensionsChip) {
      this.modalDimensionsChip.textContent = `${artwork.width} × ${artwork.height} (${artwork.aspect_ratio})`;
    }
    if (this.modalSeedChip) {
      this.modalSeedChip.textContent = `Seed: ${artwork.seed || 'Auto'}`;
    }

    this.zoomModal.classList.add('open');
    this.zoomModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    this.initLucide();
  }

  closeZoomModal() {
    if (!this.zoomModal) return;
    this.zoomModal.classList.remove('open');
    this.zoomModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  async copyCurrentPrompt() {
    if (!this.currentArtwork) return;
    const textToCopy = this.currentArtwork.enhanced_prompt || this.currentArtwork.prompt;
    try {
      await navigator.clipboard.writeText(textToCopy);
      this.showToast('Enhanced prompt copied to clipboard!', 'success');
    } catch (err) {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showToast('Prompt copied to clipboard!', 'success');
    }
  }

  triggerDownload() {
    if (!this.currentArtwork) return;
    const downloadUrl = `/api/download/${this.currentArtwork.id}`;
    const cleanDate = new Date().toISOString().split('T')[0];
    const filename = `sqrock-gen-${cleanDate}.png`;

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    this.showToast('Downloading high-resolution artwork...', 'info');
  }

  showToast(message, type = 'info') {
    if (!this.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');

    const icons = {
      success: '<i data-lucide="check-circle" class="toast-icon"></i>',
      error: '<i data-lucide="alert-circle" class="toast-icon"></i>',
      info: '<i data-lucide="info" class="toast-icon"></i>'
    };

    toast.innerHTML = `
      ${icons[type] || icons.info}
      <span class="toast-message">${this.escapeHtml(message)}</span>
    `;

    this.toastContainer.appendChild(toast);
    this.initLucide();

    setTimeout(() => {
      toast.classList.add('toast-out');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 250);
    }, 3500);
  }

  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

// Instantiate on document load
document.addEventListener('DOMContentLoaded', () => {
  window.luminaApp = new LuminaApp();
});
