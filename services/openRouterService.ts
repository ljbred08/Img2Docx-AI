export const runOpenRouterProofread = async (
  base64Data: string,
  markdown: string,
  systemPrompt: string,
  apiKey: string,
  modelId: string
): Promise<string> => {
  
  const createPayload = (useJsonFormat: boolean) => ({
    model: modelId,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Here is the OCR Markdown extracted from this image:\n\n\`\`\`markdown\n${markdown}\n\`\`\`\n\n${systemPrompt}\n\nIMPORTANT: Return ONLY a valid JSON object. Do not include markdown formatting like \`\`\`json.`
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Data}`
            }
          }
        ]
      }
    ],
    // Prioritize high throughput as requested
    provider: {
      sort: 'throughput',
    },
    // Only include response_format if specifically requested
    ...(useJsonFormat ? { response_format: { type: "json_object" } } : {})
  });

  const performRequest = async (useJsonFormat: boolean) => {
    const payload = createPayload(useJsonFormat);
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "Img2Docx Pro",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    return response;
  };

  // Attempt 1: Try WITH json_object format first (default behavior)
  let response = await performRequest(true);
  
  // If it fails with a client error (4xx), it might be due to unsupported response_format
  // Specifically 405 (Method Not Allowed) or 400 (Bad Request) are common for this.
  if (!response.ok && response.status >= 400 && response.status < 500) {
    const errorBody = await response.clone().text();
    console.warn(`OpenRouter JSON mode likely failed (${response.status}). Retrying without response_format...`, errorBody);
    
    // Attempt 2: Retry WITHOUT response_format
    const retryResponse = await performRequest(false);
    
    // If retry is better, use it. Otherwise keep original for error reporting.
    if (retryResponse.ok || retryResponse.status < 400) {
      response = retryResponse;
    }
  }

  // Handle final response
  if (!response.ok) {
    const errorBody = await response.text();
    console.error("OpenRouter API Error Details:", {
      status: response.status,
      statusText: response.statusText,
      body: errorBody,
      model: modelId
    });
    throw new Error(`OpenRouter API Error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
     console.error("Invalid OpenRouter Response Structure:", data);
     throw new Error(`Received invalid response structure from OpenRouter. Full response: ${JSON.stringify(data)}`);
  }

  return data.choices[0].message.content || "{}";
};