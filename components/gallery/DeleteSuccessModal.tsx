'use client';

import { useEffect } from 'react';

interface DeleteSuccessModalProps {
  isOpen: boolean;
  productName: string;
  onClose: () => void;
}

export default function DeleteSuccessModal({
  isOpen,
  productName,
  onClose,
}: DeleteSuccessModalProps) {

  // Auto-close after 8 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes checkmark {
          0% {
            stroke-dashoffset: 100;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        
        .animate-slide-up {
          animation: slideUp 0.4s ease-out;
        }
        
        .checkmark-circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          animation: checkmark 0.6s ease-in-out 0.2s forwards;
        }
        
        .checkmark-check {
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: checkmark 0.4s ease-in-out 0.8s forwards;
        }
      `}</style>

      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-slide-up">
          
          {/* Animated Success Icon (Red for Delete) */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <svg className="w-24 h-24" viewBox="0 0 100 100">
                {/* Circle Background */}
                <circle cx="50" cy="50" r="45" fill="#EF4444" opacity="0.1"/>
                {/* Animated Circle */}
                <circle 
                  className="checkmark-circle"
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="none" 
                  stroke="#EF4444" 
                  strokeWidth="4"
                />
                {/* Animated Checkmark */}
                <path 
                  className="checkmark-check"
                  d="M 30 50 L 45 65 L 70 35" 
                  fill="none" 
                  stroke="#EF4444" 
                  strokeWidth="6" 
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          
          {/* Title */}
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">
            Product Deleted! 🗑️
          </h2>
          
          {/* Description */}
          <p className="text-center text-gray-600 text-lg mb-6 leading-relaxed">
            <span className="font-semibold text-gray-900">{productName}</span> has been marked for deletion. It will be completely removed from the system within 
            <span className="font-semibold text-red-600"> 5 minutes</span>.
          </p>
          
          {/* Info Box */}
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h4 className="font-semibold text-red-900 mb-1">Processing deletion</h4>
                <p className="text-sm text-red-700">
                  Our system is removing all AI variations and cleaning up storage. The product will disappear automatically.
                </p>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-red-600/30"
            >
              Got it!
            </button>
          </div>
          
          {/* Additional Info */}
          <p className="text-center text-sm text-gray-500 mt-4">
            The product is now hidden from the gallery
          </p>
          
        </div>
      </div>
    </>
  );
}