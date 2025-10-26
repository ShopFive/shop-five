'use client';

interface UploadedImage {
  file: File;
  preview: string;
}
import Image from 'next/image';

interface ImagePreviewProps {
  images: UploadedImage[];
  onRemove: (id: string) => void;
}

export default function ImagePreview({ images, onRemove }: ImagePreviewProps) {
  if (images.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200 group"
          >
            <Image
              src={image.preview}
              alt="Preview"
              fill
              className="object-cover"
            />
            
            <button
              onClick={() => onRemove(image.id)}
              className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-sm transition-all duration-200 opacity-0 group-hover:opacity-100"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}