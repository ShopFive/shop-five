// Gallery specific types

export type Category = 'clothes' | 'caps' | 'shoes';

export type ViewMode = 'grid-2' | 'grid-4' | 'grid-6' | 'list';

export type DateFilter = 'all' | 'today' | 'week' | 'month';

// NEW: Image variation
export interface ImageVariation {
  id: string;
  url: string;
  thumbnail?: string;
  fileSize: number;
}

// NEW: Image group (1 original + 8 variations)
export interface ImageGroup {
  id: string;
  name: string;
  category: Category;
  uploadDate: string;
  original: {
    url: string;
    fileSize: number;
  };
  variations: ImageVariation[];
}

// OLD: Keep for backward compatibility (if needed)
export interface GalleryImage {
  id: string;
  name: string;
  category: Category;
  beforeUrl: string;
  afterUrl: string;
  uploadDate: string;
  fileSize: number;
}

export interface GalleryStats {
  total: number;
  clothes: number;
  caps: number;
  shoes: number;
}