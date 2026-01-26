/**
 * App.tsx
 * 
 * The central orchestrator for the Img2Docx application.
 * Responsibilities include:
 * - Managing global application state (current step, uploaded images, OCR results).
 * - Implementing the main workflow logic (OCR processing, document generation).
 * - Routing between different workflow steps (Upload, Config, Review, Download).
 */

import React, { useState, useEffect } from 'react';
import saveAs from 'file-saver';
import { AppStep, UploadedImage, OcrPageResult, AiConfig } from './types';
import { createPdfFromImages } from './services/pdfService';
import { performMistralOcr } from './services/mistralService';
import { generateDocx } from './services/docxService';
import { DEV_KEYS } from './devConfig';

// UI Components
import { Header } from './components/Header';
import { UploadSortPage } from './pages/upload/UploadSortPage';
import { MistralConfigPage } from './pages/config/MistralConfigPage';
import { ProcessingPage } from './pages/processing/ProcessingPage';
import { ProofreadModePage } from './pages/proofreading/ProofreadModePage';
import { ModelConfigPage } from './pages/proofreading/ModelConfigPage';
import { ReviewPage } from './pages/proofreading/ReviewPage';
import { DownloadPage } from './pages/download/DownloadPage';

export default function App() {
  // --- Step & Navigation State ---
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  
  // --- Core Data State ---
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [ocrResults, setOcrResults] = useState<OcrPageResult[]>([]);
  const [finalMarkdownPages, setFinalMarkdownPages] = useState<string[]>([]);
  
  // --- Configuration State ---
  const [mistralKey, setMistralKey] = useState('');
  const [rememberMistral, setRememberMistral] = useState(false);
  const [aiConfig, setAiConfig] = useState<AiConfig | null>(null);
  const [includePageBreaks, setIncludePageBreaks] = useState(true);
  const [autoAdvance, setAutoAdvance] = useState(false);

  // --- UI/UX Status State ---
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFilesLoading, setIsFilesLoading] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /**
   * Effect to load saved Mistral API key from localStorage or devConfig on initialization.
   */
  useEffect(() => {
    const savedMistral = localStorage.getItem('img2docx_mistral_key') || DEV_KEYS.MISTRAL;
    if (savedMistral) {
      setMistralKey(savedMistral);
      setRememberMistral(true);
    }
  }, []);

  /**
   * Orchestrates the OCR pipeline using Mistral AI.
   * Converts user images into a combined PDF, uploads it, and processes it into Markdown.
   */
  const startOcr = async () => {
    if (!mistralKey) {
      setErrorMsg("Please enter a Mistral API Key");
      return;
    }
    
    // Save or clear the key based on user preference
    if (rememberMistral) {
      localStorage.setItem('img2docx_mistral_key', mistralKey);
    } else {
      localStorage.removeItem('img2docx_mistral_key');
    }

    setErrorMsg(null);
    setIsProcessing(true);
    setStep(AppStep.PROCESSING_OCR);
    try {
      // 1. Generate a PDF from the current sequence of images
      const pdfBlob = await createPdfFromImages(images);
      
      // 2. Perform OCR via Mistral service
      const response = await performMistralOcr(pdfBlob, mistralKey);
      
      // 3. Map raw results to our internal OcrPageResult type
      const results: OcrPageResult[] = response.pages.map((page, index) => ({
        imageId: images[index]?.id || `page-${index}`,
        markdown: page.markdown,
        originalImage: images[index],
      }));
      
      setOcrResults(results);
      setStep(AppStep.PROOFREAD_MODE_SELECT);
    } catch (err: any) {
      setErrorMsg(err.message || "OCR Process Failed");
      setStep(AppStep.MISTRAL_CONFIG);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Initializes the review step with a specific AI configuration or manual mode.
   * @param config The AI provider and model ID, or null for manual review.
   */
  const startReview = (config: AiConfig | null) => {
    setAiConfig(config);
    setReviewIndex(0);
    setFinalMarkdownPages([]);
    setStep(AppStep.REVIEW_DOCUMENT);
  };

  /**
   * Handles saving progress from the ReviewPage and advancing to the next page or step.
   * @param text The finalized markdown for the current page.
   */
  const handlePageNext = (text: string) => {
    const newPages = [...finalMarkdownPages];
    newPages[reviewIndex] = text;
    setFinalMarkdownPages(newPages);
    
    if (reviewIndex < ocrResults.length - 1) {
      setReviewIndex(prev => prev + 1);
    } else {
      setStep(AppStep.DOWNLOAD);
    }
  };

  /**
   * Generates and triggers a browser download for the final document.
   * @param format 'docx' for Microsoft Word or 'md' for raw Markdown.
   */
  const handleDownload = async (format: 'docx' | 'md') => {
    // Use final proofread pages if available, otherwise fallback to raw OCR
    const content = finalMarkdownPages.length > 0 ? finalMarkdownPages : ocrResults.map(r => r.markdown);
    
    if (format === 'md') {
      const blob = new Blob([content.join('\n\n')], { type: 'text/markdown;charset=utf-8' });
      saveAs(blob, 'converted_document.md');
    } else {
      const blob = await generateDocx(content, { includePageBreaks });
      saveAs(blob, 'converted_document.docx');
    }
  };

  /**
   * Resets the application state to start a fresh project.
   */
  const handleReset = () => {
    // Cleanup allocated URLs to prevent memory leaks
    images.forEach(img => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setOcrResults([]);
    setReviewIndex(0);
    setFinalMarkdownPages([]);
    setAiConfig(null);
    setErrorMsg(null);
    setIsProcessing(false);
    setStep(AppStep.UPLOAD);
  };

  /**
   * Step router to render the appropriate view based on the current AppStep.
   */
  const renderCurrentStep = () => {
    switch (step) {
      case AppStep.UPLOAD:
      case AppStep.SORT:
        return (
          <UploadSortPage 
            images={images}
            setImages={setImages}
            isFilesLoading={isFilesLoading}
            setIsFilesLoading={setIsFilesLoading}
            onContinue={() => setStep(AppStep.MISTRAL_CONFIG)}
            onReset={handleReset}
            setError={setErrorMsg}
          />
        );
      case AppStep.MISTRAL_CONFIG:
        return (
          <MistralConfigPage 
            mistralKey={mistralKey}
            setMistralKey={setMistralKey}
            rememberMistral={rememberMistral}
            setRememberMistral={setRememberMistral}
            errorMsg={errorMsg}
            onBack={() => setStep(AppStep.SORT)}
            onStart={startOcr}
            isProcessing={isProcessing}
          />
        );
      case AppStep.PROCESSING_OCR:
        return <ProcessingPage />;
      case AppStep.PROOFREAD_MODE_SELECT:
        return (
          <ProofreadModePage 
            onSelectAi={() => setStep(AppStep.MODEL_CONFIG)}
            onSelectManual={() => startReview(null)}
            onSkip={() => {
              setFinalMarkdownPages(ocrResults.map(r => r.markdown));
              setStep(AppStep.DOWNLOAD);
            }}
            onBack={() => setStep(AppStep.SORT)}
          />
        );
      case AppStep.MODEL_CONFIG:
        return (
          <ModelConfigPage 
            onBack={() => setStep(AppStep.PROOFREAD_MODE_SELECT)}
            onConfirm={startReview}
          />
        );
      case AppStep.REVIEW_DOCUMENT:
        return ocrResults[reviewIndex] ? (
          <ReviewPage 
            page={ocrResults[reviewIndex]}
            aiConfig={aiConfig}
            pageIndex={reviewIndex}
            totalPages={ocrResults.length}
            onNext={handlePageNext}
            onBack={() => {
              if (reviewIndex > 0) setReviewIndex(prev => prev - 1);
              else setStep(AppStep.PROOFREAD_MODE_SELECT);
            }}
            autoAdvance={autoAdvance}
            setAutoAdvance={setAutoAdvance}
          />
        ) : null;
      case AppStep.DOWNLOAD:
        return (
          <DownloadPage 
            includePageBreaks={includePageBreaks}
            setIncludePageBreaks={setIncludePageBreaks}
            onDownload={handleDownload}
            onBackToReview={() => {
              setStep(AppStep.REVIEW_DOCUMENT);
              setReviewIndex(ocrResults.length - 1);
            }}
            onReset={handleReset}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        currentPage={step === AppStep.REVIEW_DOCUMENT ? reviewIndex : undefined}
        totalPages={step === AppStep.REVIEW_DOCUMENT ? ocrResults.length : undefined}
        showProgress={step === AppStep.REVIEW_DOCUMENT}
      />
      <main className="flex-1 bg-slate-50 py-8 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full">
          {renderCurrentStep()}
        </div>
      </main>
    </div>
  );
}
