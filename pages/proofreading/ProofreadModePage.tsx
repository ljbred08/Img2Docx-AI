/**
 * pages/proofreading/ProofreadModePage.tsx
 * 
 * A selection screen where the user decides how to review the document content.
 * Options include:
 * - AI Assistant: Automated proofreading via Gemini or OpenRouter models.
 * - Manual Review: Manual editing of the raw OCR text.
 * - Skip: Direct download using the raw OCR results.
 */

import React from 'react';
import { CheckCircle, Sparkles, FileText, ArrowRight } from 'lucide-react';
import { Button } from '../../components/Button';

interface ProofreadModePageProps {
  /** Navigation and selection callbacks */
  onSelectAi: () => void;
  onSelectManual: () => void;
  onSkip: () => void;
  onBack: () => void;
}

export const ProofreadModePage: React.FC<ProofreadModePageProps> = ({
  onSelectAi,
  onSelectManual,
  onSkip,
  onBack
}) => {
  return (
    <div className="max-w-xl mx-auto space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <div className="inline-flex p-3 bg-green-100 text-green-600 rounded-xl mb-4"><CheckCircle size={28} /></div>
        <h2 className="text-2xl font-bold text-slate-900">Text Extracted</h2>
        <p className="text-slate-500 mt-2">How would you like to review the document?</p>
      </div>

      <div className="space-y-3">
        {/* AI Proofreading Option */}
        <button 
          className="w-full p-4 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center gap-4 text-left group" 
          onClick={onSelectAi}
        >
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Sparkles size={20} className="fill-current" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-slate-900 group-hover:text-blue-700">AI Assistant</h4>
            <p className="text-sm text-slate-500">Use Gemini or OpenRouter to catch errors.</p>
          </div>
          <ArrowRight className="text-slate-300 group-hover:text-blue-500" size={20} />
        </button>

        {/* Manual Editing Option */}
        <button 
          className="w-full p-4 rounded-xl border-2 border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all flex items-center gap-4 text-left group" 
          onClick={onSelectManual}
        >
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <FileText size={20} />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-slate-900">Manual Review</h4>
            <p className="text-sm text-slate-500">Edit the text yourself without AI help.</p>
          </div>
          <ArrowRight className="text-slate-300 group-hover:text-slate-500" size={20} />
        </button>
      </div>

      {/* Footer Navigation */}
      <div className="flex gap-3 pt-4 border-t border-slate-100">
         <Button variant="ghost" onClick={onBack} className="flex-1">Back</Button>
         <Button variant="ghost" onClick={onSkip} className="flex-1">Skip & Download</Button>
      </div>
    </div>
  );
};