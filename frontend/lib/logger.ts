import * as Sentry from '@sentry/nextjs';

// Log levels
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

// Log context interface
export interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  component?: string;
  action?: string;
  duration?: number;
  metadata?: Record<string, any>;
  error?: string;
}

// Performance metrics interface
export interface PerformanceMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  memoryUsage?: NodeJS.MemoryUsage;
  cpuUsage?: NodeJS.CpuUsage;
}

// Logger class with structured logging
export class Logger {
  private component: string;
  private context: LogContext;

  constructor(component: string, context: LogContext = {}) {
    this.component = component;
    this.context = { ...context, component };
  }

  // Create child logger with additional context
  child(additionalContext: LogContext): Logger {
    return new Logger(this.component, { ...this.context, ...additionalContext });
  }

  // Debug logging
  debug(message: string, context: LogContext = {}): void {
    this.log('debug', message, context);
  }

  // Info logging
  info(message: string, context: LogContext = {}): void {
    this.log('info', message, context);
  }

  // Warning logging
  warn(message: string, context: LogContext = {}): void {
    this.log('warn', message, context);
  }

  // Error logging
  error(message: string, error?: Error, context: LogContext = {}): void {
    this.log('error', message, { ...context, error: error?.stack });
    
    // Send to Sentry if error is provided
    if (error) {
      Sentry.withScope((scope) => {
        scope.setTag('component', this.component);
        scope.setLevel('error');
        scope.setContext('log_context', { ...this.context, ...context });
        Sentry.captureException(error);
      });
    }
  }

  // Fatal error logging
  fatal(message: string, error?: Error, context: LogContext = {}): void {
    this.log('fatal', message, { ...context, error: error?.stack });
    
    // Send to Sentry with fatal level
    if (error) {
      Sentry.withScope((scope) => {
        scope.setTag('component', this.component);
        scope.setLevel('fatal');
        scope.setContext('log_context', { ...this.context, ...context });
        Sentry.captureException(error);
      });
    }
  }

  // Performance logging
  performance(message: string, metrics: PerformanceMetrics, context: LogContext = {}): void {
    const performanceContext = {
      ...context,
      performance: {
        duration: metrics.duration || (metrics.endTime ? metrics.endTime - metrics.startTime : undefined),
        memoryUsed: metrics.memoryUsage?.heapUsed,
        memoryTotal: metrics.memoryUsage?.heapTotal,
        cpuUser: metrics.cpuUsage?.user,
        cpuSystem: metrics.cpuUsage?.system,
      },
    };

    this.log('info', message, performanceContext);

    // Send performance data to Sentry
    Sentry.withScope((scope) => {
      scope.setTag('component', this.component);
      scope.setTag('type', 'performance');
      scope.setContext('performance_metrics', performanceContext.performance);
      Sentry.captureMessage(message, 'info');
    });
  }

  // API request logging
  apiRequest(method: string, url: string, statusCode: number, duration: number, context: LogContext = {}): void {
    const apiContext = {
      ...context,
      api: {
        method,
        url,
        statusCode,
        duration,
        success: statusCode >= 200 && statusCode < 300,
      },
    };

    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    this.log(level, `API ${method} ${url} - ${statusCode} (${duration}ms)`, apiContext);
  }

  // Database query logging
  dbQuery(query: string, duration: number, rowCount?: number, context: LogContext = {}): void {
    const dbContext = {
      ...context,
      database: {
        query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
        duration,
        rowCount,
      },
    };

    this.log('debug', `DB Query executed in ${duration}ms`, dbContext);
  }

  // User action logging
  userAction(action: string, userId: string, context: LogContext = {}): void {
    const userContext = {
      ...context,
      user: {
        id: userId,
        action,
      },
    };

    this.log('info', `User action: ${action}`, userContext);

    // Send user action to Sentry as breadcrumb
    Sentry.addBreadcrumb({
      message: `User action: ${action}`,
      category: 'user',
      level: 'info',
      data: userContext,
    });
  }

  // Security event logging
  security(event: string, severity: 'low' | 'medium' | 'high' | 'critical', context: LogContext = {}): void {
    const securityContext = {
      ...context,
      security: {
        event,
        severity,
        timestamp: new Date().toISOString(),
      },
    };

    const level = severity === 'critical' ? 'fatal' : severity === 'high' ? 'error' : 'warn';
    this.log(level, `Security event: ${event}`, securityContext);

    // Send security events to Sentry with high priority
    Sentry.withScope((scope) => {
      scope.setTag('component', this.component);
      scope.setTag('type', 'security');
      scope.setLevel(severity === 'critical' ? 'fatal' : severity === 'high' ? 'error' : 'warning');
      scope.setContext('security_event', securityContext.security);
      Sentry.captureMessage(`Security event: ${event}`, severity === 'critical' ? 'fatal' : severity === 'high' ? 'error' : 'warning');
    });
  }

