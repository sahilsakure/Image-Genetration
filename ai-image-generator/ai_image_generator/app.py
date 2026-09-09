import os
import random
import re
import time
import urllib.parse
from datetime import datetime
from pathlib import Path

import requests
from flask import (
    Flask,
    jsonify,
    render_template,
    request,
    send_file,
    send_from_directory,
    abort
)

from config import Config
from models import db, GeneratedImage

def create_app(config_class=Config):
    """Flask Application Factory with database and directory setup."""
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize SQLAlchemy database
    db.init_app(app)
    
    # Ensure generated images storage folder exists
    Config.UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)
    
    # Initialize database tables
    with app.app_context():
        db.create_all()
        
    @app.route('/')
    def index():
        """Render main interactive AI image generation studio with initial gallery items."""
        initial_images = GeneratedImage.query.order_by(GeneratedImage.created_at.desc()).limit(24).all()
        initial_records = [img.to_dict() for img in initial_images]
        return render_template(
            'index.html',
            initial_records=initial_records,
            styles=list(Config.STYLE_PRESETS.keys()),
            aspect_ratios=Config.ASPECT_RATIOS,
            surprise_prompts=Config.SURPRISE_PROMPTS
        )

    @app.route('/api/presets', methods=['GET'])
    def get_presets():
        """Retrieve preset styles, dimensions, and creative prompt ideas."""
        return jsonify({
            'success': True,
            'styles': list(Config.STYLE_PRESETS.keys()),
            'style_enhancements': Config.STYLE_PRESETS,
            'aspect_ratios': Config.ASPECT_RATIOS,
            'surprise_prompts': Config.SURPRISE_PROMPTS
        })

    @app.route('/api/generate', methods=['POST'])
    def generate_image():
        """
        Accepts JSON { prompt, style, aspect_ratio, negative_prompt }
        Fetches the image via Pollinations AI pipeline, validates the stream,
        persists the binary image to disk, records metadata in SQLite,
        and returns the complete image payload.
        """
        try:
            data = request.get_json(silent=True) or {}
            raw_prompt = data.get('prompt', '').strip()
            if not raw_prompt:
                return jsonify({
                    'success': False,
                    'error': 'Prompt cannot be empty. Please enter a creative concept.'
                }), 400

            style = data.get('style', 'Photorealistic')
            if style not in Config.STYLE_PRESETS:
                style = 'Photorealistic'

            aspect_ratio = data.get('aspect_ratio', '1:1')
            if aspect_ratio not in Config.ASPECT_RATIOS:
                aspect_ratio = '1:1'

            negative_prompt = data.get('negative_prompt', '').strip()
            
            # Dimensions based on aspect ratio
            dim_config = Config.ASPECT_RATIOS[aspect_ratio]
            width = dim_config['width']
            height = dim_config['height']

            # Enhance prompt with expert style modifiers
            style_modifier = Config.STYLE_PRESETS.get(style, '')
            enhanced_prompt = f"{raw_prompt}, {style_modifier}" if style_modifier else raw_prompt

            # Generate random seed for reproducible or uniquely seeded generation
            custom_seed = data.get('seed')
            try:
                seed = int(custom_seed) if custom_seed is not None and str(custom_seed).strip() != '' else random.randint(1, 999999999)
            except (ValueError, TypeError):
                seed = random.randint(1, 999999999)

            # Build Pollinations AI URL
            # Format: https://image.pollinations.ai/prompt/{encoded_prompt}?width={width}&height={height}&seed={seed}&nologo=true&model=flux
            encoded_prompt = urllib.parse.quote(enhanced_prompt)
            pollinations_url = (
                f"{Config.POLLINATIONS_API_BASE}/{encoded_prompt}"
                f"?width={width}&height={height}&seed={seed}&nologo=true&model={Config.DEFAULT_MODEL}"
            )
            if negative_prompt:
                pollinations_url += f"&negative={urllib.parse.quote(negative_prompt)}"

            app.logger.info(f"Generating image via Pollinations AI: {pollinations_url[:120]}...")

            # Request generation with resilient timeout & headers
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
            }
            
            response = requests.get(pollinations_url, headers=headers, timeout=60, stream=True)
            
            if response.status_code != 200:
                return jsonify({
                    'success': False,
                    'error': f"Inference engine returned HTTP status {response.status_code}. Please try again shortly."
                }), 502

            # Validate Content-Type
            content_type = response.headers.get('Content-Type', '')
            if not content_type.startswith('image/'):
                app.logger.warning(f"Unexpected Content-Type: {content_type}")

            image_bytes = response.content
            if len(image_bytes) < 1000:
                return jsonify({
                    'success': False,
                    'error': "Received empty or corrupted image data from inference engine."
                }), 502

            # Sanitize filename with timestamp
            timestamp_str = datetime.utcnow().strftime('%Y-%m-%d-%H%M%S')
            random_salt = random.randint(1000, 9999)
            filename = f"sqrock-gen-{timestamp_str}-{random_salt}.png"
            file_path = Config.UPLOAD_FOLDER / filename

            # Save binary image stream to disk
            with open(file_path, 'wb') as f:
                f.write(image_bytes)

            # Public image URL
            image_url = f"/static/generated/{filename}"

            # Save to SQLite database
            new_image = GeneratedImage(
                prompt=raw_prompt,
                enhanced_prompt=enhanced_prompt,
                negative_prompt=negative_prompt,
                style=style,
                aspect_ratio=aspect_ratio,
                width=width,
                height=height,
                seed=seed,
                image_filename=filename,
                image_url=image_url
            )
            db.session.add(new_image)
            db.session.commit()

            return jsonify({
                'success': True,
                'image': new_image.to_dict(),
                'message': 'Image generated and stored successfully.'
            }), 201

        except requests.exceptions.Timeout:
            return jsonify({
                'success': False,
                'error': 'Generation timed out while awaiting the AI inference cluster. Please retry.'
            }), 504
        except requests.exceptions.RequestException as req_err:
            app.logger.error(f"Network error during generation: {req_err}")
            return jsonify({
                'success': False,
                'error': f"Network error connecting to inference endpoint: {str(req_err)}"
            }), 502
        except Exception as e:
            app.logger.error(f"Unexpected generation failure: {e}", exc_info=True)
            db.session.rollback()
            return jsonify({
                'success': False,
                'error': f"Internal server error: {str(e)}"
            }), 500

    @app.route('/api/history', methods=['GET'])
    def get_history():
        """
        Returns JSON list of generated images with optional keyword search,
        style filtering, and pagination.
        """
        try:
            page = request.args.get('page', 1, type=int)
            limit = request.args.get('limit', 50, type=int)
            search_query = request.args.get('search', '').strip()
            style_filter = request.args.get('style', '').strip()

            query = GeneratedImage.query

            if search_query:
                query = query.filter(GeneratedImage.prompt.ilike(f'%{search_query}%'))
            
            if style_filter and style_filter.lower() != 'all':
                query = query.filter(GeneratedImage.style.ilike(style_filter))

            total_count = query.count()
            images = query.order_by(GeneratedImage.created_at.desc()).paginate(
                page=page,
                per_page=limit,
                error_out=False
            ).items

            return jsonify({
                'success': True,
                'images': [img.to_dict() for img in images],
                'total': total_count,
                'page': page,
                'limit': limit
            })
        except Exception as e:
            app.logger.error(f"Failed to fetch history: {e}")
            return jsonify({
                'success': False,
                'error': f"Failed to retrieve history: {str(e)}"
            }), 500

    @app.route('/api/history/<int:image_id>', methods=['DELETE'])
    def delete_history_item(image_id):
        """
        Deletes image entry from SQLite database and removes associated binary file from disk.
        """
        try:
            record = GeneratedImage.query.get(image_id)
            if not record:
                return jsonify({
                    'success': False,
                    'error': f"Image record #{image_id} not found."
                }), 404

            # Attempt to delete file from disk
            file_path = Config.UPLOAD_FOLDER / record.image_filename
            if file_path.exists() and file_path.is_file():
                try:
                    file_path.unlink()
                except OSError as os_err:
                    app.logger.warning(f"Could not remove file {file_path}: {os_err}")

            db.session.delete(record)
            db.session.commit()

            return jsonify({
                'success': True,
                'id': image_id,
                'message': 'Image record and binary file deleted successfully.'
            })
        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Failed to delete image #{image_id}: {e}")
            return jsonify({
                'success': False,
                'error': f"Failed to delete record: {str(e)}"
            }), 500

    @app.route('/api/download/<int:image_id>', methods=['GET'])
    def download_image(image_id):
        """
        Serves the binary image file as an attachment with sanitized timestamped filename.
        e.g. sqrock-gen-2026-09-09.png
        """
        try:
            record = GeneratedImage.query.get_or_404(image_id)
            file_path = Config.UPLOAD_FOLDER / record.image_filename
            
            if not file_path.exists():
                abort(404, description="Image file was not found on server disk.")

            clean_date = record.created_at.strftime('%Y-%m-%d')
            download_name = f"sqrock-gen-{clean_date}-{record.id}.png"

            return send_file(
                file_path,
                as_attachment=True,
                download_name=download_name,
                mimetype='image/png'
            )
        except Exception as e:
            app.logger.error(f"Download failed for image #{image_id}: {e}")
            abort(500, description=str(e))

    @app.route('/static/generated/<path:filename>')
    def serve_generated_file(filename):
        """Serve generated static assets directly."""
        return send_from_directory(Config.UPLOAD_FOLDER, filename)

    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
