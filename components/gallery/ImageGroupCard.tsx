'use client';

import { ImageGroup, ViewMode } from '@/types/gallery';
import { Calendar, Folder } from 'lucide-react';

interface ImageGroupCardProps {
  group: ImageGroup;
  viewMode: ViewMode;
  onVariationClick: (group: ImageGroup, variationIndex: number) => void;
}

export default function ImageGroupCard({ group, viewMode, onVariationClick }: ImageGroupCardProps) {
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

  // Compact view for grid-6
  if (viewMode === 'grid-6') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-lg transition-all duration-200">
        {/* Original (Small) - Clickable */}
        <button
          onClick={() => onVariationClick(group, 0)}
          className="relative aspect-square rounded-lg overflow-hidden mb-2 bg-gray-100 w-full hover:ring-2 hover:ring-blue-500 transition-all"
        >
          <img
            src={group.original.url}
            alt={group.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-1 left-1 bg-gray-700 text-white px-2 py-0.5 rounded text-xs font-bold">
            Original
          </div>
        </button>

        {/* Variations Grid (2x2 preview) */}
        <div className="grid grid-cols-2 gap-1 mb-2">
          {group.variations.slice(0, 4).map((variation, index) => (
            <button
              key={variation.id}
              onClick={() => onVariationClick(group, index)}
              className="relative aspect-square rounded overflow-hidden bg-gray-100 hover:ring-2 hover:ring-[#5b8def] transition-all"
            >
              <img
                src={variation.url}
                alt={`Variation ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>

        {/* Info */}
        <div className="text-xs">
          <p className="font-semibold text-gray-900 truncate">{group.name}</p>
          <p className="text-gray-500">+{group.variations.length} variations</p>
        </div>
      </div>
    );
  }

  // List view
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-all duration-200">
        <div className="flex gap-4 items-start">
          {/* Original Thumbnail - Clickable */}
          <button
            onClick={() => onVariationClick(group, 0)}
            className="relative w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 hover:ring-2 hover:ring-blue-500 transition-all"
          >
            <img
              src={group.original.url}
              alt={group.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-1 left-1 bg-gray-700/90 text-white px-2 py-0.5 rounded text-xs font-bold">
              Original
            </div>
          </button>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-900 mb-2">{group.name}</h3>
            <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
              <span className="flex items-center gap-1">
                <Folder className="w-4 h-4" />
                <span>{getCategoryIcon(group.category)} {group.category.toUpperCase()}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(group.uploadDate)}
              </span>
              <span>{formatFileSize(group.original.fileSize)}</span>
            </div>

            {/* Variations Preview */}
            <div className="flex gap-2 flex-wrap">
              {group.variations.map((variation, index) => (
                <button
                  key={variation.id}
                  onClick={() => onVariationClick(group, index)}
                  className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 hover:ring-2 hover:ring-[#5b8def] transition-all group"
                >
                  <img
                    src={variation.url}
                    alt={`Variation ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="text-white font-bold text-xs opacity-0 group-hover:opacity-100">
                      {index + 1}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default: Grid view (2 or 4 columns)
  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 relative">
      {/* Category Badge */}
      <div className="absolute top-3 left-3 z-10">
        <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium shadow-lg">
          <span>{getCategoryIcon(group.category)}</span>
        </div>
      </div>

      {/* AI Badge */}
      <div className="absolute top-3 right-3 z-10">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded text-xs font-bold shadow-lg">
          AI ✨
        </div>
      </div>

      {/* Original Image - Clickable */}
      <button
        onClick={() => onVariationClick(group, 0)}
        className="relative aspect-square bg-gray-100 w-full hover:opacity-90 transition-opacity group"
      >
        <img
          src={group.original.url}
          alt={group.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-3 left-3 bg-gray-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-bold">
          Original
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg font-semibold text-gray-900 transition-opacity">
            Click to view
          </div>
        </div>
      </button>

      {/* Info & Variations */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-3 truncate">{group.name}</h3>
        
        <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(group.uploadDate)}
          </span>
          <span>{formatFileSize(group.original.fileSize)}</span>
        </div>

        {/* Variations Grid */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">
            {group.variations.length} AI Variations:
          </p>
          <div className="grid grid-cols-4 gap-2">
            {group.variations.map((variation, index) => (
              <button
                key={variation.id}
                onClick={() => onVariationClick(group, index)}
                className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 hover:ring-2 hover:ring-[#5b8def] transition-all group"
              >
                <img
                  src={variation.url}
                  alt={`Variation ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-1 left-1 right-1 text-center">
                    <span className="text-white text-xs font-bold">#{index + 1}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}