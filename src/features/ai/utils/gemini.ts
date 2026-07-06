import { aiHelpers } from './index';

// Maximum size of the AI context payload to prevent excessive API usage
const MAX_USER_CONTENT_BYTES = 32 * 1024; // 32 KB

export async function callGemini(systemPrompt: string, userContent: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Do not reveal configuration details to callers
    throw new Error('AI service not configured');
  }

  // Guard against oversized payloads reaching the Gemini API
  if (userContent.length > MAX_USER_CONTENT_BYTES) {
    throw new Error('Input payload exceeds maximum allowed size');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${systemPrompt}\n\nInput Context:\n${userContent}`,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      ],
    }),
  });

  if (!response.ok) {
    // Do NOT expose upstream API error text to callers (it may contain key info)
    throw new Error(`AI service returned an error (status: ${response.status})`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Empty response from AI service');
  }

  return aiHelpers.cleanJsonMarkdown(text);
}
