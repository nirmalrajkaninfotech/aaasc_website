/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // output: 'standalone', // optional for Docker/PM2
  // Use default distDir ('.next') for server runtime
  trailingSlash: false, // avoid extra redirects
  compress: true,
  productionBrowserSourceMaps: false,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        // Cache Next.js static assets aggressively
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Cache images and other static files in /public
        source: '/:all*(png|jpg|jpeg|gif|svg|webp|ico|css|js|woff|woff2|ttf|otf)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
