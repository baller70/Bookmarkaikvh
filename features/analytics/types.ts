// Analytics types
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
}

export interface AnalyticsData {
  events: AnalyticsEvent[];
  timestamp: Date;
} 