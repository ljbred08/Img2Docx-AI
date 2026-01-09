/**
 * components/Header.tsx
 * 
 * The main navigation header component for the application.
 * Displays the application logo and current page progress when in Review mode.
 */

import React from 'react';

interface HeaderProps {
  /** The current page number being reviewed */
  currentPage?: number;
  /** Total number of pages in the current project */
  totalPages?: number;
  /** Whether to display the progress indicator */
  showProgress?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, totalPages, showProgress }) => {
  return (
    <header className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Branding Area */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">D</div>
          <h1 className="text-xl font-bold text-slate-900">Img2Docx Pro</h1>
        </div>

        {/* Optional Progress Indicator */}
        {showProgress && currentPage !== undefined && totalPages !== undefined && (
          <div className="text-sm font-medium text-slate-500">
            Page: <span className="text-slate-900 font-bold">{currentPage + 1} / {totalPages}</span>
          </div>
        )}
      </div>
    </header>
  );
};