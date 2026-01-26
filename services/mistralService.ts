import { MistralResponse } from '../types';

export const performMistralOcr = async (pdfBlob: Blob, apiKey: string): Promise<MistralResponse> => {
  // Step 1: Upload the PDF to the Mistral files endpoint
  const formData = new FormData();
  formData.append('file', pdfBlob, 'document.pdf');
  formData.append('purpose', 'ocr');

  console.debug("[Mistral] Uploading file for OCR...");
  const uploadResponse = await fetch('https://api.mistral.ai/v1/files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!uploadResponse.ok) {
    const errorData = await uploadResponse.json().catch(() => ({}));
    throw new Error(`Mistral File Upload failed (${uploadResponse.status}): ${errorData.message || uploadResponse.statusText}`);
  }

  const fileData = await uploadResponse.json();
  const fileId = fileData.id;

  // Step 2: Get a signed URL for the uploaded file
  const urlResponse = await fetch(`https://api.mistral.ai/v1/files/${fileId}/url`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  if (!urlResponse.ok) {
    const errorData = await urlResponse.json().catch(() => ({}));
    throw new Error(`Failed to get signed URL for file (${urlResponse.status}): ${errorData.message || urlResponse.statusText}`);
  }

  const { url: signedUrl } = await urlResponse.json();

  // Step 3: Call the OCR endpoint with the signed URL
  const ocrPayload = {
    model: 'mistral-ocr-latest',
    document: {
      type: 'document_url',
      document_url: signedUrl,
    }
  };

  console.debug("[Mistral] Requesting OCR with payload:", ocrPayload);

  const ocrResponse = await fetch('https://api.mistral.ai/v1/ocr', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ocrPayload),
  });

  if (!ocrResponse.ok) {
    const errorData = await ocrResponse.json().catch(() => ({}));
    throw new Error(`Mistral OCR request failed (${ocrResponse.status}): ${errorData.message || ocrResponse.statusText}`);
  }

  return ocrResponse.json();
};