/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: process.env.NODE_ENV === 'production', // Enable in production
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  
  // SECURITY: Only expose public environment variables to client
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    // SECURITY: Never expose service role keys, API keys, or auth bypass flags to client
    // These are server-side only and should be accessed via process.env directly
  },

  // Server-side runtime configuration (not exposed to client)
  serverRuntimeConfig: {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    BYPASS_AUTHENTICATION: process.env.BYPASS_AUTHENTICATION,
    ENABLE_FILE_STORAGE_FALLBACK: process.env.ENABLE_FILE_STORAGE_FALLBACK,
    REDIS_DISABLE: process.env.REDIS_DISABLE
  },
  
  // Remove standalone output for Vercel
  // output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Development performance optimizations
  experimental: {
    serverMinification: process.env.NODE_ENV === 'production',
    optimizeCss: process.env.NODE_ENV === 'production',
  },
  
  // Disable problematic features in development
  compress: false,
  poweredByHeader: false,
  
  // Webpack optimizations and warning suppression
  webpack: (config, { dev, isServer }) => {
    // Suppress OpenTelemetry and Sentry warnings
    config.ignoreWarnings = [
      { module: /node_modules\/require-in-the-middle/ },
      { module: /node_modules\/@opentelemetry/ },
      { module: /node_modules\/@sentry/ },
      /Critical dependency: require function is used in a way in which dependencies cannot be statically extracted/,
      /Critical dependency: the request of a dependency is an expression/,
    ];

    // Handle missing modules gracefully
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };

    if (dev) {
      // Faster builds in development
      // config.optimization.splitChunks = false;
      // config.optimization.providedExports = false;
      // config.optimization.usedExports = false;
      
      // Faster file watching
      config.watchOptions = {
        poll: false,
        aggregateTimeout: 300,
      };
    } else {
      // Production optimizations
      config.optimization.minimize = true;
    }
    
    return config;
  },
  
  // Image optimization
  images: {
    formats: ['image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig;
