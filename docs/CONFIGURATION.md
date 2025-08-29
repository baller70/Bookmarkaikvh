# Configuration Management Guide

This guide explains how to configure the BookAIMark application for different environments using our comprehensive configuration system.

## 🏗️ **Configuration Architecture**

BookAIMark uses a sophisticated configuration management system with:

- **Environment-specific configurations** (development, staging, production, test)
- **Schema validation** with Zod for type safety
- **Feature flags** for controlled rollouts
- **Centralized configuration management** with the ConfigManager class
- **Environment variable validation** and defaults

## 📁 **Configuration Files Structure**

```
lib/config/
├── index.ts                    # Main configuration manager
config/environments/
├── development.ts              # Development environment config
├── staging.ts                  # Staging environment config
├── production.ts               # Production environment config
└── test.ts                     # Test environment config
```

## 🚀 **Quick Start**

### 1. **Basic Usage**

```typescript
import { config, getConfig, isProduction } from '@/lib/config';

// Get configuration values
const databaseUrl = config.get('DATABASE_URL');
const aiConfig = config.getAIConfig();

// Check environment
if (isProduction()) {
  // Production-specific logic
}

// Check feature flags
if (config.isFeatureEnabled('ai')) {
  // AI features enabled
}
```

### 2. **Environment Setup**

Create environment-specific `.env` files:

```bash
# .env.local (development)
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/bookaimark_dev
OPENAI_API_KEY=your_openai_key
SENTRY_DSN=your_sentry_dsn

# .env.staging (staging)
NODE_ENV=staging
DATABASE_URL=your_staging_database_url
NEXTAUTH_SECRET=your_staging_secret

# .env.production (production)
NODE_ENV=production
DATABASE_URL=your_production_database_url
NEXTAUTH_SECRET=your_production_secret
NEXTAUTH_URL=https://bookaimark.com
```

## 🔧 **Configuration Schema**

### **Core Application Settings**

```typescript
// Environment
NODE_ENV: 'development' | 'staging' | 'production' | 'test'

// Application
APP_NAME: string                    // Application name
APP_VERSION: string                 // Version number
APP_URL: string                     // Application URL
PORT: number                        // Server port
```

### **Database Configuration**

```typescript
// Primary database
DATABASE_URL: string                // PostgreSQL connection string

// Supabase
SUPABASE_URL: string               // Supabase project URL
SUPABASE_ANON_KEY: string          // Supabase anonymous key
SUPABASE_SERVICE_KEY: string       // Supabase service key

// Redis (optional)
REDIS_URL: string                  // Redis connection string
REDIS_HOST: string                 // Redis host
REDIS_PORT: number                 // Redis port
REDIS_PASSWORD: string             // Redis password
```

### **AI Services Configuration**

```typescript
// OpenAI
OPENAI_API_KEY: string             // OpenAI API key
OPENAI_MODEL: string               // Model to use (default: gpt-4)

// Anthropic
ANTHROPIC_API_KEY: string          // Anthropic API key
```

### **Authentication Configuration**

```typescript
// NextAuth
NEXTAUTH_SECRET: string            // NextAuth secret
NEXTAUTH_URL: string               // NextAuth URL

// JWT
JWT_SECRET: string                 // JWT signing secret
```

### **Email Configuration**

```typescript
// Resend
RESEND_API_KEY: string             // Resend API key

// SMTP
SMTP_HOST: string                  // SMTP server host
SMTP_PORT: number                  // SMTP server port
SMTP_USER: string                  // SMTP username
SMTP_PASS: string                  // SMTP password
```

### **Payment Configuration**

```typescript
// Stripe
STRIPE_PUBLIC_KEY: string          // Stripe publishable key
STRIPE_SECRET_KEY: string          // Stripe secret key
STRIPE_WEBHOOK_SECRET: string      // Stripe webhook secret
```

### **Monitoring Configuration**

```typescript
// Sentry
SENTRY_DSN: string                 // Sentry DSN
SENTRY_ORG: string                 // Sentry organization
SENTRY_PROJECT: string             // Sentry project
SENTRY_AUTH_TOKEN: string          // Sentry auth token

// Logging
LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error' | 'fatal'
LOG_WEBHOOK_URL: string            // External logging webhook
```

### **Security Configuration**

```typescript
// CORS
CORS_ORIGIN: string                // Allowed origins

// Rate Limiting
RATE_LIMIT_MAX: number             // Max requests per window
RATE_LIMIT_WINDOW: number          // Time window in ms
```

### **Feature Flags**

```typescript
// Feature toggles
FEATURE_AI_ENABLED: boolean        // Enable AI features
FEATURE_ANALYTICS_ENABLED: boolean // Enable analytics
FEATURE_MARKETPLACE_ENABLED: boolean // Enable marketplace
FEATURE_ORACLE_ENABLED: boolean    // Enable Oracle features
```

### **File Storage Configuration**

