import type { NextConfig } from 'next';

// ─── Content Security Policy ──────────────────────────────────────────────────
// Restricts the origins from which resources can be loaded.
// 'unsafe-inline' for style-src is required for Next.js CSS-in-JS at runtime.
// Update connect-src if you add additional third-party APIs.
const ContentSecurityPolicy = [
  "default-src 'self'",
  // Scripts: only self and Next.js inline scripts (required for hydration)
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com",
  // Styles: self + inline required by Next.js/React
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Fonts
  "font-src 'self' https://fonts.gstatic.com",
  // Images: self, data URIs, Google OAuth avatars, Firebase Storage
  "img-src 'self' data: blob: https://lh3.googleusercontent.com https://firebasestorage.googleapis.com https://*.tile.openstreetmap.org https://cdnjs.cloudflare.com",
  // Manifest: self (required for PWA Web App Manifest)
  "manifest-src 'self'",
  // Connections: API, Firebase, Gemini
  [
    "connect-src 'self'",
    'https://*.googleapis.com',
    'https://*.firebaseio.com',
    'https://*.firebaseapp.com',
    'https://identitytoolkit.googleapis.com',
    'https://securetoken.googleapis.com',
    'https://generativelanguage.googleapis.com',
  ].join(' '),
  // Frames: block all (clickjacking prevention)
  "frame-src 'none'",
  // Objects: block Flash/other plugins
  "object-src 'none'",
  // Base URI: restrict to self
  "base-uri 'self'",
  // Form actions: restrict to self
  "form-action 'self'",
  // Upgrade insecure requests in production
  'upgrade-insecure-requests',
]
  .join('; ')
  .trim();

const nextConfig: NextConfig = {
  serverExternalPackages: ['firebase-admin'],
  // ─── Performance & Output ──────────────────────────────────────────────────
  compress: true,
  poweredByHeader: false,

  // ─── Image Optimization ───────────────────────────────────────────────────
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google OAuth avatars
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', // Firebase Storage
      },
    ],
  },

  // ─── Security Headers ─────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent framing / clickjacking
          { key: 'X-Frame-Options', value: 'DENY' },
          // Prevent MIME-type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Safe referrer policy
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Restrict browser feature access
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          // Enforce HTTPS for 1 year (production only; harmless in dev)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy,
          },
          // Prevent cross-origin information leakage
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
        ],
      },
      // ─── AI routes: no browser caching of sensitive responses ─────────────
      {
        source: '/api/ai/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
      // ─── Auth routes: no caching ──────────────────────────────────────────
      {
        source: '/api/auth/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
    ];
  },
};

export default nextConfig;
