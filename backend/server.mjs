import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

loadEnvFile(join(process.cwd(), 'backend', '.env'));

const PORT = Number(process.env.PORT ?? 8787);
const OPENAI_MODEL = process.env.OPENAI_VISION_MODEL ?? 'gpt-4.1-mini';

const extractionPrompt = `You are extracting shelf-price information for a grocery shopping accessibility app.
Return only compact JSON with this exact shape:
{
  "productName": string | null,
  "price": number | null,
  "category": "produce" | "protein" | "pantry" | "household" | null,
  "priceText": string | null,
  "confidence": number,
  "quickSummary": string,
  "notes": string[]
}

Rules:
- Look for shelf labels, product packaging, or receipts.
- Prefer the most likely current selling price visible in the image.
- If multiple prices are visible, choose the clearest product-level price and explain uncertainty in notes.
- confidence must be between 0 and 1.
- quickSummary should be short and easy for a user with cognitive overload to understand.
- If the image is unclear, keep values null rather than inventing them.`;

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  const fileContents = readFileSync(filePath, 'utf8');

  for (const rawLine of fileContents.split('\n')) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');

    if (separatorIndex < 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function json(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(payload));
}

async function readBody(request) {
  let body = '';

  for await (const chunk of request) {
    body += chunk;
  }

  return body ? JSON.parse(body) : {};
}

function parseModelJson(rawText) {
  const fencedMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidateText = fencedMatch?.[1] ?? rawText;

  try {
    const parsed = JSON.parse(candidateText);

    return {
      productName: typeof parsed.productName === 'string' ? parsed.productName : null,
      price: typeof parsed.price === 'number' ? parsed.price : null,
      category:
        ['produce', 'protein', 'pantry', 'household'].includes(parsed.category)
          ? parsed.category
          : null,
      priceText: typeof parsed.priceText === 'string' ? parsed.priceText : null,
      confidence:
        typeof parsed.confidence === 'number'
          ? Math.max(0, Math.min(1, parsed.confidence))
          : 0,
      quickSummary:
        typeof parsed.quickSummary === 'string'
          ? parsed.quickSummary
          : 'Image reviewed, but the price still needs a quick check.',
      notes: Array.isArray(parsed.notes)
        ? parsed.notes.filter((note) => typeof note === 'string')
        : [],
    };
  } catch {
    return null;
  }
}

async function extractPrice(imageBase64) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured on the backend.');
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_VISION_MODEL ?? OPENAI_MODEL,
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: extractionPrompt },
            {
              type: 'input_image',
              image_url: `data:image/jpeg;base64,${imageBase64}`,
              detail: 'high',
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI error ${response.status}: ${errorText}`);
  }

  const payload = await response.json();
  return parseModelJson(payload.output_text ?? '');
}

const server = createServer(async (request, response) => {
  if (!request.url) {
    json(response, 404, { error: 'Not found' });
    return;
  }

  if (request.method === 'OPTIONS') {
    json(response, 204, {});
    return;
  }

  if (request.url === '/health' && request.method === 'GET') {
    json(response, 200, {
      ok: true,
      proxy: 'shop-ability-price-proxy',
      openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
      model: process.env.OPENAI_VISION_MODEL ?? OPENAI_MODEL,
    });
    return;
  }

  if (request.url === '/api/extract-price' && request.method === 'POST') {
    try {
      const body = await readBody(request);
      const imageBase64 = typeof body.imageBase64 === 'string' ? body.imageBase64 : '';

      if (!imageBase64) {
        json(response, 400, { error: 'imageBase64 is required.' });
        return;
      }

      const data = await extractPrice(imageBase64);
      json(response, 200, { data });
    } catch (error) {
      json(response, 500, {
        error: error instanceof Error ? error.message : 'Unknown proxy error',
      });
    }

    return;
  }

  json(response, 404, { error: 'Not found' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Shop Ability proxy listening on http://0.0.0.0:${PORT}`);
});
