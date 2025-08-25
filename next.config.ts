import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export
  output: 'export',
  
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
  
  // Configure trailing slash for better static hosting compatibility
  trailingSlash: true,
  
  // Skip build-time API route validation since we're going static
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
