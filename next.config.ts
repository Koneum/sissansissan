import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
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
};

export default nextConfig;
