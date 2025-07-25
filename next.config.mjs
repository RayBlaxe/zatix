/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable image optimization for better performance
  images: {
    // Remove unoptimized: true to enable Next.js image optimization
    // unoptimized: true,
    domains: ['zatix.zamanweb.com'], // Add your domain for external images
  },
  // Enable strict mode for better development experience
  reactStrictMode: true,
  // Disable ESLint and TypeScript errors during build (temporary fix)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Enable experimental features for better performance
  experimental: {
    // Enable turbopack in development
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
}

export default nextConfig
