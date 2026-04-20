import type { CartItem } from '@/types';

export const DEFAULT_TAX_RATE = 0.0825;

export function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateSubtotal(items: CartItem[]) {
  return roundCurrency(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  );
}

export function calculateTax(subtotal: number, taxRate = DEFAULT_TAX_RATE) {
  return roundCurrency(subtotal * taxRate);
}

export function calculateTotal(items: CartItem[], taxRate = DEFAULT_TAX_RATE) {
  const subtotal = calculateSubtotal(items);
  const tax = calculateTax(subtotal, taxRate);

  return {
    subtotal,
    tax,
    total: roundCurrency(subtotal + tax),
  };
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}
