import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for pure client-side SPA
  output: 'export',
  trailingSlash: false,
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
  
  // Disable Next.js dev activity indicator in development
  devIndicators: {
    buildActivity: false,
  },
  
  // Optimize for SPA
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-icons'],
  },
  
  // Environment variables for build time
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
  
  // Ensure proper asset handling for static export
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : undefined,
};

export default nextConfig;
