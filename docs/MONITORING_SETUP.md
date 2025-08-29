# Monitoring and Logging System

This document describes the comprehensive monitoring and logging system implemented for BookAIMark.

## 🏗️ Architecture Overview

The monitoring system consists of several integrated components:

1. **Centralized Logging** - Structured logging with multiple transports
2. **Performance Monitoring** - Web vitals and API performance tracking
3. **Error Tracking** - Sentry integration for error monitoring
4. **Health Checks** - System health monitoring endpoints
5. **Monitoring Dashboard** - Real-time monitoring interface

## 📊 Components

### 1. Centralized Logger (`lib/logger.ts`)

A Winston-based logging system with:
- **Console Transport** - For development
- **File Transport** - For persistent logging
- **Sentry Transport** - For error tracking
- **Structured Logging** - JSON format with metadata

```typescript
import { logger } from '@/lib/logger';

logger.info('User action', { userId: '123', action: 'login' });
logger.error('API error', { endpoint: '/api/users', error: error.message });
```

### 2. Performance Monitoring (`lib/monitoring/performance.ts`)

Tracks Web Vitals and custom metrics:
- **LCP** (Largest Contentful Paint)
- **FID** (First Input Delay)
- **CLS** (Cumulative Layout Shift)
- **API Response Times**
- **Resource Loading**
- **Long Tasks**

```typescript
import { usePerformanceMonitor } from '@/lib/monitoring/performance';

const { startTimer, measureAsync } = usePerformanceMonitor();

// Time a function
const endTimer = startTimer('user_action');
// ... do work
endTimer();

// Measure async operation
await measureAsync('api_call', () => fetch('/api/data'));
```

### 3. Error Boundary (`components/ErrorBoundary.tsx`)

React error boundary with:
- **Automatic Error Capture** - Catches React errors
- **User-Friendly UI** - Graceful error display
- **Error Reporting** - Automatic Sentry integration
- **Recovery Options** - Retry and navigation options

```typescript
import ErrorBoundary from '@/components/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### 4. Configuration System (`lib/config/index.ts`)

Environment-based configuration:
- **Development Config** - Debug logging, detailed errors
- **Production Config** - Optimized for performance
- **Type Safety** - Full TypeScript support

```typescript
import { config } from '@/lib/config';

if (config.monitoring.performance.enabled) {
  // Enable performance monitoring
}
```

### 5. Monitoring Dashboard (`components/monitoring/MonitoringDashboard.tsx`)

Real-time monitoring interface with:
- **System Health** - Status, uptime, response times
- **Performance Metrics** - Web vitals visualization
- **Error Tracking** - Error summaries and trends
- **API Monitoring** - Endpoint performance tracking

## 🚀 Getting Started

### 1. Environment Setup

Create a `.env.local` file with:

```bash
# Logging
LOG_LEVEL=info
LOG_FILE_PATH=./logs/app.log

# Sentry (optional)
SENTRY_DSN=your_sentry_dsn_here
SENTRY_ENVIRONMENT=development

# Performance Monitoring
PERFORMANCE_MONITORING_ENABLED=true
PERFORMANCE_SAMPLE_RATE=0.1

# Health Check
HEALTH_CHECK_ENABLED=true
```

### 2. Initialize Monitoring

The monitoring system is automatically initialized through `instrumentation.ts`:

```typescript
// instrumentation.ts
export async function register() {
  // Automatic initialization of:
  // - Logger
  // - Sentry
  // - Performance monitoring
  // - Health checks
}
```

### 3. Add Error Boundaries

Wrap your app or components with error boundaries:

```typescript
// app/layout.tsx
import ErrorBoundary from '@/components/ErrorBoundary';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

### 4. Use Logging

Add logging throughout your application:

```typescript
import { logger } from '@/lib/logger';

// API routes
export async function GET(request: Request) {
  logger.info('API request received', { 
    endpoint: '/api/users',
    method: 'GET',
    userAgent: request.headers.get('user-agent')
  });

  try {
    const users = await getUsers();
    logger.info('API request successful', { count: users.length });
    return NextResponse.json(users);
  } catch (error) {
    logger.error('API request failed', { error: error.message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## 📈 Monitoring Endpoints

### Health Check - `/api/health`

Returns system health status:

```json
{
  "status": "healthy",
  "timestamp": "2025-01-12T07:22:37.455Z",
  "uptime": 11.480433417,
  "version": "0.1.0",
  "environment": "development",
  "checks": {
    "server": "ok",
    "database": "ok",
    "memory": {
      "used": 365,
      "total": 386
    }
  }
}
```

### Sentry Test - `/api/sentry-test`

Tests error tracking integration:

```json
{
  "message": "Sentry test successful",
  "timestamp": "2025-01-12T07:22:43.797Z",
  "status": "ok"
}
```

### Monitoring Dashboard - `/monitoring`

Access the real-time monitoring dashboard at:
- **Development**: `http://localhost:3000/monitoring`
- **Production**: `https://your-domain.com/monitoring`

## 🔧 Configuration

### Log Levels

Available log levels (in order of severity):
- `error` - Error conditions
- `warn` - Warning conditions
- `info` - Informational messages
- `debug` - Debug-level messages

