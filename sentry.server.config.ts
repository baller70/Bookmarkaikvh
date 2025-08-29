// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  // Set profilesSampleRate to 1.0 to profile 100% of sampled transactions
  // We recommend adjusting this value in production
  profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  debug: process.env.NODE_ENV === "development",
  
  environment: process.env.NODE_ENV,
  
  // Custom tags for better organization
  initialScope: {
    tags: {
      component: "server",
      version: process.env.npm_package_version || "unknown",
    },
  },
  
  // Enhanced error filtering for server-side
  beforeSend(event, hint) {
    // Filter out known non-critical server errors
    if (event.exception) {
      const error = hint.originalException;
      if (error && typeof error === 'object' && 'message' in error) {
        const message = error.message as string;
        
        // Filter out common database connection timeouts during development
        if (process.env.NODE_ENV === "development" && 
            (message.includes('ECONNREFUSED') || 
             message.includes('Connection terminated'))) {
          return null;
        }
        
        // Filter out aborted requests (client disconnected)
        if (message.includes('aborted') || message.includes('ECONNRESET')) {
          return null;
        }
      }
    }
    
    return event;
  },
  
  // Enhanced performance monitoring for server
  beforeSendTransaction(event) {
    // Filter out transactions we don't care about
    if (event.transaction) {
      // Filter out health check requests
      if (event.transaction.includes('/api/health') ||
          event.transaction.includes('/api/ping')) {
        return null;
      }
      
      // Filter out static asset requests
      if (event.transaction.includes('/_next/static/')) {
        return null;
      }
    }
    
    return event;
  },
  
  // Server-specific integrations
  integrations: [
    // Add HTTP integration for better request tracking
    Sentry.httpIntegration(),
    
    // Add Node.js context for better debugging
    Sentry.nodeContextIntegration(),
  ],
  
  // Custom context for server errors
  beforeBreadcrumb(breadcrumb) {
    // Filter out noisy breadcrumbs
    if (breadcrumb.category === 'http' && breadcrumb.data?.url) {
      const url = breadcrumb.data.url as string;
      if (url.includes('/_next/static/') || 
          url.includes('/api/health') ||
          url.includes('/favicon.ico')) {
        return null;
      }
    }
    
    return breadcrumb;
  },
});

// Custom error wrapper for API routes
export function withSentryErrorHandling<T extends (...args: any[]) => any>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      // Add custom context to the error
      Sentry.withScope((scope) => {
        scope.setTag('handler', handler.name || 'anonymous');
        scope.setLevel('error');
        
        // Add request context if available
        const [req] = args;
        if (req && typeof req === 'object' && 'url' in req) {
          scope.setContext('request', {
            url: req.url,
            method: req.method,
            headers: req.headers,
          });
        }
        
        Sentry.captureException(error);
      });
      
      throw error;
    }
  }) as T;
}

// Utility function to capture custom events
export function captureCustomEvent(
  eventName: string,
  data: Record<string, any> = {},
  level: 'info' | 'warning' | 'error' = 'info'
) {
  Sentry.withScope((scope) => {
    scope.setLevel(level);
    scope.setTag('event_type', 'custom');
    scope.setContext('custom_data', data);
    
    Sentry.captureMessage(eventName, level);
  });
}

// Performance monitoring utilities
export function startTransaction(name: string, op: string) {
  return Sentry.startSpan({
    name,
    op,
    attributes: {
      component: 'server',
    },
  }, (span) => span);
}

export { Sentry }; 