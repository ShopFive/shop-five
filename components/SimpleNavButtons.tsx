'use client';

import { Upload, Image } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export default function SimpleNavButtons() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="w-full py-6 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center gap-3">
          {/* Upload Button */}
          <button
            onClick={() => router.push('/upload')}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl font-medium
              transition-all duration-200 shadow-md hover:shadow-lg
              ${pathname === '/upload'
                ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white'
                : 'bg-white border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50'
              }
            `}
          >
            <Upload className="w-5 h-5" />
            <span>Upload</span>
          </button>

          {/* Gallery Button */}
          <button
            onClick={() => router.push('/gallery')}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl font-medium
              transition-all duration-200 shadow-md hover:shadow-lg
              ${pathname === '/gallery'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                : 'bg-white border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50'
              }
            `}
          >
            <Image className="w-5 h-5" />
            <span>Gallery</span>
          </button>
        </div>
      </div>
    </div>
  );
}