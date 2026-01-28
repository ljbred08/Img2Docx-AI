/**
 * pages/config/MistralConfigPage.tsx
 * 
 * A configuration view to collect the Mistral AI API key.
 * This key is essential for performing OCR using Mistral's latest models.
 */

import React from 'react';
import { FileText, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    <div className="max-w-xl mx-auto space-y-6 bg-card p-8 rounded-2xl shadow-sm border border-border animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <div className="inline-flex p-3 bg-primary/10 text-primary rounded-xl mb-4"><FileText size={28} /></div>
        <h2 className="text-2xl font-bold text-foreground">OCR Configuration</h2>
        <p className="text-muted-foreground mt-2 text-sm">Mistral's OCR model is required to convert image content to Markdown.</p>
      </div>

      {/* API Key Input Section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mistral-key">Mistral API Key</Label>
          <Input
            id="mistral-key"
            type="password"
            value={mistralKey}
            onChange={(e) => setMistralKey(e.target.value)}
            placeholder="sk-..."
            className="rounded-xl h-11"
          />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            id="remember_mistral"
            checked={rememberMistral}
            onChange={(e) => setRememberMistral(e.target.checked)}
            className="rounded border-input text-primary focus:ring-ring"
          />
          <Label htmlFor="remember_mistral" className="text-xs text-muted-foreground cursor-pointer select-none">
            Remember this key for next time
          </Label>
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
        <Button onClick={onStart} disabled={isProcessing} className="flex-1">
          {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Start OCR
        </Button>
      </div>
    </div>
  );
};