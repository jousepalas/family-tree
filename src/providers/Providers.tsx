// src/providers/Providers.tsx
'use client'; // This component uses client-side hooks (useSession, ApolloProvider, useTheme)

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { ApolloProvider } from '@apollo/client';
import { ThemeProvider as NextThemesProvider } from 'next-themes'; // Renamed to avoid conflict
import client from '@/graphql/client';
import { Toaster } from 'react-hot-toast';

interface ProvidersProps {
  children: React.ReactNode;
  // Session prop is generally not needed with SessionProvider in client components
  // session?: Session | null;
}

export function Providers({ children }: ProvidersProps) {
  return (
    // ThemeProvider for dark/light mode switching
    <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange // Optional: disable theme transition animations
    >
      {/* SessionProvider for NextAuth session management */}
      <SessionProvider>
        {/* ApolloProvider for GraphQL client context */}
        <ApolloProvider client={client}>
          {children}
          {/* Toaster for displaying notifications */}
          <Toaster
            position="bottom-right"
            reverseOrder={false}
            toastOptions={{
                duration: 5000,
                 style: {
                    background: 'hsl(var(--background))', // Use theme background
                    color: 'hsl(var(--foreground))', // Use theme foreground
                    border: '1px solid hsl(var(--border))', // Use theme border
                 },
                 success: {
                    // iconTheme: { primary: 'hsl(var(--primary))', secondary: 'hsl(var(--primary-foreground))' },
                 },
                 error: {
                    // iconTheme: { primary: 'hsl(var(--destructive))', secondary: 'hsl(var(--destructive-foreground))' },
                 }
            }}
          />
        </ApolloProvider>
      </SessionProvider>
    </NextThemesProvider>
  );
}