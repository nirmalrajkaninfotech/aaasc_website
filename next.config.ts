import type { NextConfig } from "next";

// Get the environment variables
const publicRuntimeConfig = {
  NEXT_PUBLIC_SITE_URL: process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
};

const nextConfig: NextConfig = {
  output: 'standalone',
  publicRuntimeConfig,
  // Disable ESLint during builds to allow linting errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript type checking during builds
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable image optimization for cPanel hosting
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    // Allow serving images from the public directory
    domains: ['localhost'],
  },
};

export default nextConfig;
