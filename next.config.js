/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // output: 'export',
  distDir: 'out',
  trailingSlash: true, // Important for static hosting
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ensure proper static generation
  experimental: {
    // Enable static generation for dynamic routes
    staticGenerationAsyncStorage: true,
  },
};

module.exports = nextConfig;
