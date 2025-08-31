/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Clean image configuration for Vercel
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Allow build to continue with linting/type errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig;
