'use client';

import { useState } from 'react';
import { GalleryImage } from '@/types/gallery';
import { X, Download, ChevronLeft, ChevronRight, Calendar, Folder } from 'lucide-react';
import Image from 'next/image';

interface ImageLightboxProps {
  image: GalleryImage;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function ImageLightbox({ image, onClose, onNext, onPrevious }: ImageLightboxProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

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
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  const handleDownload = async (url: string, type: 'before' | 'after' | 'both') => {
    try {
      if (type === 'both') {
        await handleDownload(image.beforeUrl, 'before');
        await handleDownload(image.afterUrl, 'after');
        return;
      }

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

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Navigation */}
      <button
        onClick={onPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={onNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      <div className="max-w-6xl w-full">
        {/* Before/After Comparison */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl mb-4">
          <div
            className="relative aspect-video bg-gray-100 cursor-col-resize select-none"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
            onTouchMove={handleTouchMove}
          >
            {/* After Image (Background) */}
            <div className="absolute inset-0">
              <Image
                src={image.afterUrl}
                alt="After"
                fill
                className="object-contain"
              />
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                After ✨
              </div>
            </div>

            {/* Before Image (Clipped) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <Image
                src={image.beforeUrl}
                alt="Before"
                fill
                className="object-contain"
              />
              <div className="absolute top-4 left-4 bg-gray-700 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                Before
              </div>
            </div>

            {/* Slider Handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-col-resize"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
                <div className="flex gap-1">
                  <div className="w-1 h-4 bg-gray-400 rounded"></div>
                  <div className="w-1 h-4 bg-gray-400 rounded"></div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
              ← Drag to compare →
            </div>
          </div>
        </div>

        {/* Image Info */}
        <div className="bg-white rounded-2xl p-6 shadow-2xl">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left: Details */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{image.name}</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-3">
                  <Folder className="w-5 h-5 text-[#5b8def] mt-1" />
                  <div>
                    <div className="text-sm text-gray-600">Category</div>
                    <div className="font-semibold text-gray-900">
                      {getCategoryIcon(image.category)} {image.category.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-[#5b8def] mt-1" />
                  <div>
                    <div className="text-sm text-gray-600">Upload Date</div>
                    <div className="font-semibold text-gray-900">{formatDate(image.uploadDate)}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 text-[#5b8def] mt-1 font-bold">📏</div>
                  <div>
                    <div className="text-sm text-gray-600">File Size</div>
                    <div className="font-semibold text-gray-900">{formatFileSize(image.fileSize)}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 text-[#5b8def] mt-1 font-bold">🎨</div>
                  <div>
                    <div className="text-sm text-gray-600">AI Model</div>
                    <div className="font-semibold text-gray-900">Nano Banna</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Download Actions */}
            <div className="flex flex-col gap-3 md:min-w-[200px]">
              <button
                onClick={() => handleDownload(image.beforeUrl, 'before')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
              >
                <Download className="w-4 h-4" />
                Download Before
              </button>
              
              <button
                onClick={() => handleDownload(image.afterUrl, 'after')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-[#5b8def] hover:bg-[#4a7ad8] text-white rounded-lg transition-colors font-medium"
              >
                <Download className="w-4 h-4" />
                Download After
              </button>
              
              <button
                onClick={() => handleDownload('', 'both')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
              >
                <Download className="w-4 h-4" />
                Download Both
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}