export const runOpenRouterProofread = async (
  base64Data: string,
  markdown: string,
  systemPrompt: string,
  apiKey: string,
  modelId: string
): Promise<string> => {
  // The ":nitro" suffix is used by OpenRouter to trigger their optimized routing.
  // We also use it to conditionally apply custom provider preferences.
  const isNitro = modelId.endsWith(':nitro');

  const createPayload = (useJsonFormat: boolean) => {
    const payload: any = {
      model: modelId, // Keep the suffix as OpenRouter supports it directly.
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
      ...(useJsonFormat ? { response_format: { type: "json_object" } } : {})
    };

    // Apply specific provider preferences for Nitro mode as requested.
    if (isNitro) {
      payload.provider = {
        order: ["groq", "sambanova", "fireworks"],
        allow_fallbacks: true,
        require_parameters: true,
        sort: "throughput"
      };
    }

    return payload;
  };

  const performRequest = async (useJsonFormat: boolean) => {
    const payload = createPayload(useJsonFormat);
    
    console.debug(`[OpenRouter] Sending request:`, {
      modelId,
      isNitro,
      payload
    });

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

  // Attempt 1: Try WITH json_object format
  let response = await performRequest(true);
  
  if (!response.ok && response.status >= 400 && response.status < 500) {
    const errorBody = await response.clone().text();
    console.warn(`[OpenRouter] JSON mode fallback for ${modelId} (${response.status}). Retrying...`, errorBody);
    
    const retryResponse = await performRequest(false);
    if (retryResponse.ok || retryResponse.status < 400) {
      response = retryResponse;
    }
  }

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("[OpenRouter] API Error:", {
      status: response.status,
      statusText: response.statusText,
      body: errorBody,
      model: modelId
    });
    throw new Error(`OpenRouter API Error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
     console.error("[OpenRouter] Invalid API response:", data);
     throw new Error(`Received invalid response structure from OpenRouter.`);
  }

  return data.choices[0].message.content || "{}";
};