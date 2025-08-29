import { NextRequest, NextResponse } from 'next/server';
import { apiLogger, createPerformanceTimer, RequestContext, type LogContext } from '../logger';

// Request logging middleware
export function withLogging<T extends (...args: any[]) => any>(
  handler: T,
  options: {
    component?: string;
    logBody?: boolean;
    logHeaders?: boolean;
    logResponse?: boolean;
  } = {}
): T {
  return (async (...args: Parameters<T>) => {
    const [request] = args;
    const timer = createPerformanceTimer();
    const requestId = RequestContext.generateRequestId();
    
    // Extract request information
    const method = request.method || 'UNKNOWN';
    const url = request.url || 'UNKNOWN';
    const userAgent = request.headers?.get('user-agent') || 'unknown';
    const ip = request.headers?.get('x-forwarded-for') || 
               request.headers?.get('x-real-ip') || 
               'unknown';
    
    // Create request context
    const requestContext: LogContext = {
      requestId,
      component: options.component || 'api',
      metadata: {
        method,
        url,
        userAgent,
        ip,
        timestamp: new Date().toISOString(),
      },
    };
    
    // Add headers if requested
    if (options.logHeaders && request.headers) {
      const headers: Record<string, string> = {};
      request.headers.forEach((value, key) => {
        // Filter out sensitive headers
        if (!['authorization', 'cookie', 'x-api-key'].includes(key.toLowerCase())) {
          headers[key] = value;
        }
      });
      requestContext.metadata!.headers = headers;
    }
    
    // Add request body if requested
    if (options.logBody && request.body) {
      try {
        const body = await request.clone().text();
        if (body && body.length < 1000) { // Limit body size
          requestContext.metadata!.body = body;
        }
      } catch (error) {
        // Ignore body parsing errors
      }
    }
    
    // Store request context
    RequestContext.set(requestId, requestContext);
    
    // Log incoming request
    apiLogger.info(`Incoming ${method} ${url}`, requestContext);
    
    let response: NextResponse;
    let error: Error | null = null;
    
    try {
      // Execute the handler
      response = await handler(...args);
      
      // Log successful response
      const metrics = timer.stop();
      const statusCode = response.status || 200;
      
      const responseContext: LogContext = {
        ...requestContext,
        metadata: {
          ...requestContext.metadata,
          statusCode,
          duration: metrics.duration,
          memoryUsed: metrics.memoryUsage?.heapUsed,
        },
      };
      
      // Add response body if requested and not too large
      if (options.logResponse && response.body) {
        try {
          const responseClone = response.clone();
          const responseText = await responseClone.text();
          if (responseText && responseText.length < 1000) {
            responseContext.metadata!.responseBody = responseText;
          }
        } catch (error) {
          // Ignore response parsing errors
        }
      }
      
      apiLogger.apiRequest(method, url, statusCode, metrics.duration!, responseContext);
      
      // Log performance metrics
      if (metrics.duration! > 1000) { // Log slow requests
        apiLogger.performance(`Slow request: ${method} ${url}`, metrics, responseContext);
      }
      
      return response;
      
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err));
      
      // Log error
      const metrics = timer.stop();
      const errorContext: LogContext = {
        ...requestContext,
        metadata: {
          ...requestContext.metadata,
          duration: metrics.duration,
          error: error.message,
          stack: error.stack,
        },
      };
      
      apiLogger.error(`Request failed: ${method} ${url}`, error, errorContext);
      
      // Re-throw the error
      throw error;
      
    } finally {
      // Clean up request context
      RequestContext.clear(requestId);
    }
  }) as T;
}

// User action logging middleware
export function withUserActionLogging<T extends (...args: any[]) => any>(
  handler: T,
  actionName: string
): T {
  return (async (...args: Parameters<T>) => {
    const [request] = args;
    
    try {
      // Extract user information from request
      const userId = request.headers?.get('x-user-id') || 'anonymous';
      const sessionId = request.headers?.get('x-session-id') || 'unknown';
      
      // Log user action
      apiLogger.userAction(actionName, userId, {
        sessionId,
        metadata: {
          method: request.method,
          url: request.url,
          timestamp: new Date().toISOString(),
        },
      });
      
      return await handler(...args);
      
    } catch (error) {
      // Log failed user action
      apiLogger.error(`User action failed: ${actionName}`, error as Error, {
        metadata: {
          method: request.method,
          url: request.url,
        },
      });
      
      throw error;
    }
  }) as T;
}

