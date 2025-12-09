/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  output: 'export', // Enable static export for SPA
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
};

module.exports = nextConfig;
