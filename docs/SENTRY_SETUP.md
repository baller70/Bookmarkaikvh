# Sentry Integration Setup Guide

This guide explains how to set up Sentry error tracking and performance monitoring for the BookAIMark application.

## 🚀 Quick Start

1. **Create a Sentry Account**
   - Go to [sentry.io](https://sentry.io) and create an account
   - Create a new project for "Next.js"
   - Note your DSN (Data Source Name)

2. **Configure Environment Variables**
   Add these variables to your `.env.local` file:

   ```bash
   # Sentry Configuration
   NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
   SENTRY_ORG=your-organization-slug
   SENTRY_PROJECT=your-project-slug
   SENTRY_AUTH_TOKEN=your-auth-token
   ```

3. **Install Dependencies**
   ```bash
   pnpm install @sentry/nextjs
   ```

## 📊 Features Included

### Error Tracking
- **Client-side errors**: Browser JavaScript errors
- **Server-side errors**: API route and server component errors
- **Edge runtime errors**: Middleware and edge function errors
- **Custom error filtering**: Filters out browser extensions and non-critical errors

### Performance Monitoring
- **Page load performance**: Core Web Vitals tracking
- **API response times**: Server-side performance metrics
- **Database query performance**: Transaction tracking
- **User interactions**: Button clicks and form submissions

### Session Replay
- **10% of sessions**: Random sampling for general insights
- **100% of error sessions**: Full replay for debugging errors
- **Privacy-first**: Text content is masked, only interactions tracked

## 🔧 Configuration Files

### Client Configuration (`sentry.client.config.ts`)
- Browser-side error tracking
- Performance monitoring
- Session replay
- User interaction tracking

### Server Configuration (`sentry.server.config.ts`)
- API route error tracking
- Database query monitoring
- Custom error handling utilities
- Performance transaction tracking

### Edge Configuration (`sentry.edge.config.ts`)
- Middleware error tracking
- Edge function monitoring
- Lightweight configuration for edge runtime

### Next.js Integration (`next.config.mjs`)
- Webpack plugin configuration
- Source map uploading
- Build-time integration
- Production optimizations

## 🛠️ Custom Utilities

### Error Handling Wrapper
```typescript
import { withSentryErrorHandling } from '../../../sentry.server.config';

export const GET = withSentryErrorHandling(async (request) => {
  // Your API logic here
  return NextResponse.json({ success: true });
});
```

### Custom Event Tracking
```typescript
import { captureCustomEvent } from '../../../sentry.server.config';

// Track custom business events
captureCustomEvent('bookmark_created', {
  userId: user.id,
  category: bookmark.category,
  source: 'manual'
}, 'info');
```

### Performance Monitoring
```typescript
import { startTransaction } from '../../../sentry.server.config';

const transaction = startTransaction('bookmark_processing', 'task');
// Your processing logic
transaction.finish();
```

## 📈 Production Setup

### Environment Variables
```bash
# Production Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://your-production-dsn@sentry.io/project-id
SENTRY_ORG=your-organization
SENTRY_PROJECT=bookaimark-production
SENTRY_AUTH_TOKEN=your-production-auth-token
NODE_ENV=production
```

### Source Maps
- Source maps are automatically uploaded in production builds
- Auth token required for source map uploads
- Maps are hidden from client bundles for security

### Performance Sampling
- **Production**: 10% sampling rate for performance monitoring
- **Development**: 100% sampling rate for debugging
- **Profiles**: 10% sampling rate for detailed performance profiling

## 🔍 Monitoring Dashboard

### Key Metrics to Monitor
1. **Error Rate**: Percentage of requests that result in errors
2. **Response Time**: P95 response time for API endpoints
3. **Core Web Vitals**: LCP, FID, CLS scores
4. **User Sessions**: Active users and session duration
5. **Release Health**: Error rates by deployment version

### Alerts Setup
1. **High Error Rate**: > 5% error rate in 5 minutes
2. **Slow Response Time**: P95 > 2 seconds for 10 minutes
3. **Core Web Vitals**: LCP > 2.5s or CLS > 0.1
4. **Memory Usage**: Heap usage > 80% for 15 minutes

## 🚨 Error Filtering

### Automatically Filtered Errors
- Browser extension errors
- Network connectivity issues
- ResizeObserver loop errors
- Static asset loading failures
- Development-only connection errors

### Custom Error Filtering
```typescript
beforeSend(event, hint) {
  // Custom filtering logic
  if (event.exception?.values?.[0]?.value?.includes('custom-filter')) {
    return null; // Don't send to Sentry
  }
  return event;
}
```

## 🔐 Security & Privacy

### Data Masking
- All text content is masked in session replays
- Sensitive form fields are automatically hidden
- Custom data scrubbing for PII

### Network Security
- Requests routed through `/monitoring` tunnel to avoid ad-blockers
- Source maps are hidden from client bundles
- Debug information only in development

## 📚 Best Practices

### 1. Error Context
Always add relevant context to errors:
```typescript
Sentry.withScope((scope) => {
  scope.setTag('feature', 'bookmark-import');
  scope.setUser({ id: user.id });
  scope.setContext('import_data', { count: bookmarks.length });
  Sentry.captureException(error);
});
```

### 2. Performance Monitoring
Use transactions for important operations:
```typescript
const transaction = Sentry.startTransaction({
  name: 'AI Analysis',
  op: 'ai.process'
});

try {
  await processWithAI(content);
  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('internal_error');
  throw error;
} finally {
  transaction.finish();
}
```

### 3. Release Tracking
Tag deployments with release versions:
```bash
# Set release version
export SENTRY_RELEASE=$(git rev-parse HEAD)
```

## 🧪 Testing

### Development Testing
```bash
# Test error tracking
curl -X POST http://localhost:3000/api/sentry-test

# Test performance monitoring
curl http://localhost:3000/api/health
```

### Production Validation
1. Check Sentry dashboard for incoming events
2. Verify source maps are uploaded correctly
3. Test error alerting system
4. Validate performance metrics collection

## 📞 Support

### Troubleshooting
- Check browser console for Sentry initialization errors
- Verify environment variables are set correctly
- Ensure auth token has correct permissions
- Check network connectivity to Sentry servers

### Resources
- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Performance Monitoring Guide](https://docs.sentry.io/product/performance/)
- [Error Tracking Best Practices](https://docs.sentry.io/product/issues/)

## 🔄 Migration Notes

### From Existing Error Tracking
1. Export existing error data if needed
2. Update error handling code to use Sentry
3. Configure alerts and dashboards
4. Train team on new monitoring tools

### Version Updates
- Keep `@sentry/nextjs` updated for security patches
- Review breaking changes in release notes
- Test configuration changes in development first
- Monitor performance impact of updates 