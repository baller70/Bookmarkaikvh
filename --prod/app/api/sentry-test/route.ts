import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function GET(request: NextRequest) {
  // Test successful response with performance tracking
  const transaction = Sentry.startSpan(
    {
      name: 'sentry-test-success',
      op: 'test',
    },
    async (span) => {
      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Add custom context
      Sentry.setContext('test_context', {
        endpoint: '/api/sentry-test',
        method: 'GET',
        timestamp: new Date().toISOString(),
      });
      
      // Add custom tags
      Sentry.setTag('test_type', 'success');
      Sentry.setTag('component', 'api');
      
      return NextResponse.json({
        message: 'Sentry test successful',
        timestamp: new Date().toISOString(),
        status: 'ok',
      });
    }
  );
  
  return transaction;
}

export async function POST(request: NextRequest) {
  // Test error tracking
  try {
    const body = await request.json();
    
    // Add user context for error tracking
    Sentry.setUser({
      id: 'test-user',
      email: 'test@example.com',
    });
    
    // Add request context
    Sentry.setContext('request_context', {
      url: request.url,
      method: request.method,
      body: body,
    });
    
    // Simulate different types of errors based on request
    if (body.errorType === 'validation') {
      throw new Error('Validation error: Invalid input provided');
    } else if (body.errorType === 'database') {
      throw new Error('Database error: Connection failed');
    } else if (body.errorType === 'external') {
      throw new Error('External API error: Service unavailable');
    } else {
      // Generic error
      throw new Error('Test error for Sentry tracking');
    }
    
  } catch (error) {
    // Capture error with additional context
    Sentry.withScope((scope) => {
      scope.setLevel('error');
      scope.setTag('test_type', 'error');
      scope.setTag('component', 'api');
      scope.setContext('error_details', {
        endpoint: '/api/sentry-test',
        method: 'POST',
        timestamp: new Date().toISOString(),
      });
      
      Sentry.captureException(error);
    });
    
    return NextResponse.json(
      {
        message: 'Error captured by Sentry',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  // Test custom event tracking
  const body = await request.json();
  
  // Capture custom event
  Sentry.addBreadcrumb({
    message: 'Custom event test initiated',
    category: 'test',
    level: 'info',
    data: {
      endpoint: '/api/sentry-test',
      method: 'PUT',
      payload: body,
    },
  });
  
  // Capture custom message
  Sentry.captureMessage('Custom event test completed', 'info');
  
  // Test performance with custom metrics
  const startTime = Date.now();
  
  // Simulate processing
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const processingTime = Date.now() - startTime;
  
  // Add custom context
  Sentry.setContext('performance', {
    processingTime: processingTime,
    endpoint: '/api/sentry-test',
  });
  
  return NextResponse.json({
    message: 'Custom event captured',
    processingTime: `${processingTime}ms`,
    timestamp: new Date().toISOString(),
  });
}

export async function DELETE(request: NextRequest) {
  // Test transaction with performance tracking
  const startTime = Date.now();
  
  // Simulate database operation
  await new Promise(resolve => setTimeout(resolve, 50));
  
  // Simulate external API call
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Simulate data processing
  await new Promise(resolve => setTimeout(resolve, 75));
  
  const totalTime = Date.now() - startTime;
  
  // Add breadcrumb
  Sentry.addBreadcrumb({
    message: 'Transaction test completed',
    category: 'test',
    level: 'info',
    data: {
      processingTime: totalTime,
      operations: ['database', 'external-api', 'data-processing'],
    },
  });
  
  return NextResponse.json({
    message: 'Transaction test completed',
    processingTime: `${totalTime}ms`,
    operations: ['database-operation', 'external-api-call', 'data-processing'],
    timestamp: new Date().toISOString(),
  });
} 