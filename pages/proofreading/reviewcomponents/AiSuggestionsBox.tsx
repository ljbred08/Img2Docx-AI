/**
 * pages/proofreading/reviewcomponents/AiSuggestionsBox.tsx
 * 
 * An informational box displayed during review that conveys AI analysis results.
 * It changes visual appearance based on error status and provides bulk actions 
 * like "Accept All" or "Discard All" suggestions.
 */

import React from 'react';
import { Sparkles, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AiSuggestionsBoxProps {
  /** Current status of the AI analyst */
  status: 'idle' | 'analyzing' | 'done' | 'error';
  /** Whether issues were found */
  hasError: boolean;
  /** Whether the user is currently looking at a visual diff */
  isDiffMode: boolean;
  /** Whether there are pending changes remaining in the suggestion buffer */
  hasPendingChanges: boolean;
  /** The actual text message returned by the AI or error service */
  aiMessage: string | null;
  /** Bulk action callbacks */
  onDiscardAll: () => void;
  onAcceptAll: () => void;
  /** Tailwind class for vertical scaling constraints */
  maxHeightClass: string;
}

export const AiSuggestionsBox: React.FC<AiSuggestionsBoxProps> = ({
  status,
  hasError,
  isDiffMode,
  hasPendingChanges,
  aiMessage,
  onDiscardAll,
  onAcceptAll,
  maxHeightClass
}) => {
  return (
    <div className={`p-4 rounded-xl flex items-start gap-3 border transition-all overflow-y-auto ${maxHeightClass} ${
      status === 'analyzing' ? 'bg-blue-50 border-blue-100 animate-pulse' : 
      hasError ? 'bg-amber-50 border-amber-100' : 'bg-green-50 border-green-100'
    }`}>
      {/* Dynamic Icon choice */}
      {status === 'analyzing' ? <Sparkles className="text-blue-500 mt-0.5 shrink-0" size={18} /> :
       hasError ? <AlertTriangle className="text-amber-600 mt-0.5 shrink-0" size={18} /> : <CheckCircle className="text-green-600 mt-0.5 shrink-0" size={18} />}

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-4 mb-1.5">
          <h4 className={`text-sm font-semibold ${
            status === 'analyzing' ? 'text-blue-800' : hasError ? 'text-amber-800' : 'text-green-800'
          }`}>
            {status === 'analyzing' ? "AI is Checking..." : hasError ? "AI Suggestions:" : "Analysis Complete"}
          </h4>
          
          {/* Action buttons shown only when relevant corrections are pending */}
          {isDiffMode && hasPendingChanges && (
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" className="py-1 px-3 text-xs bg-white" onClick={onDiscardAll}>Discard All</Button>
              <Button className="py-1 px-3 text-xs" onClick={onAcceptAll}>Accept All</Button>
            </div>
          )}
        </div>
        
        {/* Main AI feedback text */}
        <p className={`text-sm whitespace-pre-wrap leading-relaxed ${
          status === 'analyzing' ? 'text-blue-700' : hasError ? 'text-amber-700' : 'text-green-700'
        }`}>
          {status === 'analyzing' ? "Hang tight, compare text with the image." : aiMessage}
        </p>
      </div>
    </div>
  );
};