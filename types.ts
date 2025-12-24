
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  TRENDS = 'TRENDS',
  IMAGE_DESIGN = 'IMAGE_DESIGN',
  SCRIPT = 'SCRIPT',
  VIDEO_MAKER = 'VIDEO_MAKER',
  STRATEGY = 'STRATEGY',
  GUIDE = 'GUIDE',
  GALLERY = 'GALLERY'
}

export interface SavedVideo {
  id: string;
  name: string;
  blob: Blob;
  timestamp: number;
  thumbnail?: string;
}

export interface TrendItem {
  category: string;
  products: string[];
  reason: string;
}

export interface ScriptScene {
  time: string;
  visual: string;
  audio: string; // Lời thoại (Voiceover text)
  audioPcm?: string; // Dữ liệu giọng đọc riêng của cảnh (Base64 PCM)
  imagePrompt: string;
  generatedImage?: string;
  videoUrl?: string; // URL của clip người dùng tải lên
  mediaType: 'image' | 'video';
}

export interface GeneratedScript {
  title: string;
  scenes: ScriptScene[];
  hashtags: string[];
  postingTime: string;
  musicGenre: string;
}

export interface SharedProductData {
  name: string;
  features: string;
  productLink?: string;
  originalImages: string[];
  designImages: string[];
  script: GeneratedScript | null;
  audioPcm: string | null; // Tổng hợp audio (nếu cần)
  musicPcm: string | null;
}

export interface StrategyPlan {
  phase: string;
  focus: string;
  actions: string[];
}
