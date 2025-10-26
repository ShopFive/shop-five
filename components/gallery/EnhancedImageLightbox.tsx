'use client';

import { useState } from 'react';
import { ImageGroup } from '@/types/gallery';
import { X, Download, ChevronLeft, ChevronRight } from 'lucide-react';

interface EnhancedImageLightboxProps {
  group: ImageGroup;
  initialVariationIndex: number;
  onClose: () => void;
}

export default function EnhancedImageLightbox({ 
  group, 
  initialVariationIndex, 
  onClose 
}: EnhancedImageLightboxProps) {
  const [currentVariationIndex, setCurrentVariationIndex] = useState(initialVariationIndex);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const currentVariation = group.variations[currentVariationIndex];

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

  const handlePrevious = () => {
    setCurrentVariationIndex((prev) => 
      prev === 0 ? group.variations.length - 1 : prev - 1
    );
    setSliderPosition(50);
  };

  const handleNext = () => {
    setCurrentVariationIndex((prev) => 
      prev === group.variations.length - 1 ? 0 : prev + 1
    );
    setSliderPosition(50);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'clothes': return '👕';
      case 'caps': return '🧢';
      case 'shoes': return '👟';
      default: return '📦';
    }
  };

  // Download functions
  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download image. Please try again.');
    }
  };

  const handleDownloadOriginal = () => {
    handleDownload(group.original.url, `${group.name}-original.jpg`);
  };

  const handleDownloadCurrentVariation = () => {
    handleDownload(currentVariation.url, `${group.name}-variation-${currentVariationIndex + 1}.jpg`);
  };

  const handleDownloadAll = async () => {
    // Download original
    handleDownload(group.original.url, `${group.name}-original.jpg`);
    
    // Download all variations with delay
    for (let i = 0; i < group.variations.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      handleDownload(group.variations[i].url, `${group.name}-variation-${i + 1}.jpg`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getCategoryIcon(group.category)}</span>
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">{group.name}</h2>
              <p className="text-sm text-gray-500">
                Variation {currentVariationIndex + 1} of {group.variations.length}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          
          {/* Image Comparison */}
          <div className="bg-gray-50 rounded-2xl p-4 md:p-8 mb-6">
            <div
              className="relative w-full mx-auto cursor-col-resize select-none rounded-xl overflow-hidden shadow-lg"
              style={{ maxWidth: '1200px' }}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchEnd={handleMouseUp}
              onTouchMove={handleTouchMove}
            >
              {/* After Image */}
              <div className="relative w-full bg-white">
                <img
                  src={currentVariation.url}
                  alt="After"
                  className="w-full h-auto"
                  style={{ maxHeight: '70vh', objectFit: 'contain' }}
                />
                <div className="absolute top-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                  After ✨
                </div>
              </div>

              {/* Before Image (Clipped) */}
              <div
                className="absolute inset-0 overflow-hidden bg-white"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              >
                <img
                  src={group.original.url}
                  alt="Before"
                  className="w-full h-auto"
                  style={{ maxHeight: '70vh', objectFit: 'contain' }}
                />
                <div className="absolute top-4 left-4 bg-gray-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                  Original
                </div>
              </div>

              {/* Slider */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-2xl"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-gray-200">
                  <div className="flex gap-0.5">
                    <div className="w-0.5 h-5 bg-gray-400 rounded-full"></div>
                    <div className="w-0.5 h-5 bg-gray-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-center text-sm text-gray-500 mt-4">
              ← Drag to compare →
            </p>
          </div>

          {/* Variations Grid */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              All Variations ({group.variations.length})
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {group.variations.map((variation, index) => (
                <button
                  key={variation.id}
                  onClick={() => {
                    setCurrentVariationIndex(index);
                    setSliderPosition(50);
                  }}
                  className={`
                    relative aspect-square rounded-xl overflow-hidden
                    transition-all duration-200
                    ${index === currentVariationIndex 
                      ? 'ring-4 ring-blue-500 scale-105' 
                      : 'ring-2 ring-gray-200 hover:ring-gray-300 hover:scale-105'
                    }
                  `}
                >
                  <img
                    src={variation.url}
                    alt={`Variation ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 left-1 right-1 bg-black/60 backdrop-blur-sm rounded-lg py-1 text-center">
                    <span className="text-white text-xs font-bold">#{index + 1}</span>
                  </div>
                  {index === currentVariationIndex && (
                    <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Details */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Image Details</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">{getCategoryIcon(group.category)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">Category</div>
                    <div className="font-semibold text-gray-900">{group.category.toUpperCase()}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">Upload Date</div>
                    <div className="font-medium text-gray-900">{new Date(group.uploadDate).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">AI Model</div>
                    <div className="font-medium text-gray-900">Nano Banna</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">Total Variations</div>
                    <div className="font-medium text-gray-900">{group.variations.length}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">Current Variation</div>
                    <div className="font-medium text-gray-900">#{currentVariationIndex + 1}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Download */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Download Options</h3>
              <div className="space-y-3">
                <button 
                  onClick={handleDownloadOriginal}
                  className="w-full border-2 border-gray-500 text-gray-700 bg-white hover:bg-gray-50 py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Original
                </button>
                <button 
                  onClick={handleDownloadCurrentVariation}
                  className="w-full border-2 border-blue-500 text-blue-600 bg-white hover:bg-blue-50 py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Variation #{currentVariationIndex + 1}
                </button>
                <button 
                  onClick={handleDownloadAll}
                  className="w-full border-2 border-emerald-500 text-emerald-600 bg-white hover:bg-emerald-50 py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download All ({group.variations.length + 1})
                </button>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="text-lg">💡</span>
                  <p className="text-xs text-blue-700">
                    <span className="font-semibold">Tip:</span> Use arrow keys (← →) to navigate between variations
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Navigation */}
      <button
        onClick={handlePrevious}
        className="fixed left-4 top-1/2 -translate-y-1/2 p-3 bg-white hover:bg-gray-50 rounded-full shadow-xl transition-all z-10 hidden md:flex items-center justify-center"
      >
        <ChevronLeft className="w-6 h-6 text-gray-700" />
      </button>
      <button
        onClick={handleNext}
        className="fixed right-4 top-1/2 -translate-y-1/2 p-3 bg-white hover:bg-gray-50 rounded-full shadow-xl transition-all z-10 hidden md:flex items-center justify-center"
      >
        <ChevronRight className="w-6 h-6 text-gray-700" />
      </button>
    </div>
  );
}