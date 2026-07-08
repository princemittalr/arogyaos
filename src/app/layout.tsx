import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/providers';
import { Toaster } from '@/components/ui/toast';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0f1e' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'ArogyaOS — AI-Powered Healthcare Operating System',
    template: '%s | ArogyaOS',
  },
  description:
    'ArogyaOS is a unified AI-powered operating system for clinics, hospitals, pharmacies, laboratories, and district health administrators — built with Google Gemini AI.',
  keywords: [
    'healthcare', 'hospital management', 'AI', 'Gemini', 'medicine inventory',
    'patient management', 'district health', 'pharmacy management', 'India',
  ],
  authors: [{ name: 'ArogyaOS Team' }],
  openGraph: {
    type: 'website',
    title: 'ArogyaOS — AI-Powered Healthcare Operating System',
    description: 'Unifying hospitals, pharmacies, and district health commands with Gemini AI.',
    siteName: 'ArogyaOS',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ArogyaOS — AI-Powered Healthcare Operating System',
    description: 'Unifying hospitals, pharmacies, and district health commands with Gemini AI.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* Skip Navigation for Accessibility */}
        <a href="#main-content" className="skip-nav">
          Skip to main content
        </a>
        <Providers>
          <div id="main-content">
            {children}
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
