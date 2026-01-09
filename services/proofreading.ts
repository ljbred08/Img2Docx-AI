
import { OcrPageResult, ProofreadResult, AiConfig } from '../types';
import { runGeminiProofread } from './geminiService';
import { runOpenRouterProofread } from './openRouterService';

const DEFAULT_PROMPT = `
You are an expert document proofreader and OCR corrector.
Compare the provided image with the provided markdown text which was extracted from it.
Your goal is to ensure the markdown accurately reflects the text, formatting, and layout in the image.

Analyze for:
1. Typos or misrecognized characters. Spelling should be exactly the same.
2. Missing text.
3. Incorrect formatting (headers, lists, italic, bold, horizontal lines/dividers, etc).
4. Incorrect layout.

Return a JSON object with:
- "isValid": boolean (true if the markdown is perfect or acceptable, false if it needs correction)
- "reason": string (short explanation of errors, if any)
- "correctedMarkdown": string (the full corrected text. If isValid is true, return the original text)

Do not be pedantic about minor whitespace, but be VERY STRICT about content accuracy.
`;

const CUSTOM_TASK_PROMPT = `
You are an expert document editor and proofreader.
You have been provided with an image of a document and its text content in markdown format.

USER INSTRUCTIONS:
"{{CUSTOM_INSTRUCTIONS}}"

Your goal is to modify the markdown text according to the User Instructions above in order to better conform to the image layout and formatting.
Use the provided image as context.
If the instructions ask to change the content (e.g. "fix grammar", "rewrite", "remove", "translate"), prioritize the instructions over strict image fidelity; however, if there is ever any leeway or creativity in how to carry out instructions, always make it as close to the image as possible.

Return a JSON object with:
- "isValid": boolean (Set to false if you made ANY changes based on the instructions. Set to true only if the text already satisfies the instructions.)
- "reason": string (Briefly explain what you changed based on the instructions.)
- "correctedMarkdown": string (The complete, modified markdown text.)
`;

export const proofreadPage = async (
  page: OcrPageResult,
  config: AiConfig,
  customInstructions?: string,
  overrideMarkdown?: string
): Promise<ProofreadResult> => {
  
  // Use the edited text if provided, otherwise fallback to the original OCR text
  const markdownToProcess = overrideMarkdown !== undefined ? overrideMarkdown : page.markdown;

  // Helper to get Base64
  const base64Data = await fetch(page.originalImage.previewUrl)
    .then((r) => r.blob())
    .then((blob) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    }));

  // Logic to switch prompts based on whether custom instructions exist
  let systemPrompt: string;
  if (customInstructions && customInstructions.trim().length > 0) {
    systemPrompt = CUSTOM_TASK_PROMPT.replace("{{CUSTOM_INSTRUCTIONS}}", customInstructions.trim());
  } else {
    systemPrompt = DEFAULT_PROMPT;
  }

  try {
    let rawText = "{}";

    if (config.provider === 'gemini') {
      rawText = await runGeminiProofread(base64Data, markdownToProcess, systemPrompt, config.modelId);
    } else if (config.provider === 'openrouter') {
      if (!config.apiKey) throw new Error("OpenRouter API Key is missing");
      rawText = await runOpenRouterProofread(base64Data, markdownToProcess, systemPrompt, config.apiKey, config.modelId);
    }

    // Clean up potential markdown code blocks from the response if the provider added them
    const jsonStr = rawText.replace(/```json\n?|\n?```/g, "").trim();
    
    let json;
    try {
        json = JSON.parse(jsonStr);
    } catch (e) {
        console.warn("Failed to parse JSON directly, trying to find object", jsonStr);
        // Fallback: try to find the first { and last }
        const first = jsonStr.indexOf('{');
        const last = jsonStr.lastIndexOf('}');
        if (first !== -1 && last !== -1) {
            json = JSON.parse(jsonStr.substring(first, last + 1));
        } else {
            throw e;
        }
    }
    
    return {
      imageId: page.imageId,
      originalMarkdown: markdownToProcess,
      correctedMarkdown: json.correctedMarkdown || markdownToProcess,
      isValid: json.isValid ?? true,
      reason: json.reason,
    };
  } catch (error: any) {
    console.error("Proofread Error", error);
    return {
      imageId: page.imageId,
      originalMarkdown: markdownToProcess,
      correctedMarkdown: markdownToProcess,
      isValid: true,
      reason: `AI check failed: ${error.message || "Unknown error"}`,
    };
  }
};
