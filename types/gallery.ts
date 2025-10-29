// Gallery specific types

export type Category = 'clothes' | 'caps' | 'shoes';

export type ViewMode = 'grid-2' | 'grid-4' | 'grid-6' | 'list';

export type DateFilter = 'all' | 'today' | 'week' | 'month';

// Image data structure
export interface ImageData {
  id: string;
  url: string;
  fileSize: number;
}

// OLD SYSTEM: For Caps & Shoes
export interface OldSystemImageGroup {
  id: string;
  name: string;
  category: Category;
  uploadDate: string;
  type: 'old';
  original: ImageData;
  variations: ImageData[];
}

// NEW SYSTEM: For Clothes (Front + Back)
export interface NewSystemImageGroup {
  id: string;
  name: string;
  category: Category;
  uploadDate: string;
  type: 'new';
  original: {
    front: ImageData | null;
    back: ImageData | null;
  };
  processed: {
    front: ImageData | null;
    back: ImageData | null;
  };
}

// Union type that supports both systems
export type ImageGroup = OldSystemImageGroup | NewSystemImageGroup;

// Type guards
export function isOldSystem(group: ImageGroup): group is OldSystemImageGroup {
  return group.type === 'old';
}

export function isNewSystem(group: ImageGroup): group is NewSystemImageGroup {
  return group.type === 'new';
}

// Stats
export interface GalleryStats {
  total: number;
  clothes: number;
  caps: number;
  shoes: number;
}

// Backward compatibility (deprecated)
export interface GalleryImage {
  id: string;
  name: string;
  category: Category;
  beforeUrl: string;
  afterUrl: string;
  uploadDate: string;
  fileSize: number;
}

export interface ImageVariation {
  id: string;
  url: string;
  thumbnail?: string;
  fileSize: number;
}