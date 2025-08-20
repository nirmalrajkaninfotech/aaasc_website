import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for cPanel hosting (no Node.js needed)
  output: 'export',
  trailingSlash: true,
  // Disable ESLint during builds to allow linting errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript type checking during builds
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable image optimization for static export
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
