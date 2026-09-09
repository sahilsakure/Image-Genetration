import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Middleware for parsing JSON requests
app.use(express.json({ limit: '16mb' }));

// Paths
const DATA_DIR = path.join(process.cwd(), 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');
const GENERATED_DIR = path.join(process.cwd(), 'public', 'generated');

// Ensure storage directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(GENERATED_DIR)) {
  fs.mkdirSync(GENERATED_DIR, { recursive: true });
}

// Preset definitions matching Python config.py
const STYLE_PRESETS: Record<string, string> = {
  Photorealistic: 'photorealistic, highly detailed 8k photography, hyperrealistic, studio lighting, canon eos r5, award-winning shot, sharp focus, natural depth of field',
  Anime: 'vibrant anime aesthetic, Makoto Shinkai and Studio Ghibli style, clean crisp lineart, glowing volumetric lighting, masterpiece, cel-shaded illustration',
  Cyberpunk: 'cyberpunk city style, neon drenched reflections, dark rainy aesthetic, holographic displays, high-tech dystopian atmosphere, cinematic lighting, 8k render',
  Cinematic: 'cinematic still from an IMAX movie, 35mm film grain, anamorphic lens flare, moody color grading, dramatic chiaroscuro composition, volumetric fog',
  '3D Render': 'stunning 3D octane render, Ray Tracing, Unreal Engine 5 aesthetic, photorealistic subsurface scattering, smooth clay and glass materials, clean ambient occlusion',
  'Oil Painting': 'classical oil on textured canvas, rich impasto brush strokes, expressive Rembrandt lighting, museum masterpiece, rich color blending, fine art texture',
  Minimalist: 'minimalist art style, clean elegant negative space, Bauhaus geometric harmony, subtle muted palette, contemporary vector simplicity, refined composition',
  Fantasy: 'epic high fantasy concept art, ethereal magical aura, enchanted particles, ArtStation trending, intricate Tolkien worldbuilding details, mystical atmosphere'
};

const ASPECT_RATIOS: Record<string, { width: number; height: number; label: string }> = {
  '1:1': { width: 1024, height: 1024, label: 'Square' },
  '16:9': { width: 1280, height: 720, label: 'Landscape' },
  '9:16': { width: 720, height: 1280, label: 'Portrait' }
};

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
  'An enchanted tea apothecary filled with hundreds of glowing herb jars, dried lavender bundles hanging from ceiling, gentle morning sunlight'
];

interface GeneratedImageRecord {
  id: number;
  prompt: string;
  enhanced_prompt: string;
  negative_prompt: string;
  style: string;
  aspect_ratio: string;
  width: number;
  height: number;
  seed: number;
  image_filename: string;
  image_url: string;
  created_at: string;
  formatted_date: string;
}

