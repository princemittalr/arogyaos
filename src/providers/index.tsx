'use client';

import React from 'react';
import { ThemeProvider } from './ThemeProvider';
import { QueryProvider } from './QueryProvider';
import { LanguageProvider } from './LanguageProvider';
import { AuthProvider } from './AuthProvider';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <LanguageProvider>
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

export { useAuth } from './AuthProvider';
export { useLanguage } from './LanguageProvider';
export default Providers;
