/**
 * pages/proofreading/reviewcomponents/ImageDisplay.tsx
 * 
 * A focused component to render the source document image during review.
 * Features a dark slate background to help focus on document content.
 */

import React from 'react';

interface ImageDisplayProps {
  /** The object URL or data URI of the image to display */
  previewUrl: string;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ previewUrl }) => {
  return (
    <div className="flex-1 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center p-4 shadow-inner">
       {/* Maximize image while maintaining aspect ratio */}
       <img src={previewUrl} alt="Original" className="max-w-full max-h-full object-contain" />
    </div>
  );
};