// Helper to read history
function readHistory(): GeneratedImageRecord[] {
  try {
    if (!fs.existsSync(HISTORY_FILE)) {
      return [];
    }
    const content = fs.readFileSync(HISTORY_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading history file:', err);
    return [];
  }
}

// Helper to save history
function writeHistory(records: GeneratedImageRecord[]): void {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(records, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing history file:', err);
  }
}

// Serve uploaded/generated images
app.use('/generated', express.static(GENERATED_DIR));

// API: Presets
app.get('/api/presets', (req, res) => {
  res.json({
    success: true,
    styles: Object.keys(STYLE_PRESETS),
    style_enhancements: STYLE_PRESETS,
    aspect_ratios: ASPECT_RATIOS,
    surprise_prompts: SURPRISE_PROMPTS
  });
});

// API: Generate Image
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, style = 'Photorealistic', aspect_ratio = '1:1', negative_prompt = '', seed: reqSeed } = req.body || {};

    const cleanPrompt = (prompt || '').trim();
    if (!cleanPrompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt cannot be empty. Please enter a visual concept.'
      });
    }

    const selectedStyle = STYLE_PRESETS[style] ? style : 'Photorealistic';
    const selectedRatio = ASPECT_RATIOS[aspect_ratio] ? aspect_ratio : '1:1';
    const dim = ASPECT_RATIOS[selectedRatio];

    const styleModifier = STYLE_PRESETS[selectedStyle] || '';
    const enhancedPrompt = styleModifier ? `${cleanPrompt}, ${styleModifier}` : cleanPrompt;

    let seed: number;
    if (reqSeed !== undefined && reqSeed !== null && !isNaN(Number(reqSeed))) {
      seed = Number(reqSeed);
    } else {
      seed = Math.floor(Math.random() * 999999999) + 1;
    }

    // Build Pollinations AI URL
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    let pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${dim.width}&height=${dim.height}&seed=${seed}&nologo=true&model=flux`;
    if (negative_prompt && negative_prompt.trim()) {
      pollinationsUrl += `&negative=${encodeURIComponent(negative_prompt.trim())}`;
    }

    console.log(`[API Generate] Requesting Pollinations image for prompt: "${cleanPrompt.slice(0, 40)}..."`);

    // Fetch image from Pollinations AI
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 65000);

    const response = await fetch(pollinationsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(502).json({
        success: false,
        error: `Inference endpoint returned HTTP status ${response.status}. Please try again shortly.`
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length < 500) {
      return res.status(502).json({
        success: false,
        error: 'Received empty or corrupted image data from inference engine.'
      });
    }

    // Save image to disk
    const now = new Date();
    const timestampStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const randomSalt = Math.floor(Math.random() * 9000) + 1000;
    const filename = `sqrock-gen-${timestampStr}-${randomSalt}.png`;
    const filePath = path.join(GENERATED_DIR, filename);

    fs.writeFileSync(filePath, buffer);

    const imageUrl = `/generated/${filename}`;

    // Read history, compute new ID, and append
    const history = readHistory();
    const nextId = history.length > 0 ? Math.max(...history.map((h) => h.id)) + 1 : 1;

    const formattedDate = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ' • ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

    const newRecord: GeneratedImageRecord = {
      id: nextId,
      prompt: cleanPrompt,
      enhanced_prompt: enhancedPrompt,
      negative_prompt: (negative_prompt || '').trim(),
      style: selectedStyle,
      aspect_ratio: selectedRatio,
      width: dim.width,
      height: dim.height,
      seed,
      image_filename: filename,
      image_url: imageUrl,
      created_at: now.toISOString(),
      formatted_date: formattedDate
    };

    history.unshift(newRecord);
    writeHistory(history);

    return res.status(201).json({
      success: true,
      image: newRecord,
      message: 'Image generated and stored successfully.'
    });
  } catch (err: any) {
    console.error('[API Generate Error]:', err);
    if (err.name === 'AbortError') {
      return res.status(504).json({
        success: false,
        error: 'Generation timed out while awaiting the AI inference engine. Please retry.'
      });
    }
    return res.status(500).json({
      success: false,
      error: `Generation error: ${err.message || String(err)}`
    });
  }
});

// API: History
app.get('/api/history', (req, res) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const searchQuery = ((req.query.search as string) || '').trim().toLowerCase();
    const styleFilter = ((req.query.style as string) || '').trim().toLowerCase();

    let records = readHistory();

    if (searchQuery) {
      records = records.filter(
        (r) =>
          r.prompt.toLowerCase().includes(searchQuery) ||
          r.enhanced_prompt.toLowerCase().includes(searchQuery)
      );
    }

    if (styleFilter && styleFilter !== 'all') {
      records = records.filter((r) => r.style.toLowerCase() === styleFilter);
    }

    const total = records.length;
    const startIndex = (page - 1) * limit;
    const paginated = records.slice(startIndex, startIndex + limit);

    res.json({
      success: true,
      images: paginated,
      total,
      page,
      limit
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API: Delete
app.delete('/api/history/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const history = readHistory();
    const target = history.find((h) => h.id === id);

    if (!target) {
      return res.status(404).json({ success: false, error: `Image record #${id} not found.` });
    }

    // Remove file if exists
    const filePath = path.join(GENERATED_DIR, target.image_filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (fileErr) {
        console.warn('Could not unlink file:', fileErr);
      }
    }

    const updated = history.filter((h) => h.id !== id);
    writeHistory(updated);

    res.json({
      success: true,
      id,
      message: 'Image record and binary file deleted successfully.'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API: Download binary file
app.get('/api/download/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const history = readHistory();
    const target = history.find((h) => h.id === id);

    if (!target) {
      return res.status(404).send('Image record not found.');
    }

    const filePath = path.join(GENERATED_DIR, target.image_filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Image file not found on server disk.');
    }

    const cleanDate = target.created_at.slice(0, 10);
    const downloadName = `sqrock-gen-${cleanDate}-${target.id}.png`;

    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
    res.setHeader('Content-Type', 'image/png');
    fs.createReadStream(filePath).pipe(res);
  } catch (err: any) {
    res.status(500).send(`Download error: ${err.message}`);
  }
});

// Start server with Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Lumina AI Image Generator Studio running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