// Security event logging middleware
export function withSecurityLogging<T extends (...args: any[]) => any>(
  handler: T,
  options: {
    checkRateLimit?: boolean;
    checkAuthentication?: boolean;
    logSuspiciousActivity?: boolean;
  } = {}
): T {
  return (async (...args: Parameters<T>) => {
    const [request] = args;
    const ip = request.headers?.get('x-forwarded-for') || 
               request.headers?.get('x-real-ip') || 
               'unknown';
    
    // Check for suspicious activity
    if (options.logSuspiciousActivity) {
      const userAgent = request.headers?.get('user-agent') || '';
      const referer = request.headers?.get('referer') || '';
      
      // Log suspicious patterns
      if (userAgent.includes('bot') || userAgent.includes('crawler')) {
        apiLogger.security('Bot/crawler detected', 'low', {
          metadata: {
            ip,
            userAgent,
            url: request.url,
          },
        });
      }
      
      // Check for potential SQL injection attempts
      const url = request.url || '';
      if (url.includes('union') || url.includes('select') || url.includes('drop')) {
        apiLogger.security('Potential SQL injection attempt', 'high', {
          metadata: {
            ip,
            url,
            userAgent,
          },
        });
      }
    }
    
    // Check authentication if required
    if (options.checkAuthentication) {
      const authHeader = request.headers?.get('authorization');
      if (!authHeader) {
        apiLogger.security('Unauthenticated request to protected endpoint', 'medium', {
          metadata: {
            ip,
            url: request.url,
            userAgent: request.headers?.get('user-agent'),
          },
        });
      }
    }
    
    return await handler(...args);
  }) as T;
}

// Database query logging helper
export function logDatabaseQuery(
  query: string,
  duration: number,
  rowCount?: number,
  context?: LogContext
): void {
  apiLogger.dbQuery(query, duration, rowCount, context);
}

// Business event logging helper
export function logBusinessEvent(
  event: string,
  data: Record<string, any>,
  context?: LogContext
): void {
  apiLogger.businessEvent(event, data, context);
}

// Combined middleware for comprehensive logging
export function withComprehensiveLogging<T extends (...args: any[]) => any>(
  handler: T,
  options: {
    component?: string;
    actionName?: string;
    logBody?: boolean;
    logHeaders?: boolean;
    logResponse?: boolean;
    enableSecurity?: boolean;
    enableUserTracking?: boolean;
  } = {}
): T {
  let wrappedHandler = handler;
  
  // Apply logging middleware
  wrappedHandler = withLogging(wrappedHandler, {
    component: options.component,
    logBody: options.logBody,
    logHeaders: options.logHeaders,
    logResponse: options.logResponse,
  });
  
  // Apply user action logging if specified
  if (options.actionName && options.enableUserTracking) {
    wrappedHandler = withUserActionLogging(wrappedHandler, options.actionName);
  }
  
  // Apply security logging if enabled
  if (options.enableSecurity) {
    wrappedHandler = withSecurityLogging(wrappedHandler, {
      checkAuthentication: true,
      logSuspiciousActivity: true,
    });
  }
  
  return wrappedHandler;
}

// Request ID injection middleware
export function injectRequestId(request: NextRequest): NextRequest {
  const requestId = RequestContext.generateRequestId();
  
  // Add request ID to headers
  const headers = new Headers(request.headers);
  headers.set('x-request-id', requestId);
  
  return new NextRequest(request.url, {
    method: request.method,
    headers,
    body: request.body,
  });
}

// Error boundary for API routes
export function withErrorBoundary<T extends (...args: any[]) => any>(
  handler: T,
  options: {
    component?: string;
    fallbackResponse?: any;
  } = {}
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      // Log the error
      apiLogger.error(`Unhandled error in ${options.component || 'API'}`, err, {
        metadata: {
          handler: handler.name,
          timestamp: new Date().toISOString(),
        },
      });
      
      // Return fallback response or generic error
      if (options.fallbackResponse) {
        return NextResponse.json(options.fallbackResponse, { status: 500 });
      }
      
      return NextResponse.json(
        {
          error: 'Internal server error',
          message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  }) as T;
} 