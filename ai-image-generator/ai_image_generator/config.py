import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

class Config:
    """Base application configuration."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'ai-studio-image-gen-secret-key-2026')
    
    # SQLite Database Configuration
    INSTANCE_DIR = BASE_DIR / 'instance'
    INSTANCE_DIR.mkdir(parents=True, exist_ok=True)
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        f'sqlite:///{INSTANCE_DIR / "images.db"}'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Generated Images Storage Directory
    UPLOAD_FOLDER = BASE_DIR / 'static' / 'generated'
    UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)
    
    # 16 MB max payload size
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024
    
    # Pollinations AI Endpoint Configuration
    POLLINATIONS_API_BASE = "https://image.pollinations.ai/prompt"
    DEFAULT_MODEL = "flux"
    
    # Aspect Ratio to Dimensions mapping
    ASPECT_RATIOS = {
        "1:1": {"width": 1024, "height": 1024, "label": "Square"},
        "16:9": {"width": 1280, "height": 720, "label": "Landscape"},
        "9:16": {"width": 720, "height": 1280, "label": "Portrait"}
    }
    
    # Style presets with expert prompt enhancements
    STYLE_PRESETS = {
        "Photorealistic": "photorealistic, highly detailed 8k photography, hyperrealistic, studio lighting, canon eos r5, award-winning shot, sharp focus, natural depth of field",
        "Anime": "vibrant anime aesthetic, Makoto Shinkai and Studio Ghibli style, clean crisp lineart, glowing volumetric lighting, masterpiece, cel-shaded illustration",
        "Cyberpunk": "cyberpunk city style, neon drenched reflections, dark rainy aesthetic, holographic displays, high-tech dystopian atmosphere, cinematic lighting, 8k render",
        "Cinematic": "cinematic still from an IMAX movie, 35mm film grain, anamorphic lens flare, moody color grading, dramatic chiaroscuro composition, volumetric fog",
        "3D Render": "stunning 3D octane render, Ray Tracing, Unreal Engine 5 aesthetic, photorealistic subsurface scattering, smooth clay and glass materials, clean ambient occlusion",
        "Oil Painting": "classical oil on textured canvas, rich impasto brush strokes, expressive Rembrandt lighting, museum masterpiece, rich color blending, fine art texture",
        "Minimalist": "minimalist art style, clean elegant negative space, Bauhaus geometric harmony, subtle muted palette, contemporary vector simplicity, refined composition",
        "Fantasy": "epic high fantasy concept art, ethereal magical aura, enchanted particles, ArtStation trending, intricate Tolkien worldbuilding details, mystical atmosphere"
    }
    
    # Curated expert prompts for "Surprise Me"
    SURPRISE_PROMPTS = [
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
    ]