  // Business event logging
  businessEvent(event: string, data: Record<string, any>, context: LogContext = {}): void {
    const businessContext = {
      ...context,
      business: {
        event,
        data,
        timestamp: new Date().toISOString(),
      },
    };

    this.log('info', `Business event: ${event}`, businessContext);

    // Send business events to Sentry for analytics
    Sentry.withScope((scope) => {
      scope.setTag('component', this.component);
      scope.setTag('type', 'business');
      scope.setContext('business_event', businessContext.business);
      Sentry.captureMessage(`Business event: ${event}`, 'info');
    });
  }

  // Core logging method
  private log(level: LogLevel, message: string, context: LogContext = {}): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      component: this.component,
      ...this.context,
      ...context,
    };

    // Console logging with colors in development
    if (process.env.NODE_ENV === 'development') {
      this.consoleLog(level, message, logEntry);
    }

    // Structured logging for production
    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify(logEntry));
    }

    // Send to external logging service if configured
    if (process.env.LOG_WEBHOOK_URL) {
      this.sendToExternalLogger(logEntry);
    }
  }

  // Console logging with colors for development
  private consoleLog(level: LogLevel, message: string, logEntry: any): void {
    const colors = {
      debug: '\x1b[36m', // Cyan
      info: '\x1b[32m',  // Green
      warn: '\x1b[33m',  // Yellow
      error: '\x1b[31m', // Red
      fatal: '\x1b[35m', // Magenta
    };

    const reset = '\x1b[0m';
    const color = colors[level] || '';
    
    console.log(
      `${color}[${logEntry.timestamp}] ${level.toUpperCase()} ${this.component}:${reset} ${message}`,
      logEntry.metadata ? logEntry.metadata : ''
    );
  }

  // Send logs to external logging service
  private async sendToExternalLogger(logEntry: any): Promise<void> {
    try {
      if (process.env.LOG_WEBHOOK_URL) {
        await fetch(process.env.LOG_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(logEntry),
        });
      }
    } catch (error) {
      // Fallback to console if external logging fails
      console.error('Failed to send log to external service:', error);
    }
  }
}

// Performance measurement utility
export class PerformanceTimer {
  private startTime: number;
  private startCpuUsage: NodeJS.CpuUsage;
  private startMemoryUsage: NodeJS.MemoryUsage;

  constructor() {
    this.startTime = Date.now();
    this.startCpuUsage = process.cpuUsage();
    this.startMemoryUsage = process.memoryUsage();
  }

  // Get current metrics
  getMetrics(): PerformanceMetrics {
    const endTime = Date.now();
    const endCpuUsage = process.cpuUsage(this.startCpuUsage);
    const endMemoryUsage = process.memoryUsage();

    return {
      startTime: this.startTime,
      endTime,
      duration: endTime - this.startTime,
      memoryUsage: endMemoryUsage,
      cpuUsage: endCpuUsage,
    };
  }

  // Stop timer and return metrics
  stop(): PerformanceMetrics {
    return this.getMetrics();
  }
}

// Request context utility
export class RequestContext {
  private static contexts = new Map<string, LogContext>();

  static set(requestId: string, context: LogContext): void {
    this.contexts.set(requestId, context);
  }

  static get(requestId: string): LogContext | undefined {
    return this.contexts.get(requestId);
  }

  static clear(requestId: string): void {
    this.contexts.delete(requestId);
  }

  static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Default logger instances
export const logger = new Logger('app');
export const apiLogger = new Logger('api');
export const dbLogger = new Logger('database');
export const authLogger = new Logger('auth');
export const aiLogger = new Logger('ai');

// Helper functions
export function createLogger(component: string, context?: LogContext): Logger {
  return new Logger(component, context);
}

export function createPerformanceTimer(): PerformanceTimer {
  return new PerformanceTimer();
}

// Middleware helper for request logging
export function logRequest(
  method: string,
  url: string,
  statusCode: number,
  duration: number,
  context?: LogContext
): void {
  apiLogger.apiRequest(method, url, statusCode, duration, context);
}

// Error logging helper
export function logError(
  component: string,
  message: string,
  error: Error,
  context?: LogContext
): void {
  const componentLogger = new Logger(component);
  componentLogger.error(message, error, context);
}

// Business event logging helper
export function logBusinessEvent(
  event: string,
  data: Record<string, any>,
  context?: LogContext
): void {
  logger.businessEvent(event, data, context);
}

// Security event logging helper
export function logSecurityEvent(
  event: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  context?: LogContext
): void {
  logger.security(event, severity, context);
} 