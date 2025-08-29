// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// Extend the Window interface to include our custom property
declare global {
  interface Window {
    __SENTRY_INITIALIZED__?: boolean;
  }
}

// Prevent multiple initializations
if (typeof window !== 'undefined' && !window.__SENTRY_INITIALIZED__) {
  Sentry.init({
    dsn: "https://ff15565ffdd33c2c9af48c3659bc2a83@o4509584649486336.ingest.us.sentry.io/4509584650600448",

    // Add optional integrations for additional features
    integrations: [
      Sentry.replayIntegration({
        // Additional Replay configuration goes in here, for example:
        maskAllText: false,
        blockAllMedia: false,
      }),
      // Console logging integration for structured logs
      Sentry.consoleLoggingIntegration({ 
        levels: ['error', 'warn'] 
      }),
    ],

    // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
    tracesSampleRate: 1,

    // Define how likely Replay events are sampled.
    // This sets the sample rate to be 10%. You may want this to be 100% while
    // in development and sample at a lower rate in production
    replaysSessionSampleRate: 0.1,

    // Define how likely Replay events are sampled when an error occurs.
    replaysOnErrorSampleRate: 1.0,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,

    // Enable logging
    _experiments: {
      enableLogs: true,
    },
  });

  // Mark as initialized
  if (typeof window !== 'undefined') {
    window.__SENTRY_INITIALIZED__ = true;
  }
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;