```typescript
// Storage type
STORAGE_TYPE: 'local' | 'supabase' | 's3'

// AWS S3
AWS_ACCESS_KEY_ID: string          // AWS access key
AWS_SECRET_ACCESS_KEY: string      // AWS secret key
AWS_REGION: string                 // AWS region
AWS_S3_BUCKET: string              // S3 bucket name
```

### **Performance Configuration**

```typescript
// Request limits
MAX_REQUEST_SIZE: number           // Max request size in bytes
REQUEST_TIMEOUT: number            // Request timeout in ms
```

### **Development Configuration**

```typescript
// Development flags
DEBUG: boolean                     // Enable debug mode
MOCK_EXTERNAL_APIS: boolean        // Mock external API calls
```

## 🌍 **Environment-Specific Configurations**

### **Development Environment**

```typescript
// Relaxed security and verbose logging
{
  LOG_LEVEL: 'debug',
  DEBUG: true,
  MOCK_EXTERNAL_APIS: true,
  CORS_ORIGIN: '*',
  RATE_LIMIT_MAX: 1000,
  // All features enabled for testing
  FEATURE_AI_ENABLED: true,
  FEATURE_ANALYTICS_ENABLED: true,
  FEATURE_MARKETPLACE_ENABLED: true,
  FEATURE_ORACLE_ENABLED: true,
}
```

### **Staging Environment**

```typescript
// Production-like with some debugging
{
  LOG_LEVEL: 'info',
  DEBUG: false,
  MOCK_EXTERNAL_APIS: false,
  // Moderate security
  RATE_LIMIT_MAX: 200,
  // All features enabled for testing
}
```

### **Production Environment**

```typescript
// Strict security and minimal logging
{
  LOG_LEVEL: 'warn',
  DEBUG: false,
  MOCK_EXTERNAL_APIS: false,
  // Strict security
  RATE_LIMIT_MAX: 100,
  RATE_LIMIT_WINDOW: 900000, // 15 minutes
  // All features enabled
}
```

### **Test Environment**

```typescript
// Minimal configuration for testing
{
  LOG_LEVEL: 'error',
  DEBUG: false,
  MOCK_EXTERNAL_APIS: true,
  // Most features disabled for testing
  FEATURE_AI_ENABLED: false,
  FEATURE_ANALYTICS_ENABLED: false,
}
```

## 🔍 **Configuration Usage Examples**

### **Basic Configuration Access**

```typescript
import { config } from '@/lib/config';

// Get individual values
const port = config.get('PORT');
const dbUrl = config.get('DATABASE_URL');
const isDebug = config.get('DEBUG');

// Get grouped configurations
const dbConfig = config.getDatabaseConfig();
const aiConfig = config.getAIConfig();
const authConfig = config.getAuthConfig();
```

### **Environment Checks**

```typescript
import { isDevelopment, isProduction, isTest } from '@/lib/config';

if (isDevelopment()) {
  // Development-only code
  console.log('Running in development mode');
}

if (isProduction()) {
  // Production-only code
  enableProductionOptimizations();
}

if (isTest()) {
  // Test-only code
  setupTestMocks();
}
```

### **Feature Flags**

```typescript
import { isFeatureEnabled, isAIEnabled } from '@/lib/config';

// Check specific features
if (isFeatureEnabled('marketplace')) {
  // Marketplace feature is enabled
  renderMarketplaceComponents();
}

if (isAIEnabled()) {
  // AI features are enabled
  initializeAIServices();
}
```

### **Configuration in API Routes**

```typescript
import { config } from '@/lib/config';

export async function GET(request: Request) {
  const aiConfig = config.getAIConfig();
  
  if (!aiConfig.enabled) {
    return NextResponse.json(
      { error: 'AI features are disabled' },
      { status: 503 }
    );
  }
  
  // Use AI configuration
  const openai = new OpenAI({
    apiKey: aiConfig.openai.apiKey,
    model: aiConfig.openai.model,
  });
  
  // ... rest of the handler
}
```

### **Configuration in Components**

```typescript
import { config } from '@/lib/config';

export function AIFeatureComponent() {
  const aiEnabled = config.isFeatureEnabled('ai');
  
  if (!aiEnabled) {
    return <div>AI features are not available</div>;
  }
  
  return (
    <div>
      {/* AI feature components */}
    </div>
  );
}
```

## 🛠️ **Advanced Configuration**

### **Custom Configuration Manager**

```typescript
import { ConfigManager } from '@/lib/config';

// Create custom configuration instance
const customConfig = new ConfigManager();

// Get configuration summary
const summary = customConfig.getConfigSummary();
console.log('Configuration:', summary);
```

### **Configuration Validation**

```typescript
import { config } from '@/lib/config';

// The configuration is automatically validated on startup
// If validation fails, an error is thrown with details

try {
  const configInstance = getConfig();
} catch (error) {
  console.error('Configuration validation failed:', error.message);
  process.exit(1);
}
```

### **Runtime Configuration Updates**

