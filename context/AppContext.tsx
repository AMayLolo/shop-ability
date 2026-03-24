import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AppContextType {
  moneyAmount: string;
  setMoneyAmount: (amount: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [moneyAmount, setMoneyAmount] = useState('');

  return (
    <AppContext.Provider value={{ moneyAmount, setMoneyAmount }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}