// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  debug: process.env.NODE_ENV === "development",
  
  environment: process.env.NODE_ENV,
  
  // Custom tags for better organization
  initialScope: {
    tags: {
      component: "edge",
      version: process.env.npm_package_version || "unknown",
    },
  },
  
  // Enhanced error filtering for edge runtime
  beforeSend(event, hint) {
    // Filter out known non-critical edge errors
    if (event.exception) {
      const error = hint.originalException;
      if (error && typeof error === 'object' && 'message' in error) {
        const message = error.message as string;
        
        // Filter out common edge runtime errors
        if (message.includes('Dynamic Code Evaluation') ||
            message.includes('eval is not defined')) {
          return null;
        }
      }
    }
    
    return event;
  },
  
  // Enhanced performance monitoring for edge
  beforeSendTransaction(event) {
    // Filter out transactions we don't care about
    if (event.transaction) {
      // Filter out health check requests
      if (event.transaction.includes('/api/health')) {
        return null;
      }
    }
    
    return event;
  },
});

// Custom error wrapper for edge functions
export function withSentryEdgeErrorHandling<T extends (...args: any[]) => any>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      // Add custom context to the error
      Sentry.withScope((scope) => {
        scope.setTag('handler', handler.name || 'anonymous');
        scope.setTag('runtime', 'edge');
        scope.setLevel('error');
        
        Sentry.captureException(error);
      });
      
      throw error;
    }
  }) as T;
}

export { Sentry }; 