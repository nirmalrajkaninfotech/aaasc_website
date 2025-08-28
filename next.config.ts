import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Basic configuration for static export
  output: 'export',
  distDir: 'out',
  trailingSlash: true,
  reactStrictMode: true,
  
  // TypeScript and ESLint configuration
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Image optimization - disable for static export
  images: {
    unoptimized: true,
  },
  
  // Security headers
  poweredByHeader: false,
  
  // Environment variables for build time
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
};

export default nextConfig;
