// src/app/layout.tsx
import type { Metadata, Viewport } from 'next'; // Import Viewport type
import { Inter } from 'next/font/google';
import { Providers } from '@/providers/Providers';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { cn } from '@/lib/utils';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'], variable: "--font-sans" }); // Define font variable

export const metadata: Metadata = {
  title: {
      default: "FamilyTree App",
      template: "%s | FamilyTree App", // Template for page titles
  },
  description: 'Connect, explore, and preserve your family heritage.',
  icons: { // Add favicon links
      icon: "/favicon.ico",
      shortcut: "/favicon-16x16.png",
      apple: "/apple-touch-icon.png",
  },
  // themeColor has been removed from here
};

// Add the viewport export for themeColor and other viewport settings
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' }, // White for light mode
    { media: '(prefers-color-scheme: dark)', color: '#121212' }, // Dark grey for dark mode
  ],
  // You can add other viewport settings here if needed, e.g.:
  // width: 'device-width',
  // initialScale: 1,
  // maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable // Apply font variable class
        )}
      >
        <Providers>
          <div className="relative flex min-h-screen flex-col">
             <Header />
             <main className="flex-1 container py-6 md:py-10"> {/* Add container and padding */}
                {children}
             </main>
             <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}