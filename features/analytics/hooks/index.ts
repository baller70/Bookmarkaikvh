// Analytics hooks
export const useAnalytics = () => {
  return {
    track: (event: string, properties?: Record<string, any>) => {
      console.log('Analytics event:', event, properties);
    }
  };
}; 