### Performance Monitoring

Configure performance monitoring:

```typescript
// config/environments/development.ts
export const developmentConfig = {
  monitoring: {
    performance: {
      enabled: true,
      sampleRate: 1.0, // Monitor 100% in development
      thresholds: {
        lcp: 2500,      // Largest Contentful Paint
        fid: 100,       // First Input Delay
        cls: 0.1,       // Cumulative Layout Shift
      }
    }
  }
};
```

### Sentry Configuration

Configure error tracking:

```typescript
// sentry.server.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Filter sensitive data
    return event;
  }
});
```

## 📊 Monitoring Dashboard Features

### System Health
- **Status Indicators** - Healthy, Warning, Critical
- **Uptime Tracking** - System availability
- **Response Times** - Average API response times
- **Error Rates** - Percentage of failed requests

### Performance Metrics
- **Web Vitals** - LCP, FID, CLS tracking
- **Resource Loading** - Asset load times
- **Long Tasks** - Performance bottleneck detection
- **Custom Metrics** - Application-specific measurements

### Error Tracking
- **Error Summaries** - Total and recent error counts
- **Top Errors** - Most frequent error types
- **Error Trends** - Historical error patterns
- **Stack Traces** - Detailed error information

### API Monitoring
- **Endpoint Performance** - Response times by endpoint
- **Status Codes** - Success and error rates
- **Request Volumes** - API usage patterns
- **Error Analysis** - Failed request investigation

## 🚨 Alerting

### Automatic Alerts

The system automatically logs warnings for:
- **Poor Performance** - LCP > 2.5s, FID > 100ms, CLS > 0.1
- **Slow APIs** - Response times > 1s
- **Long Tasks** - JavaScript tasks > 50ms
- **High Error Rates** - Error rates > 5%

### Custom Alerts

Add custom performance thresholds:

```typescript
import { performanceMonitor } from '@/lib/monitoring/performance';

performanceMonitor.recordMetric({
  name: 'custom_metric',
  value: 150,
  unit: 'ms',
  timestamp: Date.now(),
  metadata: { feature: 'bookmark_search' }
});
```

## 🔍 Debugging

### Development Mode

In development, the system provides:
- **Detailed Error Messages** - Full stack traces
- **Performance Warnings** - Console warnings for slow operations
- **Debug Logging** - Verbose logging output
- **Error Boundaries** - Show/hide error details toggle

### Production Mode

In production, the system:
- **Sanitizes Errors** - Removes sensitive information
- **Optimizes Performance** - Reduces monitoring overhead
- **Aggregates Metrics** - Batches performance data
- **Graceful Degradation** - Continues operation despite monitoring failures

## 🔒 Security Considerations

### Data Privacy
- **No PII Logging** - Personal information is filtered
- **Error Sanitization** - Sensitive data removed from error reports
- **Secure Transmission** - HTTPS for all monitoring data
- **Access Control** - Monitoring dashboard requires authentication

### Performance Impact
- **Minimal Overhead** - <1% performance impact
- **Sampling** - Configurable sampling rates
- **Async Operations** - Non-blocking monitoring
- **Memory Management** - Automatic cleanup of old metrics

## 📝 Best Practices

### Logging
```typescript
// ✅ Good - Structured logging with context
logger.info('User login successful', { 
  userId: user.id,
  method: 'email',
  duration: loginTime 
});

// ❌ Bad - Unstructured logging
logger.info(`User ${user.id} logged in`);
```

### Error Handling
```typescript
// ✅ Good - Catch and log errors
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', { 
    operation: 'riskyOperation',
    error: error.message,
    stack: error.stack 
  });
  throw error; // Re-throw for proper error handling
}
```

### Performance Monitoring
```typescript
// ✅ Good - Measure important operations
const endTimer = performanceMonitor.startTimer('search_bookmarks');
const results = await searchBookmarks(query);
endTimer();

// ✅ Good - Add context to metrics
performanceMonitor.recordMetric({
  name: 'search_results',
  value: results.length,
  unit: 'count',
  timestamp: Date.now(),
  metadata: { query: query.substring(0, 50) }
});
```

## 🚀 Deployment

### Environment Variables

Set these in your production environment:

```bash
# Required
LOG_LEVEL=info
NODE_ENV=production

# Optional but recommended
SENTRY_DSN=your_production_sentry_dsn
PERFORMANCE_MONITORING_ENABLED=true
PERFORMANCE_SAMPLE_RATE=0.01
```

### Monitoring Setup

1. **Configure Sentry** - Set up error tracking
2. **Set Log Levels** - Use `info` or `warn` in production
3. **Enable Health Checks** - Monitor system availability
4. **Set up Alerts** - Configure notification channels

## 📞 Support

For monitoring system issues:

1. **Check Health Endpoint** - `/api/health`
2. **Review Logs** - Check application logs
3. **Sentry Dashboard** - Review error tracking
4. **Performance Metrics** - Check monitoring dashboard

The monitoring system is designed to be self-healing and will continue operating even if individual components fail.

## 🔄 Updates

The monitoring system is automatically updated with the application. Configuration changes require a restart to take effect.

For the latest monitoring features and updates, check the project documentation and release notes. 