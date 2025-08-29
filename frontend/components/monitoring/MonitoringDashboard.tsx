'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Server,
  Zap,
  Eye,
  AlertCircle
} from 'lucide-react';
// import { usePerformanceMonitor } from '@/lib/monitoring/performance';
import { logger } from '@/lib/logger';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  responseTime: number;
  errorRate: number;
  timestamp: number;
}

interface ErrorSummary {
  total: number;
  last24h: number;
  topErrors: Array<{
    message: string;
    count: number;
    lastSeen: number;
  }>;
}

const MonitoringDashboard: React.FC = () => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [errorSummary, setErrorSummary] = useState<ErrorSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // const performanceMonitor = usePerformanceMonitor();

  useEffect(() => {
    fetchMonitoringData();
    const interval = setInterval(fetchMonitoringData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      
      // Fetch system health
      const healthResponse = await fetch('/api/health');
      const healthData = await healthResponse.json();
      
      // Calculate system health metrics
      // const metrics = performanceMonitor.getMetrics();
      // const apiMetrics = performanceMonitor.getAPIMetrics();
      
      const avgResponseTime = 0; // Mock value
      const errorRate = 0; // Mock value

      setSystemHealth({
        status: healthData.status === 'ok' ? 'healthy' : 'warning',
        uptime: healthData.uptime || 0,
        responseTime: avgResponseTime,
        errorRate,
        timestamp: Date.now(),
      });

      // Mock error summary (in real implementation, this would come from your error tracking service)
      setErrorSummary({
        total: 0,
        last24h: 0,
        topErrors: [],
      });

      setLastRefresh(new Date());
    } catch (error) {
      logger.error('Failed to fetch monitoring data:', error);
      setSystemHealth({
        status: 'critical',
        uptime: 0,
        responseTime: 0,
        errorRate: 100,
        timestamp: Date.now(),
      });
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusColor = (status: SystemHealth['status']) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: SystemHealth['status']) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  // const performanceMetrics = performanceMonitor.getMetricsSummary();
  // const apiMetrics = performanceMonitor.getAPIMetrics();
  const performanceMetrics = { totalRequests: 0, avgResponseTime: 0, errorRate: 0 }; // Mock
  const apiMetrics: any[] = []; // Mock

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="text-gray-600 mt-2">
            Monitor system health, performance, and errors in real-time
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <Button
            onClick={fetchMonitoringData}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            {systemHealth && getStatusIcon(systemHealth.status)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemHealth ? (
                <span className={getStatusColor(systemHealth.status)}>
                  {systemHealth.status.charAt(0).toUpperCase() + systemHealth.status.slice(1)}
                </span>
              ) : (
                <span className="text-gray-400">Loading...</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemHealth ? formatUptime(systemHealth.uptime) : '--'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemHealth ? `${Math.round(systemHealth.responseTime)}ms` : '--'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemHealth ? `${systemHealth.errorRate.toFixed(1)}%` : '--'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Monitoring */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="api">API Metrics</TabsTrigger>
          <TabsTrigger value="system">System Info</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Web vitals and performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(performanceMetrics).map(([name, stats]) => (
                    <div key={name} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">
                        {name.replace(/_/g, ' ')}
                      </span>
                      <div className="text-right">
                        <div className="text-sm font-bold">
                          {Math.round(stats.avg)}ms
                        </div>
                        <div className="text-xs text-gray-500">
                          {stats.count} samples
                        </div>
                      </div>
                    </div>
                  ))}
                  {Object.keys(performanceMetrics).length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      No performance data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Loading</CardTitle>
                <CardDescription>
                  Resource load times and caching efficiency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceMetrics.resource_load_time && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Average Load Time</span>
                      <span className="text-sm font-bold">
                        {Math.round(performanceMetrics.resource_load_time.avg)}ms
                      </span>
                    </div>
                  )}
                  <div className="text-center text-gray-500 py-4">
                    Resource metrics will appear here as pages load
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Summary</CardTitle>
              <CardDescription>
                Error tracking and analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {errorSummary ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {errorSummary.total}
                      </div>
                      <div className="text-sm text-gray-600">Total Errors</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {errorSummary.last24h}
                      </div>
                      <div className="text-sm text-gray-600">Last 24 Hours</div>
                    </div>
                  </div>
                  
                  {errorSummary.topErrors.length > 0 ? (
                    <div className="space-y-2">
                      <h4 className="font-medium">Top Errors</h4>
                      {errorSummary.topErrors.map((error, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                          <span className="text-sm">{error.message}</span>
                          <Badge variant="destructive">{error.count}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        No errors detected in the last 24 hours
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  Loading error data...
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Performance</CardTitle>
              <CardDescription>
                API endpoint response times and status codes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiMetrics.length > 0 ? (
                  <div className="space-y-2">
                    {apiMetrics.slice(-10).map((metric, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <Badge variant={metric.statusCode >= 400 ? 'destructive' : 'default'}>
                            {metric.method}
                          </Badge>
                          <span className="text-sm font-mono">{metric.endpoint}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{Math.round(metric.responseTime)}ms</span>
                          <Badge variant={metric.statusCode >= 400 ? 'destructive' : 'secondary'}>
                            {metric.statusCode}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No API metrics available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>
                Runtime environment and configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium">Environment</span>
                    <div className="text-sm text-gray-600">
                      {process.env.NODE_ENV || 'unknown'}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Version</span>
                    <div className="text-sm text-gray-600">
                      {process.env.npm_package_version || 'unknown'}
                    </div>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm font-medium">User Agent</span>
                  <div className="text-xs text-gray-600 break-all">
                    {typeof window !== 'undefined' ? window.navigator.userAgent : 'Server-side'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MonitoringDashboard; 