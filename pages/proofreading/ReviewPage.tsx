/**
 * pages/proofreading/ReviewPage.tsx
 * 
 * The core interactive workspace for reviewing and correcting OCR results.
 * Responsibilities include:
 * - Displaying the original image alongside the extracted Markdown text.
 * - Calling AI proofreading services to analyze and suggest fixes.
 * - Implementing a "Diff Mode" where users can surgically accept/reject AI changes.
 * - Managing the local state of the edited text for a single page.
 */

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { ArrowRight } from 'lucide-react';
import { diffLines } from 'diff';
import { OcrPageResult, AiConfig } from '../../types';
import { proofreadPage } from '../../services/proofreading';
import { Button } from '@/components/ui/button';

// Refactored UI Subcomponents
import { ReviewHeader } from './reviewcomponents/ReviewHeader';
import { ImageDisplay } from './reviewcomponents/ImageDisplay';
import { AiSuggestionsBox } from './reviewcomponents/AiSuggestionsBox';
import { EditorView } from './reviewcomponents/EditorView';

interface ReviewPageProps {
  /** The specific OCR page data to review */
  page: OcrPageResult;
  /** Configuration for the AI assistant, or null for manual mode */
  aiConfig: AiConfig | null;
  /** Current page index and total pages (for the progress indicator) */
  pageIndex: number;
  totalPages: number;
  /** Callback to advance to the next page with the final content */
  onNext: (markdown: string) => void;
  /** Callback to navigate backwards in the workflow */
  onBack: () => void;
  /** Global auto-advance state */
  autoAdvance: boolean;
  setAutoAdvance: (val: boolean) => void;
}

