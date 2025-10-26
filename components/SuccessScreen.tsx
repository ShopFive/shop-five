'use client';

import { UploadResult } from '@/types/types';
import { CheckCircle, Calendar, Folder, Image as ImageIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SuccessScreenProps {
  result: UploadResult;
  onUploadMore: () => void;
  onUploadToSameCategory: () => void;
}

export default function SuccessScreen({ result, onUploadMore, onUploadToSameCategory }: SuccessScreenProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // تفعيل animation الاحتفال
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'clothes': return '👕';
      case 'caps': return '🧢';
      case 'shoes': return '👟';
      default: return '📦';
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10%',
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: ['#5b8def', '#4ade80', '#fbbf24', '#f87171', '#a78bfa'][Math.floor(Math.random() * 5)],
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Success Header */}
      <div className="text-center mb-12 animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-scale-in">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Upload Successful! 🎉
        </h1>
        <p className="text-lg text-gray-600">
          {result.message}
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 mb-8 animate-slide-up">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Summary</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Category */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <Folder className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Category</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">{getCategoryIcon(result.category)}</span>
              <p className="text-2xl font-bold text-gray-900">{result.category.toUpperCase()}</p>
            </div>
          </div>

          {/* Images Count */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <div className="flex items-center gap-3 mb-2">
              <ImageIcon className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">Images Uploaded</span>
            </div>
            <p className="text-4xl font-bold text-gray-900">{result.totalCount}</p>
            <p className="text-sm text-gray-600 mt-1">
              {result.totalCount === 1 ? 'image' : 'images'}
            </p>
          </div>

          {/* Upload Time */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">Uploaded At</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatTime(result.uploadedAt)}</p>
            <p className="text-sm text-gray-600 mt-1">
              {new Date(result.uploadedAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* Images Grid */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📸</span>
            <span>Uploaded Images</span>
            <span className="text-sm font-normal text-gray-500">({result.images.length})</span>
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {result.images.map((image, index) => (
              <div 
                key={image.id}
                className="group relative bg-gray-50 rounded-lg overflow-hidden border-2 border-green-200 shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Success Badge */}
                <div className="absolute top-2 right-2 z-10">
                  <div className="bg-green-500 text-white rounded-full p-1 shadow-lg">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                </div>

                {/* Image */}
                <div className="aspect-square relative">
                  <img
                    src={image.preview}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>

                {/* Image Info */}
                <div className="p-3 bg-white">
                  <p className="text-xs font-medium text-gray-900 truncate mb-1" title={image.name}>
                    {image.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(image.size)}
                  </p>
                </div>

                {/* Image Number Badge */}
                <div className="absolute top-2 left-2">
                  <div className="bg-white/90 backdrop-blur-sm text-gray-700 rounded-full px-2 py-1 text-xs font-bold shadow-md">
                    #{index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{ animationDelay: '300ms' }}>
        <button
          onClick={onUploadToSameCategory}
          className="w-full sm:w-auto px-8 py-4 bg-[#5b8def] hover:bg-[#4a7ad8] text-white font-semibold rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl flex items-center justify-center gap-2"
        >
          <span className="text-xl">{getCategoryIcon(result.category)}</span>
          <span>Upload More to {result.category.toUpperCase()}</span>
        </button>
        
        <button
          onClick={onUploadMore}
          className="w-full sm:w-auto px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
        >
          Choose Different Category
        </button>
      </div>

      {/* Tips Section */}
      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6 animate-fade-in" style={{ animationDelay: '500ms' }}>
        <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
          <span>💡</span>
          <span>What's Next?</span>
        </h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">✓</span>
            <span>Your images have been successfully uploaded to the <strong>{result.category.toUpperCase()}</strong> folder</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">✓</span>
            <span>You can upload more images to the same category or choose a different one</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">✓</span>
            <span>All images are now available in your system for processing</span>
          </li>
        </ul>
      </div>

      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotateZ(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotateZ(720deg);
            opacity: 0;
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scale-in {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            transform: translateY(10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-confetti {
          animation: confetti linear forwards;
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
        .animate-scale-in {
          animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </main>
  );
}