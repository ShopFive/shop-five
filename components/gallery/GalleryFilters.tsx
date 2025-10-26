'use client';

import { Category, ViewMode, DateFilter } from '@/types/gallery';
import { Search, X, Grid3x3, Grid2x2, LayoutGrid, List } from 'lucide-react';

interface GalleryFiltersProps {
  selectedCategory: Category | 'all';
  onCategoryChange: (category: Category | 'all') => void;
  dateFilter: DateFilter;
  onDateFilterChange: (filter: DateFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export default function GalleryFilters({
  selectedCategory,
  onCategoryChange,
  dateFilter,
  onDateFilterChange,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onClearFilters,
  hasActiveFilters,
}: GalleryFiltersProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        {/* Category Filter */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => onCategoryChange('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedCategory === 'all'
                  ? 'bg-[#5b8def] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => onCategoryChange('clothes')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedCategory === 'clothes'
                  ? 'bg-[#5b8def] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              👕 Clothes
            </button>
            <button
              onClick={() => onCategoryChange('caps')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedCategory === 'caps'
                  ? 'bg-[#5b8def] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🧢 Caps
            </button>
            <button
              onClick={() => onCategoryChange('shoes')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedCategory === 'shoes'
                  ? 'bg-[#5b8def] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              👟 Shoes
            </button>
          </div>
        </div>

        {/* Date Filter */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => onDateFilterChange('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                dateFilter === 'all'
                  ? 'bg-[#5b8def] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => onDateFilterChange('today')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                dateFilter === 'today'
                  ? 'bg-[#5b8def] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => onDateFilterChange('week')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                dateFilter === 'week'
                  ? 'bg-[#5b8def] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => onDateFilterChange('month')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                dateFilter === 'month'
                  ? 'bg-[#5b8def] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              This Month
            </button>
          </div>
        </div>
      </div>

      {/* Search and View Mode */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        {/* Search */}
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search images..."
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5b8def] focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* View Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            View
          </label>
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => onViewModeChange('grid-2')}
              title="2 Columns"
              className={`p-2 rounded transition-all duration-200 ${
                viewMode === 'grid-2'
                  ? 'bg-white text-[#5b8def] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid2x2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => onViewModeChange('grid-4')}
              title="4 Columns"
              className={`p-2 rounded transition-all duration-200 ${
                viewMode === 'grid-4'
                  ? 'bg-white text-[#5b8def] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => onViewModeChange('grid-6')}
              title="6 Columns"
              className={`p-2 rounded transition-all duration-200 ${
                viewMode === 'grid-6'
                  ? 'bg-white text-[#5b8def] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              title="List View"
              className={`p-2 rounded transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-white text-[#5b8def] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="whitespace-nowrap px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}