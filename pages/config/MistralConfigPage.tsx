/**
 * pages/config/MistralConfigPage.tsx
 * 
 * A configuration view to collect the Mistral AI API key.
 * This key is essential for performing OCR using Mistral's latest models.
 */

import React from 'react';
import { FileText, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/Button';

interface MistralConfigPageProps {
  /** The currently entered API key */
  mistralKey: string;
  setMistralKey: (val: string) => void;
  /** Whether the user wants to persist the key in localStorage */
  rememberMistral: boolean;
  setRememberMistral: (val: boolean) => void;
  /** Error message to display if validation or processing fails */
  errorMsg: string | null;
  /** Navigation callbacks */
  onBack: () => void;
  onStart: () => void;
  /** Loading status during the initial OCR file upload */
  isProcessing: boolean;
}

export const MistralConfigPage: React.FC<MistralConfigPageProps> = ({
  mistralKey,
  setMistralKey,
  rememberMistral,
  setRememberMistral,
  errorMsg,
  onBack,
  onStart,
  isProcessing
}) => {
  return (
    <div className="max-w-xl mx-auto space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <div className="inline-flex p-3 bg-purple-100 text-purple-600 rounded-xl mb-4"><FileText size={28} /></div>
        <h2 className="text-2xl font-bold text-slate-900">OCR Configuration</h2>
        <p className="text-slate-500 mt-2 text-sm">Mistral's OCR model is required to convert image content to Markdown.</p>
      </div>

      {/* API Key Input Section */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Mistral API Key</label>
        <input 
          type="password" 
          value={mistralKey} 
          onChange={(e) => setMistralKey(e.target.value)} 
          placeholder="sk-..." 
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" 
        />
        <div className="flex items-center gap-2 mt-2">
          <input 
            type="checkbox" 
            id="remember_mistral"
            checked={rememberMistral}
            onChange={(e) => setRememberMistral(e.target.checked)}
            className="rounded border-slate-300 text-purple-600 focus:ring-indigo-500"
          />
          <label htmlFor="remember_mistral" className="text-xs text-slate-500 cursor-pointer select-none">
            Remember this key for next time
          </label>
        </div>
      </div>

      {/* Error display */}
      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
          <AlertTriangle size={16} />{errorMsg}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button variant="ghost" onClick={onBack} className="flex-1">Back</Button>
        <Button onClick={onStart} isLoading={isProcessing} className="flex-1">Start OCR</Button>
      </div>
    </div>
  );
};