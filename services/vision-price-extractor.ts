import type { VisionPriceExtraction } from '@/types';

const PRICE_PROXY_URL = process.env.EXPO_PUBLIC_PRICE_PROXY_URL;

export function isVisionExtractionConfigured() {
  return Boolean(PRICE_PROXY_URL);
}

export async function extractPriceFromImageBase64(
  imageBase64: string,
): Promise<VisionPriceExtraction | null> {
  if (!PRICE_PROXY_URL) {
    return null;
  }

  const response = await fetch(`${PRICE_PROXY_URL.replace(/\/$/, '')}/api/extract-price`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      imageBase64,
    }),
  });

  if (!response.ok) {
    throw new Error(`Vision proxy failed with status ${response.status}`);
  }

  const payload = (await response.json()) as {
    data?: VisionPriceExtraction | null;
  };

  return payload.data ?? null;
}
