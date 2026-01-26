import { GoogleGenAI, Type } from "@google/genai";

export const runGeminiProofread = async (
  base64Data: string,
  markdown: string,
  systemPrompt: string,
  modelId: string
): Promise<string> => {
  // API key from env as strictly required by guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const contents = {
    parts: [
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data,
        },
      },
      {
        text: `Here is the OCR Markdown extracted from this image:\n\n\`\`\`markdown\n${markdown}\n\`\`\`\n\n${systemPrompt}`,
      },
    ],
  };

  const config = {
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        isValid: { 
          type: Type.BOOLEAN,
          description: 'Whether the markdown accurately reflects the image content.'
        },
        reason: { 
          type: Type.STRING,
          description: 'Short explanation of errors, if any.'
        },
        correctedMarkdown: { 
          type: Type.STRING,
          description: 'The full corrected markdown text.'
        },
      },
      required: ["isValid", "correctedMarkdown"],
      propertyOrdering: ["isValid", "reason", "correctedMarkdown"],
    },
  };

  console.debug(`[Gemini] Calling ${modelId} with config:`, config);
  
  const response = await ai.models.generateContent({
    model: modelId,
    contents,
    config,
  });

  return response.text || "{}";
};