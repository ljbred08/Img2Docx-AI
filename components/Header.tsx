/**
 * components/Header.tsx
 * 
 * The main navigation header component for the application.
 * Displays the application logo and current page progress when in Review mode.
 */

import React from 'react';
import { AccountMenu } from './AccountMenu';
import { FileText } from 'lucide-react'; // Assuming lucide-react is installed for the icon

interface HeaderProps {
  /** The current page number being reviewed */
  currentPage?: number;
  /** Total number of pages in the current project */
  totalPages?: number;
  /** Whether to display the progress indicator */
  showProgress?: boolean;
  /** Callback for when the sign in button is clicked */
  onSignInClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  totalPages,
  showProgress,
  onSignInClick
}) => {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-2 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <FileText className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Img2Docx AI</h1>
          <p className="text-xs text-slate-500 font-medium">Professional Document OCR</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {showProgress && totalPages && (
          <div className="hidden md:flex flex-col items-end gap-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress</div>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-6 rounded-full transition-all duration-300 ${i <= (currentPage ?? -1) ? 'bg-indigo-600' : 'bg-slate-100'
                    }`}
                />
              ))}
            </div>
          </div>
        )}
        <AccountMenu
          onSignInClick={onSignInClick}
          showSignInButton={!showProgress || currentPage === undefined}
        />
      </div>
    </header>
  );
};