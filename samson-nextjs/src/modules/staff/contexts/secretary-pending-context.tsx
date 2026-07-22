'use client';

import React, { createContext, useContext } from 'react';
import { useSecretaryPendingRequests } from '../hooks/secretary/use-secretary-pending-requests';

type PendingContextType = ReturnType<typeof useSecretaryPendingRequests>;

const SecretaryPendingContext = createContext<PendingContextType | null>(null);

export function SecretaryPendingProvider({ children }: { children: React.ReactNode }) {
  const value = useSecretaryPendingRequests();
  return (
    <SecretaryPendingContext.Provider value={value}>
      {children}
    </SecretaryPendingContext.Provider>
  );
}

export function useSecretaryPending() {
  const context = useContext(SecretaryPendingContext);
  if (!context) {
    throw new Error('useSecretaryPending must be used within a SecretaryPendingProvider');
  }
  return context;
}
