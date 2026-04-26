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

type AddCartItemInput = Omit<CartItem, 'id' | 'enabled'> & {
  enabled?: boolean;
};

type AppContextType = {
  budgetInput: string;
  setBudgetInput: (value: string) => void;
  budget: number;
  shoppingMode: ShoppingMode;
  setShoppingMode: (mode: ShoppingMode) => void;
  taxRate: number;
  cartItems: CartItem[];
  addCartItem: (item: AddCartItemInput) => void;
  toggleCartItem: (itemId: string) => void;
  subtotal: number;
  tax: number;
  total: number;
  remaining: number;
  progress: number;
  insights: InsightCard[];
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const starterItems: CartItem[] = [
  { id: '1', name: 'Notebook', category: 'household', price: 4.5, quantity: 1, priority: 'core', enabled: true, source: 'seed' },
  { id: '2', name: 'Water bottle', category: 'household', price: 12.0, quantity: 1, priority: 'core', enabled: true, source: 'seed' },
  { id: '3', name: 'Snack pack', category: 'pantry', price: 3.75, quantity: 2, priority: 'nice', enabled: true, source: 'seed' },
  { id: '4', name: 'Phone cable', category: 'household', price: 9.99, quantity: 1, priority: 'core', enabled: true, source: 'seed' },
  { id: '5', name: 'T-shirt', category: 'household', price: 14.0, quantity: 1, priority: 'nice', enabled: true, source: 'seed' },
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
          enabled: item.enabled ?? true,
          id: `${Date.now()}-${currentItems.length + 1}`,
        },
      ];
    });
  }, []);

  const toggleCartItem = useCallback((itemId: string) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId
          ? { ...item, enabled: !item.enabled }
          : item,
      ),
    );
  }, []);

  const budget = toBudget(budgetInput);
  const subtotal = calculateSubtotal(cartItems);
  const tax = calculateTax(subtotal, DEFAULT_TAX_RATE);
  const { total } = calculateTotal(cartItems, DEFAULT_TAX_RATE);
  const remaining = roundCurrency(budget - total);
  const progress = budget > 0 ? Math.min(total / budget, 1) : 0;

  const scannedCount = cartItems.filter((item) => item.source === 'scanner').length;
  const disabledCount = cartItems.filter((item) => !item.enabled).length;

  const insights = useMemo<InsightCard[]>(
    () => [
      {
        id: 'remaining',
        label: 'Left to spend',
        value: formatCurrency(remaining),
        detail:
          remaining < 0
            ? 'You are over budget right now.'
            : remaining > 15
              ? 'You still have room for more items.'
              : 'You are close to your limit.',
      },
      {
        id: 'scanned-items',
        label: 'Items scanned',
        value: `${scannedCount}`,
        detail: scannedCount > 0 ? 'Scanned items are already in your cart.' : 'Use the scanner to add items quickly.',
      },
      {
        id: 'tax',
        label: 'Total with tax',
        value: formatCurrency(total),
        detail: `${formatCurrency(tax)} estimated tax.`,
      },
      {
        id: 'parked-items',
        label: 'Items off',
        value: `${disabledCount}`,
        detail: disabledCount > 0 ? 'These items are excluded from the total.' : 'All items are counting toward the total.',
      },
    ],
    [disabledCount, remaining, scannedCount, tax, total],
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
      toggleCartItem,
      subtotal,
      tax,
      total,
      remaining,
      progress,
      insights,
    }),
    [addCartItem, budget, budgetInput, cartItems, insights, progress, remaining, shoppingMode, subtotal, tax, toggleCartItem, total],
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
