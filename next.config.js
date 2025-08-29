const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  
  // Set the source directory to frontend
  experimental: {
    serverMinification: true,
  },
  
  // Configure paths to point to frontend directory
  distDir: '.next',
  
  // Basic optimizations only
  compress: true,
  poweredByHeader: false,
  
  // Webpack configuration to suppress OpenTelemetry warnings
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Suppress OpenTelemetry warnings in development
    if (dev) {
      config.ignoreWarnings = [
        { module: /require-in-the-middle/ },
        { module: /@opentelemetry\/instrumentation/ },
        /Critical dependency: require function is used in a way in which dependencies cannot be statically extracted/,
        /Critical dependency: the request of a dependency is an expression/,
      ];
    }
    
    // Optimize bundle for monitoring dependencies
    config.resolve.alias = {
      ...config.resolve.alias,
      '@sentry/nextjs': require.resolve('@sentry/nextjs'),
    };
    
    return config;
  },
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Internationalization configuration
  i18n: {
    locales: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi'],
    defaultLocale: 'en',
    localeDetection: false,
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = withSentryConfig(
  nextConfig,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,
    org: "thunder-0g",
    project: "javascript-nextjs",
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    // Changed from "/monitoring" to "/sentry-tunnel" to avoid conflict with monitoring dashboard
    tunnelRoute: "/sentry-tunnel",

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors.
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/cron-monitoring/
    automaticVercelMonitors: true,
  }
); 