import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Basic configuration
  output: 'export',
  distDir: 'out',
  trailingSlash: true,
  reactStrictMode: true,
  
  // File extensions to include
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  // Build optimizations
  generateBuildId: async () => 'build-' + Date.now(),
  
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
    domains: [
      'localhost',
      'localhost:3001',
      'aaasc.edu.in',
      'www.aaasc.edu.in',
      'aasc.veetusaapadu.in',
      'images.unsplash.com',
      'via.placeholder.com'
    ]
  },
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { 
        fs: false, 
        path: false,
        ...config.resolve.fallback
      };
    }
    return config;
  },
  
  // Minimal experimental features for static export
  experimental: {
    // No experimental features needed for static export
  },
  
  // Disable API routes for static export
  api: {
    bodyParser: false,
    responseLimit: false,
    externalResolver: true,
  },
  
  // Disable features not compatible with static export
  redirects: async () => [],
  rewrites: async () => [],
  headers: async () => [],
  
  // Disable middleware and i18n for static export
  middleware: undefined,
  i18n: undefined,
  
  // Disable revalidation and timeouts for static export
  onDemandEntries: undefined,
  staticPageGenerationTimeout: 0,
  
  // Disable compression (handled by hosting)
  compress: false,
  
  // Security headers
  poweredByHeader: false,
  xPoweredBy: false,
};

export default nextConfig;
