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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
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
      // Generate unique timestamp for both images
      const timestamp = Date.now();
      
      console.log('📸 Preparing to upload images...');
      console.log('Front:', frontImage ? frontImage.name : 'No Front');
      console.log('Back:', backImage ? backImage.name : 'No Back');
      console.log('Timestamp:', timestamp);
      
      let uploadedCount = 0;
      
      // Upload Front Image
      if (frontImage && !noFront) {
        // ✅ إنشاء File جديد بالاسم الصحيح
        const newFileName = `${selectedCategory}_${timestamp}_front.jpg`;
        const renamedFrontFile = new File([frontImage], newFileName, {
          type: frontImage.type,
          lastModified: Date.now(),
        });
        
        const frontFormData = new FormData();
        frontFormData.append('category', selectedCategory);
        frontFormData.append('timestamp', timestamp.toString());
        frontFormData.append('side', 'front');
        frontFormData.append('image_0', renamedFrontFile);
        
        console.log('📤 Uploading FRONT image:', newFileName);
        
        const frontResponse = await fetch('/api/upload', {
          method: 'POST',
          body: frontFormData,
        });

        if (!frontResponse.ok) {
          const errorText = await frontResponse.text();
          throw new Error(`Front upload failed: ${frontResponse.status} - ${errorText}`);
        }
        
        console.log('✅ Front image uploaded successfully');
        uploadedCount++;
      }
      
      // Upload Back Image
      if (backImage && !noBack) {
        // ✅ إنشاء File جديد بالاسم الصحيح
        const newFileName = `${selectedCategory}_${timestamp}_back.jpg`;
        const renamedBackFile = new File([backImage], newFileName, {
          type: backImage.type,
          lastModified: Date.now(),
        });
        
        const backFormData = new FormData();
        backFormData.append('category', selectedCategory);
        backFormData.append('timestamp', timestamp.toString());
        backFormData.append('side', 'back');
        backFormData.append('image_0', renamedBackFile);
        
        console.log('📤 Uploading BACK image:', newFileName);
        
        const backResponse = await fetch('/api/upload', {
          method: 'POST',
          body: backFormData,
        });

        if (!backResponse.ok) {
          const errorText = await backResponse.text();
          throw new Error(`Back upload failed: ${backResponse.status} - ${errorText}`);
        }
        
        console.log('✅ Back image uploaded successfully');
        uploadedCount++;
      }
      
      console.log(`✅ Upload complete! ${uploadedCount} image(s) uploaded`);
      setShowSuccessModal(true);
      
      // Reset form
      setFrontImage(null);
      setBackImage(null);
      setFrontPreview(null);
      setBackPreview(null);
      setNoFront(false);
      setNoBack(false);
      setSelectedCategory(null);
      
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
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes checkmark {
          0% {
            stroke-dashoffset: 100;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        
        @keyframes progressBar {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
        
        .animate-slide-up {
          animation: slideUp 0.4s ease-out;
        }
        
        .checkmark-circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          animation: checkmark 0.6s ease-in-out 0.2s forwards;
        }
        
        .checkmark-check {
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: checkmark 0.4s ease-in-out 0.8s forwards;
        }
        
        .progress-fill {
          animation: progressBar 5s linear forwards;
        }
      `}</style>

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
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Upload Images for {selectedCategory.toUpperCase()}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Front Image */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-lg font-semibold text-gray-700">
                    Front Image
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={noFront}
                      onChange={(e) => {
                        setNoFront(e.target.checked);
                        if (e.target.checked) {
                          removeFrontImage();
                        }
                      }}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="text-sm text-gray-600">No Front Image</span>
                  </label>
                </div>

                {!noFront && (
                  <>
                    <input
                      ref={frontInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFrontImage}
                      className="hidden"
                      id="front-upload"
                    />
                    
                    {frontPreview ? (
                      <div className="relative">
                        <img
                          src={frontPreview}
                          alt="Front preview"
                          className="w-full h-64 object-cover rounded-xl border-2 border-gray-200"
                        />
                        <button
                          onClick={removeFrontImage}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="front-upload"
                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all"
                      >
                        <div className="text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <p className="mt-2 text-sm text-gray-600">
                            Click to upload front image
                          </p>
                        </div>
                      </label>
                    )}
                  </>
                )}

                {noFront && (
                  <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center">
                    <p className="text-gray-500 text-lg">No Front Image</p>
                  </div>
                )}
              </div>

              {/* Back Image */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-lg font-semibold text-gray-700">
                    Back Image
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={noBack}
                      onChange={(e) => {
                        setNoBack(e.target.checked);
                        if (e.target.checked) {
                          removeBackImage();
                        }
                      }}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="text-sm text-gray-600">No Back Image</span>
                  </label>
                </div>

                {!noBack && (
                  <>
                    <input
                      ref={backInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleBackImage}
                      className="hidden"
                      id="back-upload"
                    />
                    
                    {backPreview ? (
                      <div className="relative">
                        <img
                          src={backPreview}
                          alt="Back preview"
                          className="w-full h-64 object-cover rounded-xl border-2 border-gray-200"
                        />
                        <button
                          onClick={removeBackImage}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="back-upload"
                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all"
                      >
                        <div className="text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <p className="mt-2 text-sm text-gray-600">
                            Click to upload back image
                          </p>
                        </div>
                      </label>
                    )}
                  </>
                )}

                {noBack && (
                  <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center">
                    <p className="text-gray-500 text-lg">No Back Image</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Button */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleUpload}
                disabled={!canUpload || isUploading}
                className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
                  canUpload && !isUploading
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isUploading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  'Upload Images'
                )}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-slide-up">
            
            {/* Animated Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <svg className="w-24 h-24" viewBox="0 0 100 100">
                  {/* Circle Background */}
                  <circle cx="50" cy="50" r="45" fill="#10B981" opacity="0.1"/>
                  {/* Animated Circle */}
                  <circle 
                    className="checkmark-circle"
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="#10B981" 
                    strokeWidth="4"
                  />
                  {/* Animated Checkmark */}
                  <path 
                    className="checkmark-check"
                    d="M 30 50 L 45 65 L 70 35" 
                    fill="none" 
                    stroke="#10B981" 
                    strokeWidth="6" 
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
            
            {/* Title */}
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">
              Upload Successful! 🎉
            </h2>
            
            {/* Description */}
            <p className="text-center text-gray-600 text-lg mb-6 leading-relaxed">
              Your images have been uploaded successfully! They will appear in the gallery within 
              <span className="font-semibold text-blue-600"> 5 minutes</span>.
            </p>
            
            {/* Info Box */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-1">Processing your images</h4>
                  <p className="text-sm text-blue-700">
                    Our AI is currently removing backgrounds and optimizing your images for the gallery.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Processing...</span>
                <span>5:00</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="progress-fill h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/gallery')}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-blue-600/30"
              >
                View Gallery
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 rounded-xl transition-all"
              >
                Got it, thanks!
              </button>
            </div>
            
            {/* Additional Info */}
            <p className="text-center text-sm text-gray-500 mt-4">
              You can close this window and check back later
            </p>
            
          </div>
        </div>
      )}
    </div>
  );
}