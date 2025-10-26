'use client';

import { useState, useCallback } from 'react';
import Header from '@/components/Header';
import PageNavButtons from '@/components/PageNavButtons';
import CategoryCard from '@/components/CategoryCard';
import UploadArea from '@/components/UploadArea';
import ImagePreview from '@/components/ImagePreview';
import ProgressBar from '@/components/ProgressBar';
import SuccessScreen from '@/components/SuccessScreen';
import { Category, CategoryOption, UploadedImage, UploadProgress, UploadResult } from '@/types/types';

const CATEGORIES: CategoryOption[] = [
  {
    id: 'clothes',
    name: 'CLOTHES',
    icon: '👕',
    description: 'Upload clothing items',
  },
  {
    id: 'caps',
    name: 'CAPS',
    icon: '🧢',
    description: 'Upload caps and hats',
  },
  {
    id: 'shoes',
    name: 'SHOES',
    icon: '👟',
    description: 'Upload footwear items',
  },
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

  const handleCategorySelect = useCallback((category: Category) => {
    setSelectedCategory(category);
    setUploadedImages([]);
    setUploadResult(null);
    setUploadProgress(null);
    
    setTimeout(() => {
      document.getElementById('upload-section')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  }, []);

  const handleFilesSelected = useCallback((files: File[]) => {
    const newImages: UploadedImage[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
    }));

    setUploadedImages(prev => [...prev, ...newImages]);
  }, []);

  const handleRemoveImage = useCallback((id: string) => {
    setUploadedImages(prev => {
      const image = prev.find(img => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  }, []);

  const simulateProgress = async (totalImages: number) => {
    for (let i = 1; i <= totalImages; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUploadProgress({
        stage: 'generating',
        progress: 50 + (i / totalImages) * 45,
        currentImage: i,
        totalImages,
        message: `Processing image ${i} of ${totalImages}...`,
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedCategory || uploadedImages.length === 0) return;

    setIsUploading(true);
    setUploadProgress({
      stage: 'uploading',
      progress: 0,
      message: 'Preparing images...',
    });

    try {
      const formData = new FormData();
      formData.append('category', selectedCategory);
      
      uploadedImages.forEach((image, index) => {
        formData.append(`image_${index}`, image.file);
      });

      setUploadProgress({
        stage: 'uploading',
        progress: 30,
        message: `Uploading ${uploadedImages.length} image${uploadedImages.length > 1 ? 's' : ''} to server...`,
      });

      const webhookURL = 'https://n8n.srv880249.hstgr.cloud/webhook/shop-five-upload';
      
      const response = await fetch(webhookURL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();

      setUploadProgress({
        stage: 'processing',
        progress: 50,
        message: 'Processing images...',
      });

      await simulateProgress(uploadedImages.length);

      setUploadProgress({
        stage: 'complete',
        progress: 100,
        message: 'Upload complete! Preparing summary...',
      });

      await new Promise(resolve => setTimeout(resolve, 800));

      setUploadResult({
        success: true,
        category: selectedCategory,
        images: uploadedImages.map(img => ({
          id: img.id,
          preview: img.preview,
          name: img.file.name,
          size: img.file.size,
        })),
        totalCount: result.count || uploadedImages.length,
        uploadedAt: new Date().toISOString(),
        message: result.message || 'Images uploaded successfully!',
      });

      setUploadProgress(null);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress({
        stage: 'error',
        progress: 0,
        message: 'Upload failed. Please check your connection and try again.',
      });
      
      setTimeout(() => {
        setUploadProgress(null);
      }, 4000);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = useCallback(() => {
    if (confirm('Are you sure you want to cancel? All selected images will be removed.')) {
      uploadedImages.forEach(img => URL.revokeObjectURL(img.preview));
      setUploadedImages([]);
      setSelectedCategory(null);
      setUploadResult(null);
      setUploadProgress(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [uploadedImages]);

  const handleUploadMore = useCallback(() => {
    if (uploadResult) {
      uploadResult.images.forEach(img => URL.revokeObjectURL(img.preview));
    }
    
    setUploadResult(null);
    setUploadProgress(null);
    setSelectedCategory(null);
    setUploadedImages([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [uploadResult]);

  const handleUploadToSameCategory = useCallback(() => {
    if (uploadResult) {
      uploadResult.images.forEach(img => URL.revokeObjectURL(img.preview));
    }
    
    setUploadResult(null);
    setUploadProgress(null);
    setUploadedImages([]);
    
    setTimeout(() => {
      document.getElementById('upload-section')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  }, [uploadResult]);

  if (uploadResult) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <PageNavButtons />
        <SuccessScreen 
          result={uploadResult}
          onUploadMore={handleUploadMore}
          onUploadToSameCategory={handleUploadToSameCategory}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Navigation Buttons */}
      <PageNavButtons />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Product Image Upload
          </h1>
          <p className="text-gray-600">
            Select a category and upload product images
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {CATEGORIES.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              isSelected={selectedCategory === category.id}
              onSelect={() => handleCategorySelect(category.id)}
            />
          ))}
        </div>

        {selectedCategory && !uploadProgress && (
          <div id="upload-section" className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Upload Images to {selectedCategory.toUpperCase()}
            </h2>
            
            <UploadArea onFilesSelected={handleFilesSelected} />
            
            <ImagePreview 
              images={uploadedImages}
              onRemove={handleRemoveImage}
            />

            {uploadedImages.length > 0 && (
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={handleCancel}
                  disabled={isUploading}
                  className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="px-8 py-3 bg-[#5b8def] hover:bg-[#4a7ad8] text-white font-semibold rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {isUploading ? 'Uploading...' : `Upload ${uploadedImages.length} Image${uploadedImages.length > 1 ? 's' : ''}`}
                </button>
              </div>
            )}
          </div>
        )}

        {uploadProgress && (
          <div className="mb-8">
            <ProgressBar progress={uploadProgress} />
          </div>
        )}
      </main>
    </div>
  );
}