'use client';

import { GalleryImage, ViewMode } from '@/types/gallery';
import { Download, Eye, Calendar, Folder } from 'lucide-react';
import Image from 'next/image';

interface ImageCardProps {
  image: GalleryImage;
  viewMode: ViewMode;
  onClick: () => void;
}

export default function ImageCard({ image, viewMode, onClick }: ImageCardProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'clothes': return '👕';
      case 'caps': return '🧢';
      case 'shoes': return '👟';
      default: return '📦';
    }
  };

  const handleDownload = async (e: React.MouseEvent, url: string, type: 'before' | 'after') => {
    e.stopPropagation();
    
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${image.name}-${type}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download image. Please try again.');
    }
  };

  if (viewMode === 'list') {
    return (
      <div
        onClick={onClick}
        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group"
      >
        <div className="flex gap-4 items-center">
          {/* Thumbnail */}
          <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
            <Image
              src={image.afterUrl}
              alt={image.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate mb-1">{image.name}</h3>
            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Folder className="w-4 h-4" />
                <span>{getCategoryIcon(image.category)} {image.category.toUpperCase()}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(image.uploadDate)}
              </span>
              <span>{formatFileSize(image.fileSize)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              className="p-2 bg-[#5b8def] hover:bg-[#4a7ad8] text-white rounded-lg transition-colors"
              title="View"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => handleDownload(e, image.afterUrl, 'after')}
              className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="group relative bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
    >
      {/* Category Badge */}
      <div className="absolute top-3 left-3 z-10">
        <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium shadow-lg">
          <span>{getCategoryIcon(image.category)}</span>
        </div>
      </div>

      {/* Image */}
      <div className="aspect-square relative bg-gray-100">
        <Image
          src={image.afterUrl}
          alt={image.name}
          fill
          className="object-cover"
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Quick Actions */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="p-3 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full transition-all duration-200 hover:scale-110 shadow-lg"
            title="View Details"
          >
            <Eye className="w-5 h-5 text-[#5b8def]" />
          </button>
          <button
            onClick={(e) => handleDownload(e, image.afterUrl, 'after')}
            className="p-3 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full transition-all duration-200 hover:scale-110 shadow-lg"
            title="Download"
          >
            <Download className="w-5 h-5 text-green-600" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate mb-2">{image.name}</h3>
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(image.uploadDate)}
          </span>
          <span>{formatFileSize(image.fileSize)}</span>
        </div>
      </div>

      {/* AI Badge */}
      <div className="absolute top-3 right-3 z-10">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded text-xs font-bold shadow-lg">
          AI ✨
        </div>
      </div>
    </div>
  );
}