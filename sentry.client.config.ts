// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import type { ErrorEvent, EventHint, TransactionEvent } from "@sentry/types";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  // Set profilesSampleRate to 1.0 to profile 100% of sampled transactions
  // We recommend adjusting this value in production
  profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  debug: process.env.NODE_ENV === "development",
  
  environment: process.env.NODE_ENV,
  
  // Enhanced error filtering
  beforeSend(event: ErrorEvent, hint: EventHint) {
    // Filter out known non-critical errors
    if (event.exception) {
      const error = hint.originalException;
      if (error && typeof error === 'object' && 'message' in error) {
        const message = error.message as string;
        
        // Filter out common browser extension errors
        if (message.includes('chrome-extension://') || 
            message.includes('moz-extension://') ||
            message.includes('safari-extension://')) {
          return null;
        }
        
        // Filter out network errors that are outside our control
        if (message.includes('NetworkError') || 
            message.includes('Failed to fetch') ||
            message.includes('Load failed')) {
          return null;
        }
        
        // Filter out ResizeObserver errors (common browser quirk)
        if (message.includes('ResizeObserver loop limit exceeded')) {
          return null;
        }
      }
    }
    
    return event;
  },
  
  // Enhanced performance monitoring
  beforeSendTransaction(event: TransactionEvent) {
    // Filter out transactions we don't care about
    if (event.transaction) {
      // Filter out static asset requests
      if (event.transaction.includes('/_next/static/') ||
          event.transaction.includes('/favicon.ico') ||
          event.transaction.includes('/robots.txt')) {
        return null;
      }
    }
    
    return event;
  },
  
  // Custom tags for better organization
  initialScope: {
    tags: {
      component: "client",
      version: process.env.npm_package_version || "unknown",
    },
  },
  
  // Integration configurations
  integrations: [
    Sentry.replayIntegration({
      // Mask all text content, collect only clicks and navigation
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration({
      // Set up automatic route change tracking for Next.js App Router
      instrumentNavigation: true,
      instrumentPageLoad: true,
      
      // Custom route naming for better organization
      routingInstrumentation: Sentry.nextRouterInstrumentation({
        instrumentNavigation: true,
        instrumentPageLoad: true,
      }),
    }),
  ],
  
  // Custom error boundaries
  beforeErrorSampling: (event: ErrorEvent) => {
    // Sample errors based on user status or other criteria
    return Math.random() < 0.5; // 50% sampling rate
  },
}); 