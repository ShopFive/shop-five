'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  productName: string;
  productId: string;
  onClose: () => void;
  onConfirmDelete: (productId: string) => Promise<void>;
}

export default function DeleteConfirmationModal({
  isOpen,
  productName,
  productId,
  onClose,
  onConfirmDelete,
}: DeleteConfirmationModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset to step 1 when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setIsDeleting(false);
    }
  }, [isOpen]);

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isDeleting]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleClose = () => {
    if (!isDeleting) {
      setStep(1);
      onClose();
    }
  };

  const handleStep1Confirm = () => {
    setStep(2);
  };

  const handleFinalDelete = async () => {
    setIsDeleting(true);
    
    try {
      await onConfirmDelete(productId);
      handleClose();
    } catch (error) {
      console.error('Delete failed:', error);
      // Error handling is done in parent component
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) {
          handleClose();
        }
      }}
    >
      {/* STEP 1: Initial Warning */}
      {step === 1 && (
        <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border-3 border-gray-400 animate-in fade-in zoom-in duration-200">
          <div className="text-center mb-6">
            <div className="text-6xl md:text-7xl mb-4">⚠️</div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Delete Product?
            </h3>
            <p className="text-gray-600 text-base md:text-lg">
              This product and all its images will be permanently deleted.
            </p>
            <div className="mt-4 p-3 bg-gray-100 rounded-xl border-2 border-gray-300">
              <p className="text-sm font-bold text-gray-900 truncate">
                {productName}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-6 py-3 md:py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold border-3 border-gray-300 hover:border-gray-400 transition-all text-sm md:text-base"
            >
              Cancel
            </button>
            <button
              onClick={handleStep1Confirm}
              className="flex-1 px-6 py-3 md:py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold border-3 border-red-600 hover:scale-105 transition-all text-sm md:text-base"
            >
              Delete Product
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Final Confirmation */}
      {step === 2 && (
        <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border-3 border-red-500 animate-in fade-in zoom-in duration-200">
          <div className="text-center mb-6">
            <div className="text-6xl md:text-7xl mb-4">🚨</div>
            <h3 className="text-2xl md:text-3xl font-bold text-red-600 mb-3">
              Final Confirmation
            </h3>
            <p className="text-gray-900 font-bold mb-2 text-base md:text-lg">
              WARNING: This action is permanent and cannot be undone!
            </p>
            <p className="text-gray-600 text-sm md:text-base">
              All images will be deleted from the system.
            </p>
            <div className="mt-4 p-3 bg-red-50 rounded-xl border-2 border-red-300">
              <p className="text-sm font-bold text-red-900 truncate">
                {productName}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isDeleting}
              className="flex-1 px-6 py-3 md:py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold border-3 border-gray-300 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            >
              Cancel
            </button>
            <button
              onClick={handleFinalDelete}
              disabled={isDeleting}
              className="flex-1 px-6 py-3 md:py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold border-3 border-red-700 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm md:text-base"
            >
              {isDeleting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Deleting...
                </span>
              ) : (
                'Permanently Delete'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}