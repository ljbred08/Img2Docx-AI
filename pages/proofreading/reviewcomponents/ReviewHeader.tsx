
/**
 * pages/proofreading/reviewcomponents/ReviewHeader.tsx
 * 
 * The specialized header for the Review Page.
 * Displays page progress (X/Y), the AI instruction input, and status badges.
 */

import React from 'react';
import { Loader2, CheckCircle, AlertTriangle, Info, Send } from 'lucide-react';

interface ReviewHeaderProps {
  /** Page metadata */
  pageIndex: number;
  totalPages: number;
  /** Current AI/Processing status */
  status: 'idle' | 'analyzing' | 'done' | 'error';
  /** Whether the AI identified issues in the current text */
  hasError: boolean;
  /** Whether the user is viewing the visual diff */
  isDiffMode: boolean;
  /** Provider string for descriptive labeling */
  aiProvider?: string;
  /** AI Instruction Form Props */
  customPrompt: string;
  setCustomPrompt: (val: string) => void;
  onRerun: (e: React.FormEvent) => void;
  isAnalyzing: boolean;
}

export const ReviewHeader: React.FC<ReviewHeaderProps> = ({ 
  pageIndex, 
  totalPages, 
  status, 
  hasError, 
  isDiffMode,
  aiProvider,
  customPrompt,
  setCustomPrompt,
  onRerun,
  isAnalyzing
}) => {
  return (
    <div className="flex gap-4 mb-4 items-end">
      {/* Left side: shrink-0 ensures it only takes necessary width, allowing right side to expand left */}
      <div className="shrink-0 pb-1">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          Page Review ({pageIndex + 1}/{totalPages})
          {status === 'analyzing' && <Loader2 className="animate-spin text-blue-500" size={18}/>}
        </h2>
        <p className="text-sm text-slate-500 leading-tight">
          {!aiProvider 
            ? "Review the OCR text manually." 
            : "Review suggestions or edit manually."}
        </p>
      </div>

      {/* Right side: flex-1 expands to fill the blank space in the middle */}
      <div className="flex-1 flex items-center gap-3 h-10 min-w-0">
        {/* Instruction Form - Flex-1 to fill remaining space */}
        {aiProvider && (
          <form 
            onSubmit={onRerun}
            className={`flex-1 h-full flex items-center bg-white pl-1.5 pr-1.5 rounded-full border border-slate-200 shadow-sm transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 ${isAnalyzing ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}
            style={{ marginTop: 0, marginBottom: 0 }}
          >
            <div className="pl-2 pr-2 flex items-center text-blue-600 shrink-0">
              {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </div>
            <input 
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Instructions for AI corrections..."
              className="flex-1 bg-transparent border-none outline-none text-xs text-slate-700 font-medium placeholder:text-slate-400 h-full"
            />
            <button 
              type="submit"
              disabled={isAnalyzing}
              className="px-4 h-7 bg-slate-100 text-slate-600 rounded-full text-xs font-bold hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-300 transition-colors shrink-0 ml-1"
            >
              Rerun
            </button>
          </form>
        )}

        {/* Status Badge - Fixed height, smaller text-xs */}
        <div className={`h-full px-4 rounded-full text-xs font-semibold border flex items-center gap-2 shadow-sm shrink-0 whitespace-nowrap ${
          status === 'analyzing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
          hasError ? 'bg-amber-50 text-amber-700 border-amber-200' :
          status === 'idle' ? 'bg-slate-100 text-slate-600 border-slate-200' :
          'bg-green-50 text-green-700 border-green-200'
        }`}
        style={{ marginTop: 0, marginBottom: 0 }}
        >
          {status === 'analyzing' && <><Loader2 className="animate-spin" size={14}/> Analyzing...</>}
          {status === 'done' && (hasError ? <><AlertTriangle size={14} className="shrink-0"/> {isDiffMode ? 'Reviewing Changes' : 'Errors Detected'}</> : <><CheckCircle size={14} className="shrink-0"/> Looks Good</>)}
          {status === 'error' && <><AlertTriangle size={14}/> AI Error</>}
          {status === 'idle' && <><Info size={14}/> Manual Review</>}
        </div>
      </div>
    </div>
  );
};
