'use client';

import { CategoryOption } from '@/types/types';

interface CategoryCardProps {
  category: CategoryOption;
  isSelected: boolean;
  onSelect: () => void;
}

export default function CategoryCard({ category, isSelected, onSelect }: CategoryCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`
        w-full bg-white border-2 rounded-xl p-6 transition-all duration-300
        hover:border-[#5b8def] hover:shadow-lg hover:-translate-y-1
        relative overflow-hidden text-left
        ${isSelected 
          ? 'border-[#5b8def] bg-[#f0f5ff] shadow-lg' 
          : 'border-gray-200'
        }
      `}
    >
      <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-4 bg-[#e8f0fe] text-[#5b8def]">
        {category.icon}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        {category.name}
      </h3>
      
      <p className="text-sm text-gray-600">
        {category.description}
      </p>
      
      {isSelected && (
        <div className="absolute top-4 right-4 w-6 h-6 bg-[#5b8def] rounded-full flex items-center justify-center text-white text-sm">
          ✓
        </div>
      )}
    </button>
  );
}