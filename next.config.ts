// @ts-check
/** @type {import('next').NextConfig} */

// ============================================
// HEADERS DE SÉCURITÉ
// ============================================
const securityHeaders = [
  {
    // Protection contre le clickjacking
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    // Empêche le navigateur de deviner le type MIME
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    // Protection XSS (navigateurs modernes)
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    // Contrôle ce qui est envoyé dans le header Referer
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    // Permissions du navigateur
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()'
  },
  {
    // Strict Transport Security (HTTPS obligatoire)
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains'
  },
]

const nextConfig = {
  eslint: {
    // TODO: Réactiver en production
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TODO: Réactiver en production
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
    ],
    // Next.js accepte seulement avif et webp dans formats
    formats: ['image/avif', 'image/webp'],
    // Désactiver l'optimisation pour servir les images depuis la DB
    unoptimized: true,
  },
  
  // ============================================
  // APPLIQUER LES HEADERS DE SÉCURITÉ
  // ============================================
  async headers() {
    return [
      {
        // Appliquer à toutes les routes
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
};

export default nextConfig;
