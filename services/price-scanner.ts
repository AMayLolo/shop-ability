import { Camera, type BarcodeScanningResult, type BarcodeType } from 'expo-camera';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { Platform } from 'react-native';

import type {
  CartCategory,
  CartItem,
  PriceScanCandidate,
  PriceScanSignal,
  VisionPriceExtraction,
} from '@/types';
import { extractPriceFromImageBase64, isVisionExtractionConfigured } from '@/services/vision-price-extractor';

type CatalogEntry = Pick<CartItem, 'category' | 'name' | 'price'> & {
  aliases?: string[];
};

type BuildCandidateInput = {
  liveBarcode?: string;
  captureBarcode?: string;
  imageUri?: string;
  visionExtraction?: VisionPriceExtraction | null;
};

const FALLBACK_CATALOG: Record<string, CatalogEntry> = {
  '041130389735': { name: 'Organic berries', category: 'produce', price: 6.5, aliases: ['berries'] },
  '002500043201': { name: 'Chicken cutlets', category: 'protein', price: 12, aliases: ['chicken'] },
  '030000570116': { name: 'Greek yogurt', category: 'protein', price: 5.25, aliases: ['yogurt'] },
  '078742146548': { name: 'Sparkling water', category: 'pantry', price: 7.4, aliases: ['water'] },
  '017000075936': { name: 'Dish soap', category: 'household', price: 4.8, aliases: ['soap'] },
};

export const SUPPORTED_BARCODE_TYPES: BarcodeType[] = [
  'ean13',
  'ean8',
  'upc_a',
  'upc_e',
  'code128',
  'code39',
  'qr',
];

export function normalizeBarcode(rawCode: string) {
  const digits = rawCode.replace(/\D/g, '');

  if (digits.length === 13 && digits.startsWith('0')) {
    return digits.slice(1);
  }

  return digits || rawCode.trim();
}

function lookupCatalog(barcode: string) {
  if (FALLBACK_CATALOG[barcode]) {
    return FALLBACK_CATALOG[barcode];
  }

  if (barcode.length === 12) {
    const eanCandidate = `0${barcode}`;
    return FALLBACK_CATALOG[eanCandidate];
  }

  return undefined;
}

function resolveCategory(
  catalogCategory: CartCategory | undefined,
  visionCategory: CartCategory | null | undefined,
): CartCategory {
  return catalogCategory ?? visionCategory ?? 'pantry';
}

export async function preprocessScanImage(uri: string) {
  const context = ImageManipulator.manipulate(uri);
  context.resize({ width: 1600, height: null });
  const rendered = await context.renderAsync();

  return rendered.saveAsync({
    compress: 0.82,
    format: SaveFormat.JPEG,
    base64: true,
  });
}

export async function scanBarcodesFromImage(uri: string) {
  if (Platform.OS === 'ios') {
    return [] as BarcodeScanningResult[];
  }

  try {
    return await Camera.scanFromURLAsync(uri, SUPPORTED_BARCODE_TYPES);
  } catch {
    return [];
  }
}

function scoreSignals(signals: PriceScanSignal[]) {
  return Math.min(
    0.99,
    Number(signals.reduce((sum, signal) => sum + signal.confidence, 0).toFixed(2)),
  );
}

export async function extractVisionPrice(imageBase64?: string | null) {
  if (!imageBase64 || !isVisionExtractionConfigured()) {
    return null;
  }

  try {
    return await extractPriceFromImageBase64(imageBase64);
  } catch {
    return null;
  }
}

export { isVisionExtractionConfigured };

export function buildPriceCandidate({
  liveBarcode,
  captureBarcode,
  imageUri,
  visionExtraction,
}: BuildCandidateInput): PriceScanCandidate | null {
  const primaryCode = captureBarcode ?? liveBarcode ?? 'manual-review';
  const normalizedBarcode = normalizeBarcode(primaryCode);
  const signals: PriceScanSignal[] = [];
  const reviewNotes: string[] = [];

  if (liveBarcode) {
    signals.push({
      source: 'live-barcode',
      confidence: 0.38,
      detail: 'Live camera scan detected a barcode in frame.',
    });
  }

  if (captureBarcode) {
    signals.push({
      source: 'captured-image',
      confidence: captureBarcode === liveBarcode ? 0.28 : 0.16,
      detail:
        captureBarcode === liveBarcode
          ? 'Captured photo confirmed the same barcode in a second pass.'
          : 'Captured photo found a barcode for secondary verification.',
    });
  }

  const entry =
    primaryCode !== 'manual-review'
      ? lookupCatalog(normalizedBarcode) ?? lookupCatalog(primaryCode)
      : undefined;

  if (entry) {
    signals.push({
      source: 'catalog-match',
      confidence: 0.16,
      detail: 'Matched against the in-app product catalog.',
    });
  }

  if (visionExtraction) {
    signals.push({
      source: 'vision-extract',
      confidence: Math.max(0.14, Math.min(0.32, visionExtraction.confidence * 0.32)),
      detail: visionExtraction.quickSummary,
    });
  } else {
    reviewNotes.push('No vision price extraction result was available from the image.');
  }

  if (!entry && !visionExtraction?.productName) {
    reviewNotes.push('The item name still needs a quick review before adding to the cart.');
  }

  if (visionExtraction && visionExtraction.price == null) {
    reviewNotes.push('The image was reviewed, but the price could not be read confidently.');
  }

  const resolvedTitle =
    entry?.name ??
    visionExtraction?.productName ??
    'Unknown product';

  const resolvedPrice =
    visionExtraction?.price ??
    entry?.price ??
    null;

  return {
    barcode: primaryCode,
    normalizedBarcode,
    title: resolvedTitle,
    estimatedPrice: resolvedPrice,
    imageUri,
    confidence: scoreSignals(signals),
    category: resolveCategory(entry?.category, visionExtraction?.category),
    reviewNotes: [
      ...reviewNotes,
      ...(visionExtraction?.notes ?? []),
    ],
    signals,
    extractedPriceText: visionExtraction?.priceText ?? null,
    extractionSummary: visionExtraction?.quickSummary ?? null,
  };
}
