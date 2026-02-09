import Anthropic from '@anthropic-ai/sdk';
import { ClaudeAnalysisResult } from './types';

const ANALYSIS_PROMPT = `You are analyzing an underwater image for an archaeology project.

Perform these checks in order and return structured JSON:

1. SAFETY CHECK:
   - Does the image contain NSFW content, sexually explicit material, human faces, gore, or violence?
   - Return: { "safetyViolation": true/false, "violationType": "string or null" }

2. UNDERWATER CHECK:
   - Is this clearly an underwater photograph (marine environment, water visibility, aquatic features)?
   - Return: { "isUnderwater": true/false, "reasoning": "brief explanation" }

3. MAN-MADE OBJECT DETECTION:
   - Does the image contain any man-made/artificial objects?
   - Provide confidence score (0-100)
   - Return: { "hasManMadeObject": true/false, "manMadeConfidence": number }

4. OBJECT IDENTIFICATION:
   - If man-made object found, identify the specific type
   - Categories: amphora, pottery, statue, anchor, coin, ship, cargo, cannon, chest, tool, aircraft
   - Provide confidence score (0-100)
   - Return: { "objectType": "string or null", "objectConfidence": number }

5. BOUNDING BOX:
   - If a man-made object was found, estimate its bounding box as normalized coordinates (0 to 1 range relative to image width/height)
   - x = left edge, y = top edge, width and height as fractions of the image
   - Return: { "boundingBox": { "x": number, "y": number, "width": number, "height": number } | null }

Return ONLY raw valid JSON with this exact structure (no markdown, no code fences, no explanation):
{
  "safetyViolation": boolean,
  "violationType": string | null,
  "isUnderwater": boolean,
  "underwaterReasoning": string,
  "hasManMadeObject": boolean,
  "manMadeConfidence": number,
  "objectType": string | null,
  "objectConfidence": number,
  "boundingBox": { "x": number, "y": number, "width": number, "height": number } | null
}`;

export async function analyzeImage(
  base64Image: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
): Promise<ClaudeAnalysisResult> {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: base64Image,
            },
          },
          {
            type: 'text',
            text: ANALYSIS_PROMPT,
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  // Strip markdown code fences if present (```json ... ```)
  let raw = textBlock.text.trim();
  if (raw.startsWith('```')) {
    raw = raw.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }

  const parsed: ClaudeAnalysisResult = JSON.parse(raw);
  return parsed;
}