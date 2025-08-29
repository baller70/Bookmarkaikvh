import { logger } from './lib/logger';
import { config } from './lib/config';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    logger.info('Instrumentation: Registering Node.js runtime', {
      environment: config.app.environment,
      version: config.app.version,
      nodeVersion: process.version,
    });
    
    // Initialize Sentry
    await import('./sentry.server.config');
    if (config.monitoring.sentry.dsn) {
      logger.info('Instrumentation: Sentry initialized', {
        dsn: config.monitoring.sentry.dsn.substring(0, 20) + '...',
      });
    }
    
    // Initialize performance monitoring
    if (config.monitoring.performance.enabled) {
      logger.info('Instrumentation: Performance monitoring enabled');
    }
    
    // Initialize health check endpoint
    logger.info('Instrumentation: Health check endpoint available at /api/health');
    
    // Log configuration summary
    logger.info('Instrumentation: Configuration loaded', {
      logLevel: config.logging.level,
      environment: config.app.environment,
//       performanceMonitoring: config.monitoring.performance.enabled,
      sentryEnabled: !!config.monitoring.sentry.dsn,
    });
    
    logger.info('Instrumentation: Registration complete');
  }
  
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}
