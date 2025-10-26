'use client';

import { UploadProgress } from '@/types/types';

interface ProgressBarProps {
  progress: UploadProgress;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  const getStageText = () => {
    switch (progress.stage) {
      case 'uploading':
        return 'Uploading images...';
      case 'processing':
        return 'Processing images...';
      case 'generating':
        return `Generating images (${progress.currentImage}/${progress.totalImages})`;
      case 'complete':
        return 'Complete!';
      case 'error':
        return 'Error occurred';
      default:
        return 'Processing...';
    }
  };

  const getStageColor = () => {
    switch (progress.stage) {
      case 'complete':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-[#5b8def]';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            progress.stage === 'complete' ? 'bg-green-100 text-green-600' :
            progress.stage === 'error' ? 'bg-red-100 text-red-600' :
            'bg-blue-100 text-blue-600'
          }`}>
            {progress.stage === 'complete' ? '✓' :
             progress.stage === 'error' ? '✕' :
             <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            }
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{getStageText()}</h3>
            <p className="text-sm text-gray-600">{progress.message}</p>
          </div>
        </div>
        <span className="text-lg font-bold text-gray-900">{Math.round(progress.progress)}%</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getStageColor()}`}
          style={{ width: `${progress.progress}%` }}
        />
      </div>

      {progress.stage === 'generating' && (
        <div className="mt-4 grid grid-cols-9 gap-2">
          {Array.from({ length: progress.totalImages || 9 }).map((_, index) => (
            <div
              key={index}
              className={`aspect-square rounded-lg border-2 transition-all duration-300 ${
                index < (progress.currentImage || 0)
                  ? 'border-green-500 bg-green-50'
                  : index === (progress.currentImage || 0)
                  ? 'border-[#5b8def] bg-blue-50 animate-pulse'
                  : 'border-gray-300 bg-gray-50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}