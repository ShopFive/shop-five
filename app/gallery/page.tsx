'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import PageNavButtons from '@/components/PageNavButtons';
import GalleryHeader from '@/components/gallery/GalleryHeader';
import GalleryFilters from '@/components/gallery/GalleryFilters';
import ImageGroupCard from '@/components/gallery/ImageGroupCard';
import EnhancedImageLightbox from '@/components/gallery/EnhancedImageLightbox';
import DebugGalleryAPI from '@/components/DebugGalleryAPI';
import { ImageGroup, ViewMode, Category, DateFilter } from '@/types/gallery';

export default function GalleryPage() {
  const [imageGroups, setImageGroups] = useState<ImageGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // View settings
  const [viewMode, setViewMode] = useState<ViewMode>('grid-4');
  const [selectedGroup, setSelectedGroup] = useState<ImageGroup | null>(null);
  const [selectedVariationIndex, setSelectedVariationIndex] = useState(0);

  // Fetch image groups from n8n webhook
  useEffect(() => {
    fetchImageGroups();
  }, []);

  const fetchImageGroups = async () => {
    try {
      setLoading(true);
      setError(null);

      // Replace with your n8n webhook URL
      const webhookURL = 'https://n8n.srv880249.hstgr.cloud/webhook/gallery-images';

      const response = await fetch(webhookURL);

      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }

      const data = await response.json();
      setImageGroups(data.imageGroups || []);

    } catch (err) {
      console.error('Error fetching images:', err);
      setError('Failed to load images. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Filter image groups based on selected filters
  const filteredGroups = useMemo(() => {
    let filtered = [...imageGroups];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(group => group.category === selectedCategory);
    }

    // Date filter
    const now = new Date();
    if (dateFilter !== 'all') {
      filtered = filtered.filter(group => {
        const uploadDate = new Date(group.uploadDate);
        const diffTime = Math.abs(now.getTime() - uploadDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (dateFilter) {
          case 'today':
            return diffDays === 0;
          case 'week':
            return diffDays <= 7;
          case 'month':
            return diffDays <= 30;
          default:
            return true;
        }
      });
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [imageGroups, selectedCategory, dateFilter, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredGroups.length;
    const clothes = filteredGroups.filter(g => g.category === 'clothes').length;
    const caps = filteredGroups.filter(g => g.category === 'caps').length;
    const shoes = filteredGroups.filter(g => g.category === 'shoes').length;

    return { total, clothes, caps, shoes };
  }, [filteredGroups]);

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setDateFilter('all');
    setSearchQuery('');
  };

  const handleVariationClick = (group: ImageGroup, variationIndex: number) => {
    setSelectedGroup(group);
    setSelectedVariationIndex(variationIndex);
  };

  const hasActiveFilters = selectedCategory !== 'all' || dateFilter !== 'all' || searchQuery !== '';

  const getGridClasses = () => {
    switch (viewMode) {
      case 'grid-2':
        return 'grid-cols-1 md:grid-cols-2 gap-6';
      case 'grid-4':
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5';
      case 'grid-6':
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4';
      case 'list':
        return 'grid-cols-1 gap-4';
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Navigation Buttons */}
      <PageNavButtons />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <GalleryHeader 
          stats={stats}
          onRefresh={fetchImageGroups}
          loading={loading}
        />

        {/* Filters Section */}
        <GalleryFilters
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Image Groups Grid */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Images</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={fetchImageGroups}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : loading ? (
          <div className={`grid ${getGridClasses()}`}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg mb-3" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="aspect-square bg-gray-200 rounded" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">📸</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Images Found</h3>
            <p className="text-gray-600 mb-4">
              {hasActiveFilters 
                ? 'Try adjusting your filters to see more results.'
                : 'Upload some images to get started!'
              }
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="px-6 py-2 bg-[#5b8def] hover:bg-[#4a7ad8] text-white rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className={`grid ${getGridClasses()}`}>
              {filteredGroups.map((group) => (
                <ImageGroupCard
                  key={group.id}
                  group={group}
                  viewMode={viewMode}
                  onVariationClick={handleVariationClick}
                />
              ))}
            </div>

            {/* Results count */}
            <div className="mt-6 text-center text-sm text-gray-600">
              Showing {filteredGroups.length} {filteredGroups.length === 1 ? 'product' : 'products'}
              {hasActiveFilters && ' (filtered)'}
            </div>
          </>
        )}

       {/* Enhanced Lightbox with Before/After Slider */}
        {selectedGroup && (
          <EnhancedImageLightbox
            group={selectedGroup}
            initialVariationIndex={selectedVariationIndex}
            onClose={() => setSelectedGroup(null)}
          />
        )}

        {/* Debug Button */}
        <DebugGalleryAPI />
      </main>
    </div>
  );
}