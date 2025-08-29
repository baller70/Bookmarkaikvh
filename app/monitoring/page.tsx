import { Metadata } from 'next';
import dynamic from 'next/dynamic';

// Use the simple monitoring dashboard to avoid import issues
const SimpleMonitoringDashboard = dynamic(
  () => import('@/components/monitoring/SimpleMonitoringDashboard'),
  { 
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-64">Loading monitoring dashboard...</div>
  }
);

export const metadata: Metadata = {
  title: 'System Monitoring | BookAIMark',
  description: 'Monitor system health, performance metrics, and error tracking in real-time.',
};

export default function MonitoringPage() {
  return (
    <div className="container mx-auto p-6">
      <SimpleMonitoringDashboard />
    </div>
  );
} 