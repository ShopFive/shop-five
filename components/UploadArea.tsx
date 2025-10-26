'use client';

import { useCallback, useState } from 'react';

interface UploadAreaProps {
  onFilesSelected: (files: File[]) => void;
}

export default function UploadArea({ onFilesSelected }: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024
    );

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  }, [onFilesSelected]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024
    );

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  }, [onFilesSelected]);

  return (
    <div
      onDrag={handleDrag}
      onDragStart={handleDrag}
      onDragEnd={handleDrag}
      onDragOver={handleDragIn}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-input')?.click()}
      className={`
        border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
        transition-all duration-300 bg-gray-50
        ${isDragging 
          ? 'border-[#5b8def] bg-[#e8f0fe]' 
          : 'border-gray-300 hover:border-[#5b8def] hover:bg-[#f0f5ff]'
        }
      `}
    >
      <div className="w-16 h-16 mx-auto mb-4 bg-[#e8f0fe] rounded-full flex items-center justify-center text-[#5b8def] text-4xl">
        📸
      </div>
      
      <p className="text-base font-medium text-gray-900 mb-2">
        Click to upload or drag and drop
      </p>
      
      <p className="text-sm text-gray-600">
        PNG, JPG, JPEG (Max 10MB per file)
      </p>

      <input
        id="file-input"
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  );
}