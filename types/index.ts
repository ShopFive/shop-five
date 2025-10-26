export interface GeneratedImage {
  id: string;
  beforeUrl: string;
  afterUrl: string;
  uploadDate: string;
  fileSize: number;
  category: string;
  name: string;
}

export interface ImageVariation {
  id: string;
  url: string;
  fileSize: number;
}

export interface ImageGroup {
  id: string;
  name: string;
  category: string;
  uploadDate: string;
  original: ImageVariation;
  variations: ImageVariation[];
}

export type ViewMode = 'grid-2' | 'grid-4' | 'grid-6' | 'list';

export interface GalleryImage {
  id: string;
  name: string;
  category: string;
  beforeUrl: string;
  afterUrl: string;
  uploadDate: string;
  fileSize: number;
}