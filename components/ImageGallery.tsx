'use client';

import { GeneratedImage } from '@/types';
import Image from 'next/image';
import { Download } from 'lucide-react';

interface ImageGalleryProps {
  images: GeneratedImage[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  if (images.length === 0) return null;

  const handleDownload = async (url: string, name: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Generated Images
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <div
            key={image.id}
            className="group relative bg-gray-50 rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-200"
          >
            <div className="aspect-square relative">
              <Image
                src={image.afterUrl}
                alt={image.name}
                fill
                className="object-cover"
              />
            </div>
            
            <div className="p-4">
              <p className="font-medium text-gray-900 truncate mb-2">
                {image.name}
              </p>
              
              <button
                onClick={() => handleDownload(image.downloadUrl, image.name)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#5b8def] hover:bg-[#4a7ad8] text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}