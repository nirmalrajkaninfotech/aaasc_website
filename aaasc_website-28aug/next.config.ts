import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Client-side rendering (CSR) configuration
  output: 'export', // Enable static export for CSR
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
  
  // Disable Next.js dev activity indicator (logo) in development
  devIndicators: {
    buildActivity: false,
  },
  
  // Environment variables for build time
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
  
  // Optimize for client-side rendering
  // This ensures minimal HTML and maximum client-side rendering
  experimental: {
    optimizePackageImports: ['@/components', '@/lib'],
  },
};

export default nextConfig;
