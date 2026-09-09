/**
 * Lumina AI - Gallery & Creation History Module (gallery.js)
 * Manages persistent creation history, live instant filtering,
 * card rendering, image downloads, prompt reuse, and database record deletions.
 */

class GalleryManager {
  constructor() {
    this.images = [];
    this.activeFilter = 'all';
    this.searchQuery = '';
    
    // DOM Elements
    this.drawer = document.getElementById('galleryDrawer');
    this.drawerBackdrop = document.getElementById('drawerBackdrop');
    this.openDrawerBtn = document.getElementById('galleryToggleBtn');
    this.closeDrawerBtn = document.getElementById('closeDrawerBtn');
    this.cardsGrid = document.getElementById('galleryCardsGrid');
    this.emptyState = document.getElementById('galleryEmptyState');
    this.totalBadge = document.getElementById('galleryTotalBadge');
    this.headerCount = document.getElementById('headerGalleryCount');
    this.searchInput = document.getElementById('gallerySearchInput');
    this.clearSearchBtn = document.getElementById('clearSearchBtn');
    this.filterPills = document.querySelectorAll('.filter-pill');

    this.init();
  }

  init() {
    this.bindEvents();
    this.fetchHistory();
  }

  bindEvents() {
    // Drawer Open/Close
    if (this.openDrawerBtn) {
      this.openDrawerBtn.addEventListener('click', () => this.openDrawer());
    }
    if (this.closeDrawerBtn) {
      this.closeDrawerBtn.addEventListener('click', () => this.closeDrawer());
    }
    if (this.drawerBackdrop) {
      this.drawerBackdrop.addEventListener('click', () => this.closeDrawer());
    }

    // Escape Key to close drawer
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.drawer && this.drawer.classList.contains('open')) {
        this.closeDrawer();
      }
    });

    // Search Input Live Filter
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        if (this.clearSearchBtn) {
          this.clearSearchBtn.style.display = this.searchQuery ? 'flex' : 'none';
        }
        this.filterAndRender();
      });
    }

    // Clear Search Button
    if (this.clearSearchBtn) {
      this.clearSearchBtn.addEventListener('click', () => {
        this.searchInput.value = '';
        this.searchQuery = '';
        this.clearSearchBtn.style.display = 'none';
        this.searchInput.focus();
        this.filterAndRender();
      });
    }

    // Category Filter Pills
    this.filterPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        this.filterPills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        this.activeFilter = pill.dataset.filter || 'all';
        this.filterAndRender();
      });
    });

    // Delegated actions for gallery cards (zoom, reuse, delete)
    if (this.cardsGrid) {
      this.cardsGrid.addEventListener('click', (e) => {
        const zoomBtn = e.target.closest('.btn-card-zoom');
        const reuseBtn = e.target.closest('.btn-card-reuse');
        const deleteBtn = e.target.closest('.btn-card-delete');

        if (zoomBtn) {
          const card = zoomBtn.closest('.gallery-card');
          const id = parseInt(card.dataset.id, 10);
          this.handleCardZoom(id);
        } else if (reuseBtn) {
          const card = reuseBtn.closest('.gallery-card');
          const id = parseInt(card.dataset.id, 10);
          this.handleCardReuse(id);
        } else if (deleteBtn) {
          const card = deleteBtn.closest('.gallery-card');
          const id = parseInt(card.dataset.id, 10);
          this.handleCardDelete(id, card);
        }
      });
    }
  }

  openDrawer() {
    if (this.drawer) {
      this.drawer.classList.add('open');
      this.drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (this.searchInput) {
        setTimeout(() => this.searchInput.focus(), 250);
      }
    }
  }

  closeDrawer() {
    if (this.drawer) {
      this.drawer.classList.remove('open');
      this.drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  async fetchHistory() {
    try {
      const response = await fetch('/api/history?limit=100');
      if (!response.ok) throw new Error('Failed to load creation history');
      const data = await response.json();
      if (data.success && Array.isArray(data.images)) {
        this.images = data.images;
        this.updateCounts(this.images.length);
        this.filterAndRender();
      }
    } catch (err) {
      console.warn('History fetch notice:', err.message);
    }
  }

  prependNewImage(imageRecord) {
    // Add new generation to local collection
    this.images.unshift(imageRecord);
    this.updateCounts(this.images.length);
    this.filterAndRender();
  }

  updateCounts(total) {
    if (this.totalBadge) {
      this.totalBadge.textContent = `${total} ${total === 1 ? 'artwork' : 'artworks'}`;
    }
    if (this.headerCount) {
      this.headerCount.textContent = total;
    }
  }

  filterAndRender() {
    if (!this.cardsGrid) return;

    const filtered = this.images.filter((img) => {
      // Style Filter
      const matchesStyle =
        this.activeFilter === 'all' ||
        img.style.toLowerCase() === this.activeFilter.toLowerCase();

      // Search Query Filter
      const matchesSearch =
        !this.searchQuery ||
        img.prompt.toLowerCase().includes(this.searchQuery) ||
        (img.enhanced_prompt && img.enhanced_prompt.toLowerCase().includes(this.searchQuery));

      return matchesStyle && matchesSearch;
    });

    if (filtered.length === 0) {
      this.cardsGrid.innerHTML = '';
      if (this.emptyState) this.emptyState.style.display = 'flex';
      return;
    }

    if (this.emptyState) this.emptyState.style.display = 'none';

    this.cardsGrid.innerHTML = filtered
      .map(
        (item) => `
        <article class="gallery-card" data-id="${item.id}" data-style="${this.escapeHtml(item.style)}" data-prompt="${this.escapeHtml(item.prompt)}">
            <div class="card-media-wrapper">
                <img src="${item.image_url}" alt="${this.escapeHtml(item.prompt)}" class="card-thumbnail" loading="lazy">
                <span class="card-style-badge">${this.escapeHtml(item.style)}</span>
                <span class="card-ratio-badge">${this.escapeHtml(item.aspect_ratio || '1:1')}</span>
                
                <div class="card-hover-actions">
                    <button type="button" class="card-btn-action btn-card-zoom" title="Zoom full screen" data-id="${item.id}">
                        <i data-lucide="maximize-2"></i>
                    </button>
                    <button type="button" class="card-btn-action btn-card-reuse" title="Reuse prompt in studio" data-id="${item.id}">
                        <i data-lucide="rotate-ccw"></i>
                    </button>
                    <a href="/api/download/${item.id}" class="card-btn-action btn-card-download" title="Download PNG" download>
                        <i data-lucide="download"></i>
                    </a>
                    <button type="button" class="card-btn-action btn-card-delete danger" title="Delete from history" data-id="${item.id}">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
            <div class="card-body">
                <p class="card-prompt" title="${this.escapeHtml(item.prompt)}">${this.escapeHtml(item.prompt)}</p>
                <div class="card-footer">
                    <span class="card-date">${this.escapeHtml(item.formatted_date || 'Saved')}</span>
                </div>
            </div>
        </article>
      `
      )
      .join('');

    // Re-initialize Lucide icons on newly inserted DOM elements
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  handleCardZoom(id) {
    const item = this.images.find((x) => x.id === id);
    if (!item) return;

    if (window.luminaApp && typeof window.luminaApp.openZoomModal === 'function') {
      window.luminaApp.openZoomModal(item);
    }
  }

  handleCardReuse(id) {
    const item = this.images.find((x) => x.id === id);
    if (!item) return;

    if (window.luminaApp && typeof window.luminaApp.populateStudioForm === 'function') {
      window.luminaApp.populateStudioForm(item);
      this.closeDrawer();
      if (window.luminaApp.showToast) {
        window.luminaApp.showToast('Historical settings loaded into studio canvas', 'info');
      }
    }
  }

  async handleCardDelete(id, cardElement) {
    if (!confirm('Are you sure you want to permanently delete this artwork?')) {
      return;
    }

    try {
      // Visual feedback: reduce opacity
      cardElement.style.opacity = '0.4';
      cardElement.style.pointerEvents = 'none';

      const response = await fetch(`/api/history/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete artwork');
      }

      // Smooth DOM removal
      cardElement.style.transition = 'all 0.3s ease';
      cardElement.style.transform = 'scale(0.85)';
      cardElement.style.opacity = '0';

      setTimeout(() => {
        // Remove from local memory list
        this.images = this.images.filter((img) => img.id !== id);
        this.updateCounts(this.images.length);
        this.filterAndRender();

        if (window.luminaApp && window.luminaApp.showToast) {
          window.luminaApp.showToast('Artwork permanently deleted', 'success');
        }
      }, 300);
    } catch (err) {
      cardElement.style.opacity = '1';
      cardElement.style.pointerEvents = 'auto';
      if (window.luminaApp && window.luminaApp.showToast) {
        window.luminaApp.showToast(err.message, 'error');
      } else {
        alert(err.message);
      }
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

// Instantiate on document ready
document.addEventListener('DOMContentLoaded', () => {
  window.galleryManager = new GalleryManager();
});
