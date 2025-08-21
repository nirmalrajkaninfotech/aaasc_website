/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports
  output: 'export',
  
  // Optional: Add a trailing slash to all paths
  trailingSlash: true,
  
  // Configure images for static export
  images: {
    unoptimized: true, // Required for static export
    domains: ['localhost'], // Add any other domains you need
  },
  
  // TypeScript configuration
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  
  // ESLint configuration
  eslint: {
    // Allow production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  
  // Webpack configuration (if needed)
  webpack: (config, { isServer }) => {
    // Custom webpack configuration if needed
    return config;
  },
  
  // Enable React Strict Mode
  reactStrictMode: true,
};

module.exports = nextConfig;
