'use client';

import React from 'react';
import { AuthProvider } from './AuthProvider';

export default function RootProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {/* Futuramente: adicionar ThemeProvider, QueryClientProvider, etc */}
      {children}
    </AuthProvider>
  );
}
