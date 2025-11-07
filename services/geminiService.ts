/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import {GoogleGenAI} from '@google/genai';

// This check is for development-time feedback.
if (!process.env.API_KEY) {
  console.error(
    'API_KEY environment variable is not set. The application will not be able to connect to the Gemini API.',
  );
}

// The "!" asserts API_KEY is non-null after the check.
const ai = new GoogleGenAI({apiKey: process.env.API_KEY!});
const textModelName = 'gemini-2.5-flash-lite';
const artModelName = 'gemini-2.5-flash';

/**
 * Streams a definition for a given topic from the Gemini API.
 * @param topic The word or term to define.
 * @returns An async generator that yields text chunks of the definition.
 */
export async function* streamDefinition(
  topic: string,
): AsyncGenerator<string, void, undefined> {
  if (!process.env.API_KEY) {
    yield 'Error: API_KEY is not configured. Please check your environment variables to continue.';
    return;
  }

  const prompt = `From the perspective of TRĒSOR DẼSIGN, a creative agency focused on growth and positivity, provide an inspiring and insightful, single-paragraph definition for the term: "${topic}". Frame it in the context of design, creativity, or personal growth. Strictly avoid generating content that is offensive, controversial, biased, or harmful. Do not use markdown, titles, or any special formatting. Respond with only the text of the definition itself.`;

  try {
    const response = await ai.models.generateContentStream({
      model: textModelName,
      contents: prompt,
      config: {
        // Disable thinking for the lowest possible latency.
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    for await (const chunk of response) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error('Error streaming from Gemini:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    yield `Error: Could not generate content for "${topic}". ${errorMessage}`;
    // Re-throwing allows the caller to handle the error state definitively.
    throw new Error(errorMessage);
  }
}


/**
 * Streams a piece of ASCII art for a given topic from the Gemini API.
 * @param topic The concept to visualize.
 * @returns An async generator that yields chunks of the ASCII art.
 */
export async function* generateAsciiArt(
  topic: string,
): AsyncGenerator<string, void, undefined> {
  if (!process.env.API_KEY) {
    yield 'Error: API_KEY is not configured.';
    return;
  }
  
  const prompt = `From the perspective of TRĒSOR DẼSIGN, a creative agency focused on growth and positivity, generate a sophisticated, elegant, and creative piece of ASCII art representing the concept of: "${topic}". The art should be detailed, appear somewhat 3D, and fill a terminal-like space. It must be strictly safe-for-work and avoid any offensive, controversial, or harmful themes. Respond with only the raw ASCII art, without any explanations, titles, or markdown.`;

  try {
    const response = await ai.models.generateContentStream({
      model: artModelName,
      contents: prompt,
    });
    
    for await (const chunk of response) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error('Error generating ASCII art:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    yield `Error: ${errorMessage}`;
    throw new Error(errorMessage);
  }
}