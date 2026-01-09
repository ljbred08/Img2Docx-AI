/**
 * pages/processing/ProcessingPage.tsx
 * 
 * A simple splash view displayed while background OCR operations are in progress.
 * Provides visual feedback to the user that content is being extracted.
 */

import React from 'react';

export const ProcessingPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto text-center py-20 animate-in fade-in duration-500">
      {/* Animated Spinner */}
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-6"></div>
      
      {/* Informative Messages */}
      <h3 className="text-xl font-semibold text-slate-900">Extracting Content...</h3>
      <p className="text-slate-500 mt-2">Mistral AI is analyzing your documents.</p>
    </div>
  );
};