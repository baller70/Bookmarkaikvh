import type { Environment } from '../../lib/config';

export const developmentConfig = {
  // Environment
  NODE_ENV: 'development' as Environment,
  
  // Application
  APP_NAME: 'BookAIMark (Development)',
  APP_VERSION: '1.0.0-dev',
  APP_URL: 'http://localhost:3000',
  PORT: 3000,
  
  // Logging
  LOG_LEVEL: 'debug' as const,
  
  // Security - Relaxed for development
  CORS_ORIGIN: '*',
  RATE_LIMIT_MAX: 1000,
  RATE_LIMIT_WINDOW: 60000, // 1 minute
  
  // Feature Flags - All enabled for development
  FEATURE_AI_ENABLED: true,
  FEATURE_ANALYTICS_ENABLED: true,
  FEATURE_MARKETPLACE_ENABLED: true,
  FEATURE_ORACLE_ENABLED: true,
  
  // Storage
  STORAGE_TYPE: 'local' as const,
  
  // Performance - Generous limits for development
  MAX_REQUEST_SIZE: 50 * 1024 * 1024, // 50MB
  REQUEST_TIMEOUT: 60000, // 60 seconds
  
  // Development specific
  DEBUG: true,
  MOCK_EXTERNAL_APIS: true,
  
  // AI Services - Use mock or test keys
  OPENAI_MODEL: 'gpt-3.5-turbo', // Cheaper model for development
  
  // Database - Default to local file storage
  // DATABASE_URL will be loaded from .env.local
  
  // Email - Use development email service
  // SMTP settings for local development (like MailHog)
  SMTP_HOST: 'localhost',
  SMTP_PORT: 1025,
  SMTP_USER: '',
  SMTP_PASS: '',
  
  // Development overrides
  overrides: {
    // Disable certain features that might interfere with development
    enableRealTimeSync: false,
    enablePushNotifications: false,
    enableCDN: false,
    
    // Development-specific behavior
    logAllRequests: true,
    showDebugInfo: true,
    enableHotReload: true,
    skipEmailVerification: true,
    
    // Mock external services
    mockPaymentProvider: true,
    mockAIProvider: false, // Set to true if you want to mock AI calls
    mockAnalyticsProvider: true,
    
    // Development database settings
    enableDatabaseLogging: true,
    resetDatabaseOnStart: false,
    
    // Security - Relaxed for development
    skipCSRFProtection: true,
    allowInsecureConnections: true,
    
    // Performance - Disable optimizations that slow development
    enableCaching: false,
    enableCompression: false,
    enableMinification: false,
  },
  
  // Development tools
  devTools: {
    enableReactDevTools: true,
    enableReduxDevTools: true,
    enableSentryDevMode: true,
    enableVerboseLogging: true,
    enablePerformanceMetrics: true,
    enableMemoryLeakDetection: true,
  },
  
  // Development URLs
  urls: {
    api: 'http://localhost:3000/api',
    frontend: 'http://localhost:3000',
    docs: 'http://localhost:3000/docs',
    storybook: 'http://localhost:6006',
  },
  
  // Development database
  database: {
    // Use local file storage by default
    type: 'file',
    
    // If using PostgreSQL for development
    postgres: {
      host: 'localhost',
      port: 5432,
      database: 'bookaimark_dev',
      username: 'postgres',
      password: 'postgres',
    },
    
    // Supabase local development
    supabase: {
      // These would be loaded from .env.local
      url: process.env.SUPABASE_URL,
      anonKey: process.env.SUPABASE_ANON_KEY,
      serviceKey: process.env.SUPABASE_SERVICE_KEY,
    },
  },
  
  // Development Redis (optional)
  redis: {
    host: 'localhost',
    port: 6379,
    database: 0,
    password: null,
  },
  
  // Development monitoring
  monitoring: {
    // Sentry in development mode
    sentry: {
      enabled: true,
      debug: true,
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
      replaysSessionSampleRate: 1.0,
    },
    
    // Analytics in development
    analytics: {
      enabled: false, // Usually disabled in development
      debug: true,
    },
  },
  
  // Development security
  security: {
    // Relaxed security for development
    requireHTTPS: false,
    enableCSP: false,
    enableHSTS: false,
    
    // CORS settings
    cors: {
      origin: '*',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    },
    
    // Rate limiting
    rateLimit: {
      enabled: false, // Usually disabled in development
      windowMs: 60 * 1000, // 1 minute
      max: 1000, // Very high limit
    },
  },
  
  // Development email
  email: {
    // Use console transport for development
    transport: 'console',
    
    // Or use MailHog for local email testing
    mailhog: {
      host: 'localhost',
      port: 1025,
    },
    
    // Email templates
    templates: {
      // Use local file templates
      path: './email-templates',
      cache: false, // Disable caching for development
    },
  },
  
  // Development file uploads
  uploads: {
    // Use local file system
    storage: 'local',
    path: './uploads',
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['image/*', 'application/pdf', 'text/*'],
  },
  
  // Development API settings
  api: {
    // Enable detailed error responses
    includeStackTrace: true,
    enableCORS: true,
    enablePreflight: true,
    
    // Request/response logging
    logRequests: true,
    logResponses: true,
    logHeaders: true,
    logBody: true,
    
    // Timeouts
    timeout: 30000, // 30 seconds
    
    // Rate limiting
    rateLimit: {
      enabled: false,
    },
  },
  
  // Development build settings
  build: {
    // Source maps for debugging
    generateSourceMaps: true,
    
    // Disable optimizations for faster builds
    minify: false,
    compress: false,
    
    // Enable hot module replacement
    hmr: true,
    
    // Watch mode settings
    watch: true,
    watchOptions: {
      ignored: ['node_modules', '.git'],
      poll: 1000,
    },
  },
};

export default developmentConfig; 