import * as Sentry from "@sentry/nextjs";

// Get the logger from Sentry
const { logger: sentryLogger } = Sentry;

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  trace(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.log(`[TRACE] ${message}`, context || '');
    }
    sentryLogger.trace(message, context);
  }

  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${message}`, context || '');
    }
    sentryLogger.debug(message, context);
  }

  info(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context || '');
    }
    sentryLogger.info(message, context);
  }

  warn(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context || '');
    }
    sentryLogger.warn(message, context);
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, error, context || '');
    }
    
    // Capture exception with Sentry
    if (error instanceof Error) {
      Sentry.captureException(error, { extra: context });
    }
    
    sentryLogger.error(message, { error: error instanceof Error ? error.message : String(error), ...context });
  }

  fatal(message: string, error?: Error | unknown, context?: LogContext) {
    if (this.isDevelopment) {
      console.error(`[FATAL] ${message}`, error, context || '');
    }
    
    // Capture exception with Sentry
    if (error instanceof Error) {
      Sentry.captureException(error, { level: 'fatal', extra: context });
    }
    
    sentryLogger.fatal(message, { error: error instanceof Error ? error.message : String(error), ...context });
  }

  // Template literal logging
  fmt = sentryLogger.fmt;
}

export const appLogger = new Logger();
export const logger = appLogger; // Named export for backward compatibility
export default appLogger; 