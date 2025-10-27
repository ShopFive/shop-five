'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { X } from 'lucide-react';

type Category = 'clothes' | 'caps' | 'shoes';

interface CategoryCard {
  id: Category;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const categories: CategoryCard[] = [
  {
    id: 'clothes',
    title: 'CLOTHES',
    description: 'Upload clothing items',
    icon: '👕',
    color: 'from-blue-400 to-blue-600'
  },
  {
    id: 'caps',
    title: 'CAPS',
    description: 'Upload caps and hats',
    icon: '🧢',
    color: 'from-purple-400 to-purple-600'
  },
  {
    id: 'shoes',
    title: 'SHOES',
    description: 'Upload footwear items',
    icon: '👟',
    color: 'from-pink-400 to-pink-600'
  }
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [noFront, setNoFront] = useState(false);
  const [noBack, setNoBack] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const handleFrontImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFrontImage(file);
      setFrontPreview(URL.createObjectURL(file));
      setNoFront(false);
    }
  };

  const handleBackImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBackImage(file);
      setBackPreview(URL.createObjectURL(file));
      setNoBack(false);
    }
  };

  const removeFrontImage = () => {
    setFrontImage(null);
    setFrontPreview(null);
    if (frontInputRef.current) frontInputRef.current.value = '';
  };

  const removeBackImage = () => {
    setBackImage(null);
    setBackPreview(null);
    if (backInputRef.current) backInputRef.current.value = '';
  };

  const mergeImages = async (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }

      // Check if at least one image exists
      if ((!frontImage || noFront) && (!backImage || noBack)) {
        reject(new Error('At least one image is required'));
        return;
      }

      // Reduced size for better memory handling
      const MAX_WIDTH = 800;
      const DEFAULT_SIZE = 800;
      let frontWidth = DEFAULT_SIZE;
      let frontHeight = DEFAULT_SIZE;
      let backWidth = DEFAULT_SIZE;
      let backHeight = DEFAULT_SIZE;

      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolveImg, rejectImg) => {
          const img = new Image();
          img.onload = () => resolveImg(img);
          img.onerror = () => rejectImg(new Error('Failed to load image'));
          img.src = src;
        });
      };

      const processImages = async () => {
        let frontImg: HTMLImageElement | null = null;
        let backImg: HTMLImageElement | null = null;

        // Load front image if exists
        if (frontImage && !noFront && frontPreview) {
          try {
            frontImg = await loadImage(frontPreview);
            frontWidth = frontImg.width;
            frontHeight = frontImg.height;
          } catch (error) {
            reject(new Error('Failed to load front image'));
            return;
          }
        }

        // Load back image if exists
        if (backImage && !noBack && backPreview) {
          try {
            backImg = await loadImage(backPreview);
            backWidth = backImg.width;
            backHeight = backImg.height;
          } catch (error) {
            reject(new Error('Failed to load back image'));
            return;
          }
        }

        // Calculate canvas size
        const maxHeight = Math.max(frontHeight, backHeight);
        const totalWidth = frontWidth + backWidth;
        
        canvas.width = totalWidth;
        canvas.height = maxHeight;

        // Fill white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw front image (left side) or placeholder
        if (frontImg) {
          ctx.drawImage(frontImg, 0, (maxHeight - frontHeight) / 2, frontWidth, frontHeight);
        } else {
          // Draw placeholder for "No Front"
          ctx.fillStyle = '#F3F4F6';
          ctx.fillRect(0, 0, frontWidth, maxHeight);
          ctx.fillStyle = '#6B7280';
          ctx.font = '24px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('NO FRONT', frontWidth / 2, maxHeight / 2);
        }

        // Draw back image (right side) or placeholder
        if (backImg) {
          ctx.drawImage(backImg, frontWidth, (maxHeight - backHeight) / 2, backWidth, backHeight);
        } else {
          // Draw placeholder for "No Back"
          ctx.fillStyle = '#F3F4F6';
          ctx.fillRect(frontWidth, 0, backWidth, maxHeight);
          ctx.fillStyle = '#6B7280';
          ctx.font = '24px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('NO BACK', frontWidth + backWidth / 2, maxHeight / 2);
        }

        // Convert to blob with JPEG compression (smaller file size)
        canvas.toBlob((blob) => {
          if (blob) {
            console.log('✅ Merged image created, size:', (blob.size / 1024 / 1024).toFixed(2), 'MB');
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/jpeg', 0.85); // JPEG with 85% quality
      };

      processImages().catch(reject);
    });
  };

  const handleUpload = async () => {
    console.log('🚀 Starting upload...');
    
    if (!selectedCategory) {
      alert('Please select a category');
      return;
    }

    if (!frontImage && !noFront) {
      alert('Please upload a front image or check "No Front Image"');
      return;
    }

    if (!backImage && !noBack) {
      alert('Please upload a back image or check "No Back Image"');
      return;
    }

    setIsUploading(true);

    try {
      console.log('📸 Merging images...');
      console.log('Front:', frontImage ? frontImage.name : 'No Front');
      console.log('Back:', backImage ? backImage.name : 'No Back');
      
      // Merge images
      const mergedBlob = await mergeImages();
      console.log('✅ Images merged successfully, blob size:', mergedBlob.size);
      
      // Create FormData
      const formData = new FormData();
      formData.append('category', selectedCategory);
      formData.append('image_0', mergedBlob, `${selectedCategory}_merged_${Date.now()}.jpg`);
      
      console.log('📤 Uploading to webhook...');

      // Upload
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('📥 Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Upload successful:', result);
        alert(`✅ ${result.message || 'Upload successful!'}`);
        
        // Reset form
        setFrontImage(null);
        setBackImage(null);
        setFrontPreview(null);
        setBackPreview(null);
        setNoFront(false);
        setNoBack(false);
        setSelectedCategory(null);
      } else {
        const errorText = await response.text();
        console.error('❌ Server error:', errorText);
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      alert(`❌ Upload failed: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const canUpload = selectedCategory && 
    ((frontImage || noFront) && (backImage || noBack));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload
          </button>
          <button
            onClick={() => router.push('/gallery')}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Gallery
          </button>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Product Image Upload
          </h1>
          <p className="text-gray-600 text-lg">
            Select a category and upload front & back images
          </p>
        </div>

        {/* Category Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-6 rounded-2xl border-2 transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'border-indigo-500 bg-indigo-50 shadow-lg scale-105'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center mx-auto mb-4`}>
                <span className="text-3xl">{category.icon}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {category.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {category.description}
              </p>
            </button>
          ))}
        </div>

        {/* Image Upload Section */}
        {selectedCategory && (
          <div className="bg-white rounded-2xl p-8 border-2 border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              
              {/* FRONT Image */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">F</span>
                  Front View
                </h3>
                
                <input
                  ref={frontInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFrontImage}
                  className="hidden"
                  id="front-upload"
                  disabled={noFront || isUploading}
                />

                {frontPreview ? (
                  <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-blue-500">
                    <img src={frontPreview} alt="Front" className="w-full h-full object-cover" />
                    <button
                      onClick={removeFrontImage}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="front-upload"
                    className={`aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
                      noFront 
                        ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
                        : 'border-blue-400 hover:border-blue-500 hover:bg-blue-50'
                    }`}
                  >
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <p className="text-gray-700 font-semibold">Upload Front Image</p>
                  </label>
                )}

                <label className="flex items-center gap-2 mt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noFront}
                    onChange={(e) => {
                      setNoFront(e.target.checked);
                      if (e.target.checked) removeFrontImage();
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-600">No front image available</span>
                </label>
              </div>

              {/* BACK Image */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">B</span>
                  Back View
                </h3>
                
                <input
                  ref={backInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBackImage}
                  className="hidden"
                  id="back-upload"
                  disabled={noBack || isUploading}
                />

                {backPreview ? (
                  <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-purple-500">
                    <img src={backPreview} alt="Back" className="w-full h-full object-cover" />
                    <button
                      onClick={removeBackImage}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="back-upload"
                    className={`aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
                      noBack 
                        ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
                        : 'border-purple-400 hover:border-purple-500 hover:bg-purple-50'
                    }`}
                  >
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <p className="text-gray-700 font-semibold">Upload Back Image</p>
                  </label>
                )}

                <label className="flex items-center gap-2 mt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noBack}
                    onChange={(e) => {
                      setNoBack(e.target.checked);
                      if (e.target.checked) removeBackImage();
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-600">No back image available</span>
                </label>
              </div>
            </div>

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={!canUpload || isUploading}
              className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 ${
                !canUpload || isUploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'
              }`}
            >
              {isUploading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Uploading & Merging Images...
                </span>
              ) : (
                'Upload & Process Images'
              )}
            </button>

            {/* Info */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-lg">ℹ️</span>
                <p className="text-sm text-blue-700">
                  <span className="font-semibold">Note:</span> Upload both front and back images for best results. The AI will generate a model wearing your product from both angles.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}