import React, { createContext, useContext, useState } from 'react';

interface RefreshContextType {
  refreshHistory: number;
  triggerHistoryRefresh: () => void;
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

export const useRefresh = () => {
  const context = useContext(RefreshContext);
  if (context === undefined) {
    throw new Error('useRefresh must be used within a RefreshProvider');
  }
  return context;
};

export const RefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refreshHistory, setRefreshHistory] = useState(0);

  const triggerHistoryRefresh = () => {
    setRefreshHistory(prev => prev + 1);
  };

  return (
    <RefreshContext.Provider value={{ refreshHistory, triggerHistoryRefresh }}>
      {children}
    </RefreshContext.Provider>
  );
};

