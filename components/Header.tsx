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
    <header className="bg-background border-b border-border px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="bg-primary p-2 rounded-lg">
          <FileText className="text-primary-foreground" size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Img2Docx AI</h1>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Professional Document OCR</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {showProgress && totalPages && (
          <div className="hidden md:flex flex-col items-end gap-1.5">
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Progress</div>
            <div className="flex gap-1.5">
              {Array.from({ length: totalPages }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 w-8 rounded-full transition-all duration-500 ${i <= (currentPage ?? -1)
                    ? 'bg-primary shadow-[0_0_8px_rgba(30,41,59,0.3)]'
                    : 'bg-muted'
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