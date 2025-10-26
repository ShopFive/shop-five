'use client';

import { GalleryImage, ViewMode } from '@/types/gallery';
import ImageCard from './ImageCard';

interface GalleryGridProps {
  images: GalleryImage[];
  viewMode: ViewMode;
  onImageClick: (image: GalleryImage) => void;
}

export default function GalleryGrid({ images, viewMode, onImageClick }: GalleryGridProps) {
  const getGridClasses = () => {
    switch (viewMode) {
      case 'grid-2':
        return 'grid-cols-1 md:grid-cols-2 gap-6';
      case 'grid-4':
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4';
      case 'grid-6':
        return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3';
      case 'list':
        return 'grid-cols-1 gap-4';
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4';
    }
  };

  return (
    <div className={`grid ${getGridClasses()}`}>
      {images.map((image) => (
        <ImageCard
          key={image.id}
          image={image}
          viewMode={viewMode}
          onClick={() => onImageClick(image)}
        />
      ))}
    </div>
  );
}