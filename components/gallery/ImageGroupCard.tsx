'use client';

import { useState } from 'react';
import { ImageGroup, ViewMode, isOldSystem, isNewSystem } from '@/types/gallery';
import { Calendar, Folder } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import DeleteSuccessModal from './DeleteSuccessModal';

interface ImageGroupCardProps {
  group: ImageGroup;
  viewMode: ViewMode;
  onVariationClick: (group: ImageGroup, variationIndex: number) => void;
  onDeleteSuccess?: () => void;
}

export default function ImageGroupCard({ 
  group, 
  viewMode, 
  onVariationClick,
  onDeleteSuccess 
}: ImageGroupCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'clothes': return '👕';
      case 'caps': return '🧢';
      case 'shoes': return '👟';
      default: return '📦';
    }
  };

  const extractFileIds = (): string[] => {
    const fileIds: string[] = [];
    
    if (isOldSystem(group)) {
      if (group.original?.id) {
        fileIds.push(group.original.id);
      }
      group.variations.forEach(variation => {
        if (variation?.id) {
          fileIds.push(variation.id);
        }
      });
    } else {
      if (group.original.front?.id) fileIds.push(group.original.front.id);
      if (group.original.back?.id) fileIds.push(group.original.back.id);
      if (group.processed.front?.id) fileIds.push(group.processed.front.id);
      if (group.processed.back?.id) fileIds.push(group.processed.back.id);
    }
    
    return fileIds;
  };

  const handleDelete = async (productId: string) => {
    setIsDeleted(true);
    
    try {
      const fileIds = extractFileIds();
      
      console.log('🗑️ Deleting files:', { 
        productId, 
        productName: group.name, 
        category: group.category,
        fileIds 
      });
      
      fetch('/api/delete-product', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: productId,
          productName: group.name,
          category: group.category,
          fileIds: fileIds,
        }),
      }).then(response => {
        if (response.ok) {
          console.log('✅ Delete API success');
          
          // ✅ Wait 2 seconds then refresh to remove from gallery
          setTimeout(() => {
            if (onDeleteSuccess) {
              onDeleteSuccess();
            }
          }, 2000);
        } else {
          console.error('❌ Delete API failed');
        }
      }).catch(error => {
        console.error('❌ Delete error:', error);
      });
      
    } catch (error) {
      console.error('❌ Delete error:', error);
    }
  };

  const handleDeleteComplete = () => {
    setShowSuccessModal(true);
  };

  const getDisplayData = () => {
    if (isOldSystem(group)) {
      return {
        originalUrl: group.original.url,
        originalFileSize: group.original.fileSize,
        variations: group.variations,
        variationsCount: group.variations.length
      };
    } else {
      const variations = [
        group.processed.front,
        group.processed.back
      ].filter(img => img !== null) as Array<{ id: string; url: string; fileSize: number }>;
      
      return {
        originalUrl: group.original.front?.url || group.original.back?.url || '',
        originalFileSize: group.original.front?.fileSize || group.original.back?.fileSize || 0,
        variations: variations,
        variationsCount: variations.length
      };
    }
  };

  const displayData = getDisplayData();

  const DeletedOverlay = () => (
    <div className="absolute inset-0 bg-gradient-to-br from-black/85 to-gray-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-30">
      <svg className="w-16 h-16 md:w-20 md:h-20 text-red-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      <span className="text-white text-2xl md:text-3xl font-bold tracking-wider">DELETED</span>
      <span className="text-gray-300 text-sm mt-2">Removing from system...</span>
    </div>
  );

  if (viewMode === 'grid-6') {
    return (
      <>
        <div className="group relative bg-white rounded-lg border border-gray-200 p-3 hover:shadow-lg transition-all duration-200">
          {isDeleted && <DeletedOverlay />}

          {!isDeleted && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteModal(true);
              }}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 bg-white rounded-lg border-2 border-red-300 hover:border-red-500 hover:bg-red-50 z-10"
              title="Delete Product"
            >
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          )}

          <button
            onClick={() => !isDeleted && onVariationClick(group, 0)}
            disabled={isDeleted}
            className="relative aspect-square rounded-lg overflow-hidden mb-2 bg-gray-100 w-full hover:ring-2 hover:ring-blue-500 transition-all disabled:cursor-not-allowed"
          >
            <img
              src={displayData.originalUrl}
              alt={group.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-1 left-1 bg-gray-700 text-white px-2 py-0.5 rounded text-xs font-bold">
              Original
            </div>
          </button>

          <div className="grid grid-cols-2 gap-1 mb-2">
            {displayData.variations.slice(0, 4).map((variation, index) => (
              <button
                key={variation.id}
                onClick={() => !isDeleted && onVariationClick(group, index)}
                disabled={isDeleted}
                className="relative aspect-square rounded overflow-hidden bg-gray-100 hover:ring-2 hover:ring-[#5b8def] transition-all disabled:cursor-not-allowed"
              >
                <img
                  src={variation.url}
                  alt={`Variation ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          <div className="text-xs">
            <p className="font-semibold text-gray-900 truncate">{group.name}</p>
            <p className="text-gray-500">+{displayData.variationsCount} {isNewSystem(group) ? 'processed' : 'variations'}</p>
          </div>
        </div>

        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          productName={group.name}
          productId={group.id}
          onClose={() => setShowDeleteModal(false)}
          onConfirmDelete={handleDelete}
          onDeleteComplete={handleDeleteComplete}
        />

        <DeleteSuccessModal
          isOpen={showSuccessModal}
          productName={group.name}
          onClose={() => setShowSuccessModal(false)}
        />
      </>
    );
  }

  if (viewMode === 'list') {
    return (
      <>
        <div className="group relative bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-all duration-200">
          {isDeleted && <DeletedOverlay />}

          {!isDeleted && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteModal(true);
              }}
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 bg-white rounded-lg border-2 border-red-300 hover:border-red-500 hover:bg-red-50 z-10"
              title="Delete Product"
            >
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          )}

          <div className="flex gap-4 items-start">
            <button
              onClick={() => !isDeleted && onVariationClick(group, 0)}
              disabled={isDeleted}
              className="relative w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 hover:ring-2 hover:ring-blue-500 transition-all disabled:cursor-not-allowed"
            >
              <img
                src={displayData.originalUrl}
                alt={group.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1 left-1 bg-gray-700/90 text-white px-2 py-0.5 rounded text-xs font-bold">
                Original
              </div>
            </button>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-gray-900 mb-2">{group.name}</h3>
              <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
                <span className="flex items-center gap-1">
                  <Folder className="w-4 h-4" />
                  <span>{getCategoryIcon(group.category)} {group.category.toUpperCase()}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(group.uploadDate)}
                </span>
                <span>{formatFileSize(displayData.originalFileSize)}</span>
              </div>

              <div className="flex gap-2 flex-wrap">
                {displayData.variations.map((variation, index) => (
                  <button
                    key={variation.id}
                    onClick={() => !isDeleted && onVariationClick(group, index)}
                    disabled={isDeleted}
                    className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 hover:ring-2 hover:ring-[#5b8def] transition-all group disabled:cursor-not-allowed"
                  >
                    <img
                      src={variation.url}
                      alt={`${isNewSystem(group) ? 'Processed' : 'Variation'} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <span className="text-white font-bold text-xs opacity-0 group-hover:opacity-100">
                        {index + 1}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          productName={group.name}
          productId={group.id}
          onClose={() => setShowDeleteModal(false)}
          onConfirmDelete={handleDelete}
          onDeleteComplete={handleDeleteComplete}
        />

        <DeleteSuccessModal
          isOpen={showSuccessModal}
          productName={group.name}
          onClose={() => setShowSuccessModal(false)}
        />
      </>
    );
  }

  return (
    <>
      <div className="group relative bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300">
        {isDeleted && <DeletedOverlay />}

        {!isDeleted && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteModal(true);
            }}
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 bg-white rounded-lg border-2 border-red-300 hover:border-red-500 hover:bg-red-50 z-20"
            title="Delete Product"
          >
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        )}

        <div className="absolute top-3 left-3 z-10">
          <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium shadow-lg">
            <span>{getCategoryIcon(group.category)}</span>
          </div>
        </div>

        <button
          onClick={() => !isDeleted && onVariationClick(group, 0)}
          disabled={isDeleted}
          className="relative aspect-square bg-gray-100 w-full hover:opacity-90 transition-opacity disabled:cursor-not-allowed"
        >
          <img
            src={displayData.originalUrl}
            alt={group.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 left-3 bg-gray-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-bold">
            Original
          </div>
          {!isDeleted && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg font-semibold text-gray-900 transition-opacity">
                Click to view
              </div>
            </div>
          )}
        </button>

        <div className="p-4">
          <h3 className="font-bold text-gray-900 mb-3 truncate">{group.name}</h3>
          
          <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(group.uploadDate)}
            </span>
            <span>{formatFileSize(displayData.originalFileSize)}</span>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              {displayData.variationsCount} {isNewSystem(group) ? 'Processed Views' : 'AI Variations'}:
            </p>
            <div className="grid grid-cols-4 gap-2">
              {displayData.variations.map((variation, index) => (
                <button
                  key={variation.id}
                  onClick={() => !isDeleted && onVariationClick(group, index)}
                  disabled={isDeleted}
                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 hover:ring-2 hover:ring-[#5b8def] transition-all group/variation disabled:cursor-not-allowed"
                >
                  <img
                    src={variation.url}
                    alt={`${isNewSystem(group) ? 'Processed' : 'Variation'} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {!isDeleted && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/variation:opacity-100 transition-opacity">
                      <div className="absolute bottom-1 left-1 right-1 text-center">
                        <span className="text-white text-xs font-bold">
                          {isNewSystem(group) ? (index === 0 ? 'Front' : 'Back') : `#${index + 1}`}
                        </span>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        productName={group.name}
        productId={group.id}
        onClose={() => setShowDeleteModal(false)}
        onConfirmDelete={handleDelete}
        onDeleteComplete={handleDeleteComplete}
      />

      <DeleteSuccessModal
        isOpen={showSuccessModal}
        productName={group.name}
        onClose={() => setShowSuccessModal(false)}
      />
    </>
  );
}