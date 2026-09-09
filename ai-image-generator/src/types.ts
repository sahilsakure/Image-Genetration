export interface GeneratedImageRecord {
  id: number;
  prompt: string;
  enhanced_prompt: string;
  negative_prompt?: string;
  style: string;
  aspect_ratio: string;
  width: number;
  height: number;
  seed?: number;
  image_filename: string;
  image_url: string;
  created_at: string;
  formatted_date: string;
}

export type StylePresetName =
  | 'Photorealistic'
  | 'Anime'
  | 'Cyberpunk'
  | 'Cinematic'
  | '3D Render'
  | 'Oil Painting'
  | 'Minimalist'
  | 'Fantasy';

export type AspectRatioType = '1:1' | '16:9' | '9:16';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}