```typescript
import { resetConfig, getConfig } from '@/lib/config';

// Reset configuration (useful for testing)
resetConfig();

// Get fresh configuration instance
const newConfig = getConfig();
```

## 📋 **Required Environment Variables**

### **Development**
- No required variables (all optional with defaults)

### **Staging**
- `DATABASE_URL` - Database connection string
- `NEXTAUTH_SECRET` - Authentication secret
- `SENTRY_DSN` - Error tracking

### **Production**
- `DATABASE_URL` - Database connection string
- `NEXTAUTH_SECRET` - Authentication secret
- `NEXTAUTH_URL` - Application URL
- `SENTRY_DSN` - Error tracking
- `SENTRY_ORG` - Sentry organization
- `SENTRY_PROJECT` - Sentry project

### **Test**
- No required variables (all mocked)

## 🔐 **Security Best Practices**

### **Environment Variables**

1. **Never commit secrets to version control**
2. **Use different secrets for each environment**
3. **Rotate secrets regularly**
4. **Use strong, random secrets**
5. **Validate all environment variables**

### **Configuration Security**

```typescript
// ✅ Good - Use environment-specific configurations
const config = getConfig();
const secret = config.get('NEXTAUTH_SECRET');

// ❌ Bad - Hardcode secrets
const secret = 'hardcoded-secret';

// ✅ Good - Validate required variables
if (!config.get('DATABASE_URL')) {
  throw new Error('DATABASE_URL is required');
}

// ❌ Bad - Skip validation
const dbUrl = process.env.DATABASE_URL || 'default-url';
```

## 🧪 **Testing Configuration**

### **Test Configuration**

```typescript
import { resetConfig, getConfig } from '@/lib/config';

describe('Configuration Tests', () => {
  beforeEach(() => {
    // Reset configuration for each test
    resetConfig();
  });

  test('should load test configuration', () => {
    process.env.NODE_ENV = 'test';
    const config = getConfig();
    
    expect(config.getEnvironment()).toBe('test');
    expect(config.get('DEBUG')).toBe(false);
    expect(config.get('MOCK_EXTERNAL_APIS')).toBe(true);
  });

  test('should validate required variables', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.DATABASE_URL;
    
    expect(() => getConfig()).toThrow('Missing required environment variables');
  });
});
```

### **Mock Configuration**

```typescript
// Mock configuration for testing
jest.mock('@/lib/config', () => ({
  config: {
    get: jest.fn(),
    isFeatureEnabled: jest.fn(),
    isDevelopment: jest.fn(() => true),
    isProduction: jest.fn(() => false),
  },
  isAIEnabled: jest.fn(() => true),
  isDevelopment: jest.fn(() => true),
}));
```

## 📊 **Configuration Monitoring**

### **Configuration Logging**

```typescript
import { logger } from '@/lib/logger';
import { config } from '@/lib/config';

// Log configuration summary on startup
const summary = config.getConfigSummary();
logger.info('Application configuration loaded', { config: summary });
```

### **Configuration Health Checks**

```typescript
// Add to health check endpoint
export async function GET() {
  const config = getConfig();
  const summary = config.getConfigSummary();
  
  return NextResponse.json({
    status: 'healthy',
    config: {
      environment: summary.environment,
      version: summary.appVersion,
      features: summary.features,
    },
  });
}
```

## 🔄 **Migration Guide**

### **From Environment Variables to Configuration Manager**

```typescript
// Before
const dbUrl = process.env.DATABASE_URL;
const isDebug = process.env.DEBUG === 'true';

// After
import { config } from '@/lib/config';
const dbUrl = config.get('DATABASE_URL');
const isDebug = config.get('DEBUG');
```

### **From Hardcoded Values to Feature Flags**

```typescript
// Before
const AI_ENABLED = true;

// After
import { isAIEnabled } from '@/lib/config';
const aiEnabled = isAIEnabled();
```

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Configuration validation errors**
   - Check environment variable names and types
   - Ensure required variables are set
   - Validate URL formats

2. **Feature flags not working**
   - Check environment variable format (`FEATURE_NAME_ENABLED`)
   - Ensure boolean values are properly set

3. **Environment detection issues**
   - Verify `NODE_ENV` is set correctly
   - Check for typos in environment names

### **Debug Configuration**

```typescript
import { config } from '@/lib/config';

// Log all configuration (be careful with secrets!)
if (config.isDevelopment()) {
  console.log('Configuration:', config.getConfigSummary());
}

// Check specific values
console.log('Environment:', config.getEnvironment());
console.log('Features:', {
  ai: config.isFeatureEnabled('ai'),
  analytics: config.isFeatureEnabled('analytics'),
});
```

## 📚 **Additional Resources**

- [Zod Documentation](https://zod.dev/) - Schema validation
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [12-Factor App Configuration](https://12factor.net/config)
- [Security Best Practices](https://owasp.org/www-project-top-ten/)

This configuration system provides a robust foundation for managing application settings across different environments while maintaining security and type safety. 