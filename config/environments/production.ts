import type { Environment } from '../../lib/config';

export const productionConfig = {
  // Environment
  NODE_ENV: 'production' as Environment,
  
  // Application
  APP_NAME: 'BookAIMark',
  APP_VERSION: '1.0.0',
  // APP_URL will be loaded from environment variables
  PORT: process.env.PORT || 3000,
  
  // Logging - Reduced verbosity for production
  LOG_LEVEL: 'warn' as const,
  
  // Security - Strict for production
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'https://bookaimark.com',
  RATE_LIMIT_MAX: 100,
  RATE_LIMIT_WINDOW: 900000, // 15 minutes
  
  // Feature Flags - All enabled for production
  FEATURE_AI_ENABLED: true,
  FEATURE_ANALYTICS_ENABLED: true,
  FEATURE_MARKETPLACE_ENABLED: true,
  FEATURE_ORACLE_ENABLED: true,
  
  // Storage - Use cloud storage in production
  STORAGE_TYPE: 'supabase' as const,
  
  // Performance - Optimized for production
  MAX_REQUEST_SIZE: 10 * 1024 * 1024, // 10MB
  REQUEST_TIMEOUT: 30000, // 30 seconds
  
  // Production specific
  DEBUG: false,
  MOCK_EXTERNAL_APIS: false,
  
  // AI Services - Use production models
  OPENAI_MODEL: 'gpt-4',
  
  // Production overrides
  overrides: {
    // Enable production features
    enableRealTimeSync: true,
    enablePushNotifications: true,
    enableCDN: true,
    
    // Production-specific behavior
    logAllRequests: false,
    showDebugInfo: false,
    enableHotReload: false,
    skipEmailVerification: false,
    
    // Use real external services
    mockPaymentProvider: false,
    mockAIProvider: false,
    mockAnalyticsProvider: false,
    
    // Production database settings
    enableDatabaseLogging: false,
    resetDatabaseOnStart: false,
    
    // Security - Strict for production
    skipCSRFProtection: false,
    allowInsecureConnections: false,
    
    // Performance - Enable all optimizations
    enableCaching: true,
    enableCompression: true,
    enableMinification: true,
    
    // Production-specific features
    enableSSL: true,
    enableHSTS: true,
    enableCSP: true,
    enableXSSProtection: true,
    enableClickjacking: true,
  },
  
  // Production tools - Disabled for security
  devTools: {
    enableReactDevTools: false,
    enableReduxDevTools: false,
    enableSentryDevMode: false,
    enableVerboseLogging: false,
    enablePerformanceMetrics: true,
    enableMemoryLeakDetection: false,
  },
  
  // Production URLs - Will be loaded from environment
  urls: {
    api: process.env.API_URL || 'https://api.bookaimark.com',
    frontend: process.env.FRONTEND_URL || 'https://bookaimark.com',
    docs: process.env.DOCS_URL || 'https://docs.bookaimark.com',
    cdn: process.env.CDN_URL || 'https://cdn.bookaimark.com',
  },
  
  // Production database
  database: {
    // Use Supabase or PostgreSQL in production
    type: 'supabase',
    
    // Connection pooling for production
    pool: {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 30000,
      idleTimeoutMillis: 30000,
    },
    
    // SSL required in production
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
    
    // Supabase production
    supabase: {
      url: process.env.SUPABASE_URL,
      anonKey: process.env.SUPABASE_ANON_KEY,
      serviceKey: process.env.SUPABASE_SERVICE_KEY,
    },
  },
  
  // Production Redis
  redis: {
    url: process.env.REDIS_URL,
    // Connection pooling
    pool: {
      min: 2,
      max: 10,
    },
    // SSL for production Redis
    tls: process.env.REDIS_TLS === 'true',
  },
  
  // Production monitoring
  monitoring: {
    // Sentry in production mode
    sentry: {
      enabled: true,
      debug: false,
      tracesSampleRate: 0.1, // 10% sampling
      profilesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    },
    
    // Analytics in production
    analytics: {
      enabled: true,
      debug: false,
      sampleRate: 1.0, // 100% sampling
    },
    
    // Health checks
    healthCheck: {
      enabled: true,
      interval: 30000, // 30 seconds
      timeout: 5000, // 5 seconds
    },
    
    // Metrics
    metrics: {
      enabled: true,
      collectInterval: 60000, // 1 minute
      retention: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  },
  
  // Production security
  security: {
    // Strict security for production
    requireHTTPS: true,
    enableCSP: true,
    enableHSTS: true,
    enableXSSProtection: true,
    enableClickjackingProtection: true,
    
    // CORS settings
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || ['https://bookaimark.com'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 86400, // 24 hours
    },
    
    // Rate limiting
    rateLimit: {
      enabled: true,
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      standardHeaders: true,
      legacyHeaders: false,
    },
    
    // Content Security Policy
    csp: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.bookaimark.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://api.bookaimark.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    
    // Headers
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    },
  },
  
  // Production email
  email: {
    // Use production email service
    transport: 'smtp',
    
    // Production SMTP settings
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
    
    // Or use Resend
    resend: {
      apiKey: process.env.RESEND_API_KEY,
    },
    
    // Email templates
    templates: {
      path: './email-templates',
      cache: true, // Enable caching for production
    },
    
    // Email queue for production
    queue: {
      enabled: true,
      concurrency: 5,
      retryAttempts: 3,
    },
  },
  
  // Production file uploads
  uploads: {
    // Use cloud storage
    storage: 'supabase',
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    
    // Supabase storage
    supabase: {
      bucket: process.env.SUPABASE_STORAGE_BUCKET || 'uploads',
    },
    
    // AWS S3 (alternative)
    s3: {
      bucket: process.env.AWS_S3_BUCKET,
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  },
  
  // Production API settings
  api: {
    // Security-focused error responses
    includeStackTrace: false,
    enableCORS: true,
    enablePreflight: true,
    
    // Request/response logging - Minimal for production
    logRequests: false,
    logResponses: false,
    logHeaders: false,
    logBody: false,
    
    // Timeouts
    timeout: 30000, // 30 seconds
    
    // Rate limiting
    rateLimit: {
      enabled: true,
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,
    },
    
    // Compression
    compression: {
      enabled: true,
      level: 6,
      threshold: 1024,
    },
    
    // Caching
    cache: {
      enabled: true,
      ttl: 300, // 5 minutes
      maxSize: 100, // 100 MB
    },
  },
  
  // Production build settings
  build: {
    // No source maps for production (security)
    generateSourceMaps: false,
    
    // Enable all optimizations
    minify: true,
    compress: true,
    
    // No hot module replacement
    hmr: false,
    
    // No watch mode
    watch: false,
    
    // Bundle optimization
    optimization: {
      splitChunks: true,
      treeshaking: true,
      deadCodeElimination: true,
    },
    
    // Asset optimization
    assets: {
      optimization: true,
      compression: true,
      imageOptimization: true,
    },
  },
  
  // Production caching
  cache: {
    // Redis for session storage
    session: {
      store: 'redis',
      ttl: 24 * 60 * 60, // 24 hours
    },
    
    // API response caching
    api: {
      enabled: true,
      ttl: 300, // 5 minutes
      maxSize: 100 * 1024 * 1024, // 100 MB
    },
    
    // Static asset caching
    static: {
      enabled: true,
      maxAge: 31536000, // 1 year
    },
  },
  
  // Production backup
  backup: {
    enabled: true,
    schedule: '0 2 * * *', // Daily at 2 AM
    retention: 30, // Keep 30 days
    
    // Backup destinations
    destinations: {
      s3: {
        bucket: process.env.BACKUP_S3_BUCKET,
        region: process.env.AWS_REGION,
      },
    },
  },
  
  // Production scaling
  scaling: {
    // Auto-scaling configuration
    autoScale: {
      enabled: true,
      minInstances: 2,
      maxInstances: 10,
      targetCPU: 70,
      targetMemory: 80,
    },
    
    // Load balancing
    loadBalancer: {
      enabled: true,
      healthCheckPath: '/api/health',
      healthCheckInterval: 30,
    },
  },
};

export default productionConfig; 