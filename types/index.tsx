export type CartCategory = 'produce' | 'protein' | 'pantry' | 'household';
export type CartPriority = 'core' | 'nice';

export type CartItem = {
  id: string;
  name: string;
  category: CartCategory;
  price: number;
  quantity: number;
  priority: CartPriority;
  enabled: boolean;
  barcode?: string;
  source?: 'seed' | 'scanner' | 'manual';
};

export type ShoppingMode = 'Essentials' | 'Weekly Reset' | 'Hosting Night';

export type InsightCard = {
  id: string;
  label: string;
  value: string;
  detail: string;
};

export type PriceScanSignal = {
  source: 'live-barcode' | 'captured-image' | 'catalog-match' | 'vision-extract' | 'manual-review';
  confidence: number;
  detail: string;
};

export type VisionPriceExtraction = {
  productName: string | null;
  price: number | null;
  category: CartCategory | null;
  priceText: string | null;
  confidence: number;
  quickSummary: string;
  notes: string[];
};

export type PriceScanCandidate = {
  barcode: string;
  normalizedBarcode: string;
  title: string;
  estimatedPrice: number | null;
  imageUri?: string;
  confidence: number;
  category?: CartCategory;
  reviewNotes: string[];
  signals: PriceScanSignal[];
  extractedPriceText?: string | null;
  extractionSummary?: string | null;
};
