from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class GeneratedImage(db.Model):
    """Generated Image database model storing generation history and metadata."""
    __tablename__ = 'generated_images'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    prompt = db.Column(db.Text, nullable=False)
    enhanced_prompt = db.Column(db.Text, nullable=True)
    negative_prompt = db.Column(db.Text, nullable=True, default='')
    style = db.Column(db.String(50), nullable=False, default='Photorealistic')
    aspect_ratio = db.Column(db.String(10), nullable=False, default='1:1')
    width = db.Column(db.Integer, nullable=False, default=1024)
    height = db.Column(db.Integer, nullable=False, default=1024)
    seed = db.Column(db.BigInteger, nullable=True)
    image_filename = db.Column(db.String(255), nullable=False)
    image_url = db.Column(db.String(500), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    def to_dict(self):
        """Serialize model instance to dictionary for REST API responses."""
        return {
            'id': self.id,
            'prompt': self.prompt,
            'enhanced_prompt': self.enhanced_prompt or self.prompt,
            'negative_prompt': self.negative_prompt or '',
            'style': self.style,
            'aspect_ratio': self.aspect_ratio,
            'width': self.width,
            'height': self.height,
            'seed': self.seed,
            'image_filename': self.image_filename,
            'image_url': self.image_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'formatted_date': self.created_at.strftime('%b %d, %Y • %H:%M') if self.created_at else ''
        }
    
    def __repr__(self):
        return f'<GeneratedImage id={self.id} style="{self.style}" prompt="{self.prompt[:25]}...">'
