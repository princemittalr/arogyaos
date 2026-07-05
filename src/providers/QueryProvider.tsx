'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // QueryClient initialized inside a useState hook to avoid sharing client instances between users on SSR
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes cache lifetime
            gcTime: 10 * 60 * 1000,    // 10 minutes garbage collection
            retry: (failureCount, error: unknown) => {
              // Only retry network errors, not authorization errors or bad requests
              const err = error as { code?: string; status?: number };
              if (err?.code === 'permission-denied' || err?.status === 401 || err?.status === 403) {
                return false;
              }
              return failureCount < 3;
            },
            refetchOnWindowFocus: false, // Prevent distracting refetches on page focus
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
export default QueryProvider;
