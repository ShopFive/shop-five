export type Category = 'clothes' | 'caps' | 'shoes';

export interface CategoryOption {
  id: Category;
  name: string;
  icon: string;
  description: string;
}

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  name: string;
  downloadUrl: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  images?: GeneratedImage[];
  jobId?: string;
}

export interface UploadProgress {
  stage: 'uploading' | 'processing' | 'generating' | 'complete' | 'error';
  progress: number;
  currentImage?: number;
  totalImages?: number;
  message: string;
}

// NEW: Type for upload result (for success screen)
export interface UploadResult {
  success: boolean;
  category: string;
  images: Array<{
    id: string;
    preview: string;
    name: string;
    size: number;
  }>;
  totalCount: number;
  uploadedAt: string;
  message: string;
}