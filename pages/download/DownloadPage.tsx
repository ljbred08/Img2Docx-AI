/**
 * pages/download/DownloadPage.tsx
 * 
 * The final view of the application workflow.
 * Responsibilities include:
 * - Displaying final document layout options (e.g. Page Breaks).
 * - Triggering the generation and download of DOCX and Markdown files.
 * - Providing a clear path to restart the project or go back for final edits.
 */

import React from 'react';
import { FileUp, Settings2, Check, Download, FileText } from 'lucide-react';
import { Button } from '../../components/Button';

interface DownloadPageProps {
  /** Document layout settings state and setter */
  includePageBreaks: boolean;
  setIncludePageBreaks: (val: boolean) => void;
  /** Download trigger callback */
  onDownload: (format: 'docx' | 'md') => void;
  /** Navigation callbacks */
  onBackToReview: () => void;
  onReset: () => void;
}

export const DownloadPage: React.FC<DownloadPageProps> = ({
  includePageBreaks,
  setIncludePageBreaks,
  onDownload,
  onBackToReview,
  onReset
}) => {
  return (
    <div className="max-w-xl mx-auto text-center space-y-8 py-10 animate-in fade-in zoom-in duration-500">
      {/* Success Hero Section */}
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <FileUp size={40} />
      </div>
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Ready to Download</h2>
        <p className="text-slate-500 mt-2 text-lg">Your processed document is formatted and ready.</p>
      </div>

      {/* Formatting Options Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-left shadow-sm max-w-sm mx-auto">
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Settings2 size={16} /> Document Layout
        </h4>
        <div 
          className="flex items-center gap-3 group cursor-pointer" 
          onClick={() => setIncludePageBreaks(!includePageBreaks)}
        >
          {/* Custom Checkbox */}
          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${includePageBreaks ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'}`}>
            {includePageBreaks && <Check size={14} />}
          </div>
          <span className="text-sm text-slate-700 font-medium select-none">Include Page Breaks</span>
        </div>
        <p className="text-xs text-slate-500 mt-2 ml-8">When checked, each original image starts on a new page in the Word document.</p>
      </div>

      {/* Download Action Cards */}
      <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
        <Button onClick={() => onDownload('docx')} className="h-24 flex-col gap-2 bg-blue-600 hover:bg-blue-700">
          <Download size={24} />
          <span>Microsoft Word</span>
        </Button>
        <Button onClick={() => onDownload('md')} variant="secondary" className="h-24 flex-col gap-2">
          <FileText size={24} />
          <span>Markdown File</span>
        </Button>
      </div>

      {/* Footer Secondary Navigation */}
      <div className="pt-8 border-t border-slate-200 flex flex-col gap-3">
        <Button variant="outline" onClick={onBackToReview} className="w-full">Back to Review</Button>
        <Button variant="ghost" onClick={onReset} className="w-full">Start New Project</Button>
      </div>
    </div>
  );
};