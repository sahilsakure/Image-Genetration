# Lumina AI Image Generator Studio

A complete, production-ready, fully interactive **AI Image Generator Web Application** built with Python (Flask), SQLAlchemy, SQLite, and vanilla modern JavaScript. Powered by Pollinations AI for unmetered, zero-cost high-resolution image synthesis.

---

## 1. Architectural Highlights

- **Zero-Credit-Waste Engine**: Synthesizes images using the Pollinations AI Flux diffusion cluster without requiring paid OpenAI or Stability API keys or credit cards.
- **Full Interactive Canvas**:
  - Auto-resizing prompt textarea with real-time character counting.
  - "Surprise Me" button with rotating curated creative concepts.
  - 8 distinct aesthetic style presets (Photorealistic, Anime, Cyberpunk, Cinematic, 3D Render, Oil Painting, Minimalist, Fantasy) with tailored prompt modifiers.
  - Aspect ratio switcher (1:1 Square, 16:9 Landscape, 9:16 Portrait) with dynamic dimension calculation.
  - Pulsing shimmer skeleton loader with stepped progress stages.
  - Full-screen lightbox zoom modal with pan/detail inspection.
  - Instant PNG downloads with sanitized timestamped naming (`sqrock-gen-YYYY-MM-DD.png`).
  - One-click copy prompt with animated toast notifications.
- **Creation History & Gallery**:
  - SQLite database persistence with `Flask-SQLAlchemy`.
  - Slide-out gallery drawer with real-time client-side keyword and style filtering without page reload.
  - "Reuse Prompt" functionality that restores historical parameters directly into the studio controls.
  - Database and disk deletion with instant DOM removal and status feedback.
- **Glassmorphic Design & Theming**:
  - Dark glassmorphic UI with CSS design tokens, subtle glows, and accessible WCAG contrast.
  - Seamless Dark/Light mode toggle with persistence in `localStorage`.
  - Mobile, tablet, and desktop responsive layouts.
  - Keyboard shortcut: <kbd>Ctrl</kbd> + <kbd>Enter</kbd> (or <kbd>Cmd</kbd> + <kbd>Enter</kbd>) to generate immediately.

---

## 2. Directory Structure

```text
ai_image_generator/
├── static/
│   ├── css/
│   │   └── style.css          # Design tokens, glassmorphism, animations
│   ├── js/
│   │   ├── app.js             # Studio canvas, generation pipeline, zoom modal
│   │   └── gallery.js         # Slide-out drawer, live search, deletion
│   └── generated/             # Stored synthesized binary PNGs
├── templates/
│   ├── base.html              # Base HTML5 layout with ambient lighting & theme
│   └── index.html             # Studio workspace, preview stage, drawer, modal
├── instance/
│   └── images.db              # SQLite database created automatically on first run
├── app.py                     # Flask application factory, REST endpoints
├── config.py                  # Presets, dimension mapping, upload folder configuration
├── models.py                  # SQLAlchemy GeneratedImage data model
├── requirements.txt           # Python production dependencies
└── README.md                  # Comprehensive setup & deployment guide
```

---

## 3. Local Development Setup

### Prerequisites
- Python 3.10 or higher
- `pip` package manager

### Installation Steps

1. **Clone or navigate into the directory**:
   ```bash
   cd ai_image_generator
   ```

2. **Create and activate a virtual environment**:
   ```bash
   # On macOS / Linux
   python3 -m venv venv
   source venv/bin/activate

   # On Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Launch the Flask application**:
   ```bash
   python app.py
   ```

5. **Open in your browser**:
   Navigate to `http://localhost:5000` to interact with the studio.

---

## 4. Cloud Deployment Guide

### Deploying to Render (Web Service)

1. Create a new **Web Service** on [Render](https://render.com/).
2. Connect your Git repository containing the `ai_image_generator` directory.
3. Configure the following settings:
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120`
4. Add Environment Variables (Optional):
   - `SECRET_KEY`: `your-secure-random-secret`
   - `DATABASE_URL`: (Defaults to local SQLite `instance/images.db` or connect PostgreSQL)
5. Deploy! Render will provision the service and provide a live public HTTPS URL.

### Deploying to PythonAnywhere

1. Log in to [PythonAnywhere](https://www.pythonanywhere.com/) and go to the **Web** tab.
2. Click **Add a new web app** and choose **Manual configuration (Python 3.10)**.
3. In the **Virtualenv** section, create and specify the path to your virtual environment:
   ```bash
   mkvirtualenv --python=/usr/bin/python3.10 lumina-venv
   pip install -r /home/<your-username>/ai_image_generator/requirements.txt
   ```
4. Edit the **WSGI configuration file** (`/var/www/<your-username>_pythonanywhere_com_wsgi.py`):
   ```python
   import sys
   import os

   project_home = '/home/<your-username>/ai_image_generator'
   if project_home not in sys.path:
       sys.path.insert(0, project_home)

   from app import app as application
   ```
5. In the **Static Files** section, add mappings:
   - URL: `/static/`
   - Directory: `/home/<your-username>/ai_image_generator/static/`
6. Click **Reload <your-username>.pythonanywhere.com**.

---

## 5. REST API Documentation

### 1. `POST /api/generate`
Generates a new artwork via Pollinations AI, saves the binary file to disk, and records metadata in SQLite.

**Request Payload:**
```json
{
  "prompt": "A bioluminescent octopus exploring an ancient underwater temple",
  "style": "Photorealistic",
  "aspect_ratio": "16:9",
  "negative_prompt": "blur, low resolution",
  "seed": 4829104
}
```

**Response (HTTP 201 Created):**
```json
{
  "success": true,
  "image": {
    "id": 1,
    "prompt": "A bioluminescent octopus exploring an ancient underwater temple",
    "enhanced_prompt": "A bioluminescent octopus exploring an ancient underwater temple, photorealistic, highly detailed 8k photography...",
    "style": "Photorealistic",
    "aspect_ratio": "16:9",
    "width": 1280,
    "height": 720,
    "seed": 4829104,
    "image_filename": "sqrock-gen-2026-09-09-1234.png",
    "image_url": "/static/generated/sqrock-gen-2026-09-09-1234.png",
    "created_at": "2026-09-09T12:34:56.789012",
    "formatted_date": "Sep 09, 2026 • 12:34"
  },
  "message": "Image generated and stored successfully."
}
```

### 2. `GET /api/history`
Retrieves past generation records with optional keyword search and style filtering.

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 50)
- `search` (optional keyword search against prompt text)
- `style` (optional style filter)

**Response (HTTP 200 OK):**
```json
{
  "success": true,
  "images": [ ... ],
  "total": 12,
  "page": 1,
  "limit": 50
}
```

### 3. `DELETE /api/history/<int:id>`
Permanently deletes the database record and removes the binary file from local storage.

**Response (HTTP 200 OK):**
```json
{
  "success": true,
  "id": 1,
  "message": "Image record and binary file deleted successfully."
}
```

### 4. `GET /api/download/<int:id>`
Streams the saved binary PNG as an attachment with sanitized headers:
`Content-Disposition: attachment; filename="sqrock-gen-2026-09-09-1.png"`

---

## 6. License
MIT License. Free for commercial and personal creative use.
