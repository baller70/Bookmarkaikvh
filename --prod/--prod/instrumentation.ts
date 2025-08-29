// Sentry instrumentation with graceful fallback
let Sentry: any = null;

try {
  Sentry = require('@sentry/nextjs');
} catch (error) {
  console.warn('⚠️ Sentry not available, skipping instrumentation');
}

export async function register() {
  if (!Sentry) return;

  try {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      await import('./sentry.server.config');
    }

    if (process.env.NEXT_RUNTIME === 'edge') {
      await import('./sentry.edge.config');
    }
  } catch (error) {
    console.warn('⚠️ Sentry config not found, skipping:', error.message);
  }
}

export const onRequestError = Sentry?.captureRequestError || ((error: any) => {
  console.error('Request error (Sentry unavailable):', error);
}); 