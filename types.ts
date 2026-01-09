export interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
  thumbnailUrl: string;
}

export interface OcrPageResult {
  imageId: string;
  markdown: string;
  originalImage: UploadedImage;
}

export interface ProofreadResult {
  imageId: string;
  originalMarkdown: string;
  correctedMarkdown: string;
  isValid: boolean;
  reason?: string;
}

export type AiProvider = 'gemini' | 'openrouter';

export interface AiConfig {
  provider: AiProvider;
  modelId: string;
  apiKey?: string; // Required for OpenRouter
}

export enum AppStep {
  UPLOAD = 'UPLOAD',
  SORT = 'SORT',
  MISTRAL_CONFIG = 'MISTRAL_CONFIG',
  PROCESSING_OCR = 'PROCESSING_OCR',
  PROOFREAD_MODE_SELECT = 'PROOFREAD_MODE_SELECT', // New: AI vs Manual
  MODEL_CONFIG = 'MODEL_CONFIG', // New: Configure AI
  REVIEW_DOCUMENT = 'REVIEW_DOCUMENT',
  DOWNLOAD = 'DOWNLOAD',
}

export interface MistralResponse {
  pages: {
    markdown: string;
    index: number;
    images: any[];
  }[];
}
