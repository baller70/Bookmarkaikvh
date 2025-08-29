'use client';

import React from 'react';
import { ErrorBoundary as SentryErrorBoundary, withErrorBoundary } from '@sentry/nextjs';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { logger } from '@/lib/logger';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
}

interface ErrorFallbackProps {
  error: Error;
  errorInfo: React.ErrorInfo;
  resetError: () => void;
  errorId: string | null;
  showDetails?: boolean;
}

class ErrorBoundaryClass extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Log error details
    logger.error('Error Boundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId,
      timestamp: new Date().toISOString(),
    });

    this.setState({
      error,
      errorInfo,
      errorId,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error!}
          errorInfo={this.state.errorInfo!}
          resetError={this.resetError}
          errorId={this.state.errorId}
          showDetails={this.props.showDetails}
        />
      );
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  resetError,
  errorId,
  showDetails = false,
}) => {
  const [showErrorDetails, setShowErrorDetails] = React.useState(showDetails);

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  const handleReportBug = () => {
    const subject = encodeURIComponent(`Bug Report - Error ID: ${errorId}`);
    const body = encodeURIComponent(`
Error ID: ${errorId}
Error Message: ${error.message}
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}

Additional Details:
Please describe what you were doing when this error occurred.
    `);
    window.open(`mailto:support@bookaimark.com?subject=${subject}&body=${body}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Oops! Something went wrong
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            We encountered an unexpected error. Don't worry, we've been notified and are working to fix it.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {errorId && (
            <Alert>
              <Bug className="h-4 w-4" />
              <AlertDescription>
                <strong>Error ID:</strong> {errorId}
                <br />
                <span className="text-sm text-gray-600">
                  Please include this ID when reporting the issue.
                </span>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={resetError} variant="default" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Button onClick={handleReload} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Reload Page
            </Button>
            <Button onClick={handleGoHome} variant="outline" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </div>

          <div className="text-center">
            <Button 
              onClick={handleReportBug} 
              variant="ghost" 
              size="sm"
              className="text-blue-600 hover:text-blue-800"
            >
              <Bug className="h-4 w-4 mr-2" />
              Report this bug
            </Button>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="border-t pt-4">
              <Button
                onClick={() => setShowErrorDetails(!showErrorDetails)}
                variant="ghost"
                size="sm"
                className="w-full"
              >
                {showErrorDetails ? 'Hide' : 'Show'} Error Details
              </Button>
              
              {showErrorDetails && (
                <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm font-mono">
                  <div className="mb-2">
                    <strong>Error:</strong> {error.message}
                  </div>
                  {error.stack && (
                    <div className="mb-2">
                      <strong>Stack Trace:</strong>
                      <pre className="whitespace-pre-wrap text-xs mt-1 text-gray-700">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                  {errorInfo?.componentStack && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap text-xs mt-1 text-gray-700">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Higher-order component for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundaryClass {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundaryClass>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Sentry-integrated error boundary
export const SentryErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children, ...props }) => (
  <SentryErrorBoundary
    fallback={({ error, resetError }) => (
      <DefaultErrorFallback
        error={error}
        errorInfo={{ componentStack: '' }}
        resetError={resetError}
        errorId={null}
        showDetails={props.showDetails}
      />
    )}
  >
    <ErrorBoundaryClass {...props}>
      {children}
    </ErrorBoundaryClass>
  </SentryErrorBoundary>
);

export default ErrorBoundaryClass;
export { DefaultErrorFallback };
export type { ErrorBoundaryProps, ErrorFallbackProps }; 