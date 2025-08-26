import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    // Allow serving images from these domains
    domains: [
      'localhost',
      'localhost:3001',  // Your API server
      'aaasc.edu.in',   // Your production domain
      'www.aaasc.edu.in'
    ],
    // Disable image optimization in development
    unoptimized: process.env.NODE_ENV !== 'production',
    // Allow all image formats
    formats: ['image/avif', 'image/webp'],
    // Cache images for 60 days
    minimumCacheTTL: 60 * 60 * 24 * 60,
  },
  // Serve static files from the public directory
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
