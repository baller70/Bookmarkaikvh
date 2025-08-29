// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://ff15565ffdd33c2c9af48c3659bc2a83@o4509584649486336.ingest.us.sentry.io/4509584650600448",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Enable logging
  _experiments: {
    enableLogs: true,
  },

  // Console logging integration
  integrations: [
    Sentry.consoleLoggingIntegration({ 
      levels: ['error', 'warn'] 
    }),
  ],
});
