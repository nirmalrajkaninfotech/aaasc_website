import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
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
    // Disable image optimization in development
    unoptimized: process.env.NODE_ENV !== 'production',
  },
};

export default nextConfig;