export const ReviewPage: React.FC<ReviewPageProps> = ({ 
  page, 
  aiConfig, 
  pageIndex, 
  totalPages, 
  onNext,
  onBack,
  autoAdvance,
  setAutoAdvance
}) => {
  // --- Text & AI Suggestion State ---
  const [text, setText] = useState(page.markdown);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  
  // --- UI Status State ---
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'done' | 'error'>('idle');
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isDiffMode, setIsDiffMode] = useState(false);
  
  /** 
   * Tracks number of automatic retries performed for the current page analysis.
   * Reset on page change.
   */
  const [retryCount, setRetryCount] = useState(0);
  
  // --- Custom Prompt State ---
  const [customPrompt, setCustomPrompt] = useState('');

  // Ref to track the current analysis request to handle component unmounting or page changes
  const analysisIdRef = useRef<number>(0);

  /**
   * Orchestrates the AI analysis call.
   * Can be triggered automatically or manually with custom instructions.
   */
  const runAnalysis = useCallback(async (instructions?: string, markdownToAnalyze?: string) => {
    // Manual mode: simply stay idle
    if (!aiConfig) {
      setStatus('idle');
      return;
    }

    setStatus('analyzing');
    const currentAnalysisId = ++analysisIdRef.current;
    
    try {
      // Use provided markdown or fallback to original OCR markdown
      const textToUse = markdownToAnalyze !== undefined ? markdownToAnalyze : page.markdown;
      const result = await proofreadPage(page, aiConfig, instructions, textToUse);
      
      // Prevent updates if a newer request has been started or page has changed
      if (currentAnalysisId !== analysisIdRef.current) return;

      if (!result.isValid) {
        setSuggestion(result.correctedMarkdown);
        setAiMessage(result.reason || "Errors detected and corrections suggested.");
        setHasError(true);
        setIsDiffMode(true);
      } else {
        setSuggestion(null);
        setAiMessage("No errors detected. Text looks good.");
        setHasError(false);
        setIsDiffMode(false);
      }
      setStatus('done');
    } catch (err) {
      if (currentAnalysisId !== analysisIdRef.current) return;
      console.error(err);
      setAiMessage("AI analysis failed. Review manually.");
      setHasError(true);
      setStatus('error');
    }
  }, [page, aiConfig]);

  /**
   * Main logic effect to reset state and trigger AI analysis when the page or config changes.
   */
  useEffect(() => {
    setText(page.markdown);
    setAiMessage(null);
    setHasError(false);
    setSuggestion(null);
    setIsDiffMode(false);
    setCustomPrompt('');
    setRetryCount(0); // Reset retries for the new page
    
    // Initial analysis uses the fresh page content
    runAnalysis(undefined, page.markdown);
    
    return () => { analysisIdRef.current += 1; };
  }, [page, aiConfig, runAnalysis]);

  /**
   * Pipeline Control Logic: Handles Auto-Advance and Error Retries.
   * - If 'done' and 'autoAdvance' is active: Proceed to next page after short delay.
   * - If 'error' and 'autoAdvance' is active: Automatically retry once before pausing.
   */
  useEffect(() => {
    // 1. Success Path: Auto-advance to next page
    if (autoAdvance && status === 'done') {
      const timer = setTimeout(() => {
        // Double check conditions still apply after timeout
        if (autoAdvance && status === 'done') {
          const finalContent = suggestion || text;
          onNext(finalContent);
        }
      }, 800);
      return () => clearTimeout(timer);
    }

    // 2. Error Path: Retry once automatically
    if (autoAdvance && status === 'error' && retryCount < 1) {
      const timer = setTimeout(() => {
        if (autoAdvance && status === 'error' && retryCount < 1) {
          setRetryCount(1); // Mark that we've used our single automatic retry
          runAnalysis(customPrompt, text);
        }
      }, 1500); // 1.5s delay to let transient issues resolve
      return () => clearTimeout(timer);
    }
  }, [status, autoAdvance, suggestion, text, onNext, retryCount, runAnalysis, customPrompt]);

  /**
   * Computes the visual difference between the current text and the AI's suggested correction.
   */
  const diffParts = useMemo(() => {
    if (!suggestion) return [];
    try {
      return diffLines(text, suggestion);
    } catch (e) {
      console.error("Diff failed", e);
      return [];
    }
  }, [text, suggestion]);

  /**
   * Tracks whether there are still active suggestions (additions/removals) to review.
   */
  const hasPendingChanges = useMemo(() => {
    return diffParts.some(part => part.added || part.removed);
  }, [diffParts]);

  /**
   * Automatically exit Diff Mode if no more pending changes exist.
   */
  useEffect(() => {
    if (isDiffMode && !hasPendingChanges) {
      setIsDiffMode(false);
      setSuggestion(null);
    }
  }, [isDiffMode, hasPendingChanges]);

  /**
   * Logic to accept a specific change block from the diff.
   */
  const handleAcceptChange = (index: number) => {
    if (!suggestion) return;
    const parts = diffLines(text, suggestion);
    const newText = parts.map((part, i) => {
      if (i === index) {
        if (part.added) return part.value;
        if (part.removed) return '';
        return part.value;
      }
      if (part.removed) return part.value;
      if (part.added) return '';
      return part.value;
    }).join('');
    setText(newText);
  };

  /**
   * Logic to discard a specific change block from the diff.
   */
  const handleDiscardChange = (index: number) => {
    if (!suggestion) return;
    const parts = diffLines(text, suggestion);
    const newSuggestion = parts.map((part, i) => {
      if (i === index) {
        if (part.added) return '';
        if (part.removed) return part.value;
        return part.value;
      }
      if (part.removed) return '';
      if (part.added) return part.value;
      return part.value;
    }).join('');
    setSuggestion(newSuggestion);
  };

  /**
   * Bulk accept all AI suggestions.
   */
  const handleAcceptAll = () => {
    if (suggestion) setText(suggestion);
    setIsDiffMode(false);
    setSuggestion(null);
  };

  /**
   * Bulk discard all AI suggestions.
   */
  const handleDiscardAll = () => {
    setSuggestion(null);
    setIsDiffMode(false);
  };

  /**
   * Triggers a rerun of AI analysis with the current custom prompt.
   */
  const handleRerunAi = (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'analyzing') {
      setRetryCount(0); // Reset retry logic for manual reruns
      runAnalysis(customPrompt, text);
    }
  };

  const isProcessed = status === 'done' && !hasPendingChanges;
  const maxHeightClass = isProcessed ? 'max-h-24' : 'max-h-48';

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col animate-in fade-in duration-500">
      {/* Page Navigation & Status Header with integrated AI prompt */}
      <ReviewHeader 
        pageIndex={pageIndex}
        totalPages={totalPages}
        status={status}
        hasError={hasError}
        isDiffMode={isDiffMode}
        aiProvider={aiConfig?.provider}
        customPrompt={customPrompt}
        setCustomPrompt={setCustomPrompt}
        onRerun={handleRerunAi}
        isAnalyzing={status === 'analyzing'}
        autoAdvance={autoAdvance}
        setAutoAdvance={setAutoAdvance}
      />

      {/* Main Review Layout (Side-by-Side) */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left: Original Document Image */}
        <div className="flex-1 relative bg-slate-950 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
          <ImageDisplay previewUrl={page.originalImage.previewUrl} />
        </div>

        {/* Right: Interaction Column */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden relative">
          
          {/* AI Suggestion Alert Box */}
          {aiConfig && (
             <AiSuggestionsBox 
               status={status}
               hasError={hasError}
               isDiffMode={isDiffMode}
               hasPendingChanges={hasPendingChanges}
               aiMessage={aiMessage}
               onDiscardAll={handleDiscardAll}
               onAcceptAll={handleAcceptAll}
               maxHeightClass={maxHeightClass}
             />
          )}

          {/* Interactive Markdown Editor / Diff View */}
          <EditorView 
            isDiffMode={isDiffMode}
            text={text}
            setText={setText}
            diffParts={diffParts}
            suggestion={suggestion}
            hasPendingChanges={hasPendingChanges}
            setIsDiffMode={setIsDiffMode}
            onAcceptChange={handleAcceptChange}
            onDiscardChange={handleDiscardChange}
          />

          {/* Review Actions Footer */}
          <div className="pt-2 flex gap-3">
            <Button 
              variant="outline" 
              className="h-12 px-6 text-lg"
              onClick={onBack}
            >
              Back
            </Button>
            <Button 
              variant="primary" 
              className="flex-1 h-12 text-lg shadow-lg"
              onClick={() => onNext(text)}
            >
               {pageIndex === totalPages - 1 ? 'Finish & Download' : 'Confirm Page'} <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
