'use client';

import { GalleryStats } from '@/types/gallery';
import { RefreshCw } from 'lucide-react';

interface GalleryHeaderProps {
  stats: GalleryStats;
  onRefresh: () => void;
  loading: boolean;
}

export default function GalleryHeader({ stats, onRefresh, loading }: GalleryHeaderProps) {
  return (
    <div className="mb-8">
      {/* Title */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Image Gallery
          </h1>
          <p className="text-gray-600">
            Browse and download AI-enhanced images
          </p>
        </div>
        
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-[#5b8def] hover:bg-[#4a7ad8] text-white rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div className="text-sm font-medium text-blue-600 mb-1">Total Images</div>
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
        </div>

        {/* Clothes */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <div className="text-sm font-medium text-green-600 mb-1 flex items-center gap-2">
            <span>👕</span>
            <span>Clothes</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.clothes}</div>
        </div>

        {/* Caps */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <div className="text-sm font-medium text-purple-600 mb-1 flex items-center gap-2">
            <span>🧢</span>
            <span>Caps</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.caps}</div>
        </div>

        {/* Shoes */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
          <div className="text-sm font-medium text-orange-600 mb-1 flex items-center gap-2">
            <span>👟</span>
            <span>Shoes</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.shoes}</div>
        </div>
      </div>
    </div>
  );
}