import React, { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import type { CartItem, InsightCard, ShoppingMode } from '@/types';
import {
  DEFAULT_TAX_RATE,
  calculateSubtotal,
  calculateTax,
  calculateTotal,
  formatCurrency,
  roundCurrency,
} from '@/utils/tax';

type AddCartItemInput = Omit<CartItem, 'id'>;

type AppContextType = {
  budgetInput: string;
  setBudgetInput: (value: string) => void;
  budget: number;
  shoppingMode: ShoppingMode;
  setShoppingMode: (mode: ShoppingMode) => void;
  taxRate: number;
  cartItems: CartItem[];
  addCartItem: (item: AddCartItemInput) => void;
  subtotal: number;
  tax: number;
  total: number;
  remaining: number;
  progress: number;
  insights: InsightCard[];
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const starterItems: CartItem[] = [
  { id: '1', name: 'Organic berries', category: 'produce', price: 6.5, quantity: 1, priority: 'nice', source: 'seed' },
  { id: '2', name: 'Chicken cutlets', category: 'protein', price: 12.0, quantity: 1, priority: 'core', source: 'seed' },
  { id: '3', name: 'Greek yogurt', category: 'protein', price: 5.25, quantity: 2, priority: 'core', source: 'seed' },
  { id: '4', name: 'Sparkling water', category: 'pantry', price: 7.4, quantity: 1, priority: 'nice', source: 'seed' },
  { id: '5', name: 'Dish soap', category: 'household', price: 4.8, quantity: 1, priority: 'core', source: 'seed' },
];

function toBudget(value: string) {
  const numericValue = Number.parseFloat(value.replace(/[^0-9.]/g, ''));
  return Number.isFinite(numericValue) ? numericValue : 0;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [budgetInput, setBudgetInput] = useState('120');
  const [shoppingMode, setShoppingMode] = useState<ShoppingMode>('Weekly Reset');
  const [cartItems, setCartItems] = useState<CartItem[]>(starterItems);

  const addCartItem = useCallback((item: AddCartItemInput) => {
    setCartItems((currentItems) => {
      const matchingIndex = currentItems.findIndex(
        (currentItem) =>
          currentItem.name.trim().toLowerCase() === item.name.trim().toLowerCase() &&
          currentItem.price === item.price,
      );

      if (matchingIndex >= 0) {
        return currentItems.map((currentItem, index) =>
          index === matchingIndex
            ? { ...currentItem, quantity: currentItem.quantity + item.quantity }
            : currentItem,
        );
      }

      return [
        ...currentItems,
        {
          ...item,
          id: `${Date.now()}-${currentItems.length + 1}`,
        },
      ];
    });
  }, []);

  const budget = toBudget(budgetInput);
  const subtotal = calculateSubtotal(cartItems);
  const tax = calculateTax(subtotal, DEFAULT_TAX_RATE);
  const { total } = calculateTotal(cartItems, DEFAULT_TAX_RATE);
  const remaining = roundCurrency(Math.max(budget - total, 0));
  const progress = budget > 0 ? Math.min(total / budget, 1) : 0;

  const scannedCount = cartItems.filter((item) => item.source === 'scanner').length;

  const insights = useMemo<InsightCard[]>(
    () => [
      {
        id: 'remaining',
        label: 'Remaining',
        value: formatCurrency(remaining),
        detail: remaining > 15 ? 'You still have room for one premium add-on.' : 'Keep the rest of the cart tight.',
      },
      {
        id: 'scanned-items',
        label: 'Scanned items',
        value: `${scannedCount}`,
        detail: scannedCount > 0 ? 'Quick scans are already feeding the live cart.' : 'Use the scanner to add items with less manual entry.',
      },
      {
        id: 'tax',
        label: 'With tax',
        value: formatCurrency(total),
        detail: `Includes ${formatCurrency(tax)} in estimated tax at ${(DEFAULT_TAX_RATE * 100).toFixed(2)}%.`,
      },
    ],
    [remaining, scannedCount, tax, total],
  );

  const value = useMemo(
    () => ({
      budgetInput,
      setBudgetInput,
      budget,
      shoppingMode,
      setShoppingMode,
      taxRate: DEFAULT_TAX_RATE,
      cartItems,
      addCartItem,
      subtotal,
      tax,
      total,
      remaining,
      progress,
      insights,
    }),
    [addCartItem, budget, budgetInput, cartItems, insights, progress, remaining, shoppingMode, subtotal, tax, total],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }

  return context;
}
