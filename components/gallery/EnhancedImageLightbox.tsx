'use client';

import { useState, useRef, useEffect } from 'react';
import { ImageGroup, isOldSystem, isNewSystem } from '@/types/gallery';
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
  
  // ✅ FIX 1: Slider - useRef to prevent sticking
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  
  // ✅ FIX 2: Progress Indicator
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadTotal, setDownloadTotal] = useState(0);
  
  // ✅ FIX 3: Swipe Gestures
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // ✅ FIX 4: Loading States
  const [imageLoading, setImageLoading] = useState(true);
  const [beforeImageLoading, setBeforeImageLoading] = useState(true);

  // Get variations and current variation based on system type
  const getVariationsData = () => {
    if (isOldSystem(group)) {
      return {
        variations: group.variations,
        currentVariation: group.variations[currentVariationIndex],
        originalUrl: group.original.url,
        totalOriginals: 1,
        totalProcessed: group.variations.length,
        totalImages: 1 + group.variations.length
      };
    } else {
      // New system
      const variations = [
        group.processed.front,
        group.processed.back
      ].filter(img => img !== null) as Array<{ id: string; url: string; fileSize: number }>;

      // Match original with current variation
      let originalUrl = '';
      if (currentVariationIndex === 0 && group.original.front) {
        originalUrl = group.original.front.url;
      } else if (currentVariationIndex === 1 && group.original.back) {
        originalUrl = group.original.back.url;
      } else {
        originalUrl = group.original.front?.url || group.original.back?.url || '';
      }

      // Count originals
      const totalOriginals = (group.original.front ? 1 : 0) + (group.original.back ? 1 : 0);

      return {
        variations: variations,
        currentVariation: variations[currentVariationIndex] || variations[0],
        originalUrl: originalUrl,
        totalOriginals: totalOriginals,
        totalProcessed: variations.length,
        totalImages: totalOriginals + variations.length
      };
    }
  };

  const variationsData = getVariationsData();

  // ✅ FIX 1: Slider handlers with useRef
  const handleMouseDown = () => {
    setIsDragging(true);
    isDraggingRef.current = true;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    isDraggingRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const percentage = (x / rect.width) * 100;
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.touches[0].clientX - rect.left));
    const percentage = (x / rect.width) * 100;
    setSliderPosition(percentage);
  };

  const handlePrevious = () => {
    setCurrentVariationIndex((prev) => 
      prev === 0 ? variationsData.variations.length - 1 : prev - 1
    );
    setSliderPosition(50);
    setImageLoading(true);
    setBeforeImageLoading(true);
  };

  const handleNext = () => {
    setCurrentVariationIndex((prev) => 
      prev === variationsData.variations.length - 1 ? 0 : prev + 1
    );
    setSliderPosition(50);
    setImageLoading(true);
    setBeforeImageLoading(true);
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
    handleDownload(variationsData.originalUrl, `${group.name}-original.jpg`);
  };

  const handleDownloadCurrentVariation = () => {
    const label = isNewSystem(group) 
      ? (currentVariationIndex === 0 ? 'front' : 'back')
      : `variation-${currentVariationIndex + 1}`;
    handleDownload(variationsData.currentVariation.url, `${group.name}-${label}.jpg`);
  };

  // ✅ FIX 2: Download ALL with Progress Indicator (Fixed for both systems)
  const handleDownloadAll = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    
    const totalFiles = variationsData.totalImages;
    setDownloadTotal(totalFiles);
    let completed = 0;

    try {
      if (isOldSystem(group)) {
        // OLD SYSTEM: 1 original + all variations
        await handleDownload(group.original.url, `${group.name}-original.jpg`);
        completed++;
        setDownloadProgress(completed);
        
        for (let i = 0; i < group.variations.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 500));
          await handleDownload(group.variations[i].url, `${group.name}-variation-${i + 1}.jpg`);
          completed++;
          setDownloadProgress(completed);
        }
      } else {
        // NEW SYSTEM: Front + Back (original + processed)
        
        // Download Front Original
        if (group.original.front) {
          await handleDownload(group.original.front.url, `${group.name}-original-front.jpg`);
          completed++;
          setDownloadProgress(completed);
        }
        
        // Download Back Original
        if (group.original.back) {
          await new Promise(resolve => setTimeout(resolve, 500));
          await handleDownload(group.original.back.url, `${group.name}-original-back.jpg`);
          completed++;
          setDownloadProgress(completed);
        }
        
        // Download Front Processed
        if (group.processed.front) {
          await new Promise(resolve => setTimeout(resolve, 500));
          await handleDownload(group.processed.front.url, `${group.name}-processed-front.jpg`);
          completed++;
          setDownloadProgress(completed);
        }
        
        // Download Back Processed
        if (group.processed.back) {
          await new Promise(resolve => setTimeout(resolve, 500));
          await handleDownload(group.processed.back.url, `${group.name}-processed-back.jpg`);
          completed++;
          setDownloadProgress(completed);
        }
      }
      
      alert('✅ All images downloaded successfully!');
    } catch (error) {
      alert('❌ Download failed. Please try again.');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const getVariationLabel = (index: number) => {
    if (isNewSystem(group)) {
      return index === 0 ? 'Front View' : 'Back View';
    }
    return `Variation ${index + 1}`;
  };

  // ✅ FIX 3: Swipe detection
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMoveSwipe = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      handleNext();
    }
    if (isRightSwipe) {
      handlePrevious();
    }
  };

  // ✅ FIX 4: Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Space: Toggle slider position (0% or 100%)
      if (e.code === 'Space') {
        e.preventDefault();
        setSliderPosition(prev => prev < 50 ? 100 : 0);
      }
      
      // R: Reset slider to 50%
      if (e.code === 'KeyR') {
        e.preventDefault();
        setSliderPosition(50);
      }
      
      // Arrow Left: Previous variation
      if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      }
      
      // Arrow Right: Next variation
      if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
      
      // Escape: Close lightbox
      if (e.code === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentVariationIndex, variationsData.variations.length, onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 bg-white flex flex-col"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMoveSwipe}
      onTouchEnd={onTouchEnd}
    >
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getCategoryIcon(group.category)}</span>
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">{group.name}</h2>
              <p className="text-sm text-gray-500">
                {getVariationLabel(currentVariationIndex)} ({currentVariationIndex + 1} of {variationsData.variations.length})
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
          
          {/* Image Comparison Container */}
          <div className="bg-gray-50 rounded-2xl p-4 md:p-8 mb-6 flex justify-center">
            <div
              className="relative cursor-col-resize select-none rounded-xl overflow-hidden shadow-lg"
              style={{ maxWidth: 'fit-content', width: '100%', maxHeight: '70vh' }}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchEnd={handleMouseUp}
              onTouchMove={handleTouchMove}
            >
              {/* ✅ Loading Spinner Overlay */}
              {(imageLoading || beforeImageLoading) && (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-20">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="animate-spin h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-sm text-gray-600 font-medium">Loading image...</p>
                  </div>
                </div>
              )}

              {/* After Image */}
              <div className="relative bg-white">
                <img
                  src={variationsData.currentVariation.url}
                  alt="After"
                  className={`h-auto transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                  style={{ maxHeight: '70vh', width: 'auto', objectFit: 'contain' }}
                  onLoad={() => setImageLoading(false)}
                />
                <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-emerald-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium shadow-lg">
                  {isNewSystem(group) ? (currentVariationIndex === 0 ? 'Front ✨' : 'Back ✨') : 'After ✨'}
                </div>
              </div>

              {/* Before Image (Clipped) */}
              <div
                className="absolute inset-0 overflow-hidden bg-white"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              >
                <img
                  src={variationsData.originalUrl}
                  alt="Before"
                  className={`h-auto transition-opacity duration-300 ${beforeImageLoading ? 'opacity-0' : 'opacity-100'}`}
                  style={{ maxHeight: '70vh', width: 'auto', objectFit: 'contain' }}
                  onLoad={() => setBeforeImageLoading(false)}
                />
                <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-gray-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium shadow-lg">
                  Original
                </div>
              </div>

              {/* Slider */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-2xl"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-gray-200">
                  <div className="flex gap-0.5">
                    <div className="w-0.5 h-4 md:h-5 bg-gray-400 rounded-full"></div>
                    <div className="w-0.5 h-4 md:h-5 bg-gray-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-center text-sm text-gray-500 mb-6">
            ← Drag to compare →
          </p>

          {/* Variations Grid */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {isNewSystem(group) ? 'All Views' : 'All Variations'} ({variationsData.variations.length})
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {variationsData.variations.map((variation, index) => (
                <button
                  key={variation.id}
                  onClick={() => {
                    setCurrentVariationIndex(index);
                    setSliderPosition(50);
                    setImageLoading(true);
                    setBeforeImageLoading(true);
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
                    alt={getVariationLabel(index)}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 left-1 right-1 bg-black/60 backdrop-blur-sm rounded-lg py-1 text-center">
                    <span className="text-white text-xs font-bold">
                      {isNewSystem(group) ? (index === 0 ? 'Front' : 'Back') : `#${index + 1}`}
                    </span>
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
                    <div className="font-medium text-gray-900">Gemini Pro</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">Total {isNewSystem(group) ? 'Views' : 'Variations'}</div>
                    <div className="font-medium text-gray-900">{variationsData.variations.length}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">Current View</div>
                    <div className="font-medium text-gray-900">{getVariationLabel(currentVariationIndex)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Download Options */}
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
                  Download {getVariationLabel(currentVariationIndex)}
                </button>
                
                {/* ✅ Download All with Progress */}
                <button 
                  onClick={handleDownloadAll}
                  disabled={isDownloading}
                  className="w-full border-2 border-emerald-500 text-emerald-600 bg-white hover:bg-emerald-50 py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                >
                  {isDownloading && (
                    <div 
                      className="absolute inset-0 bg-emerald-100 transition-all duration-300"
                      style={{ width: `${(downloadProgress / downloadTotal) * 100}%` }}
                    />
                  )}
                  <div className="relative z-10 flex items-center gap-2">
                    {isDownloading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Downloading {downloadProgress}/{downloadTotal}...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Download All ({variationsData.totalImages})
                      </>
                    )}
                  </div>
                </button>
              </div>
              
              {/* Image Count Breakdown */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-xs text-blue-700 space-y-1">
                  <p className="font-semibold">📦 Total Images: {variationsData.totalImages}</p>
                  <p>• Original: {variationsData.totalOriginals}</p>
                  <p>• Processed: {variationsData.totalProcessed}</p>
                </div>
              </div>

              {/* ✅ Keyboard Shortcuts */}
              <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="text-xs text-gray-700 space-y-1">
                  <p className="font-semibold mb-2">⌨️ Keyboard Shortcuts:</p>
                  <p>• <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">Space</kbd> Toggle comparison</p>
                  <p>• <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">R</kbd> Reset slider</p>
                  <p>• <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">← →</kbd> Navigate views</p>
                  <p>• <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">Esc</kbd> Close</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Navigation Buttons */}
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