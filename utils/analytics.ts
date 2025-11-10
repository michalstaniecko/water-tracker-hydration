/**
 * Analytics Integration Utility
 * 
 * Provides hooks for analytics systems (Google Analytics, Firebase, etc.)
 * to track user behavior, app performance, and business metrics.
 * 
 * This is a foundation for future integration with analytics platforms.
 */

export type AnalyticsEvent = {
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, unknown>;
};

export type AnalyticsService = 'google_analytics' | 'firebase' | 'custom';

/**
 * Track an event in the analytics system
 * @param event - Event to track
 * @param service - Analytics service to use (optional)
 */
export function trackEvent(event: AnalyticsEvent, service?: AnalyticsService): void {
  // Log for debugging/monitoring
  console.log('[Analytics Event]', {
    timestamp: new Date().toISOString(),
    service: service || 'default',
    ...event,
  });

  // Future integration points:
  // if (service === 'google_analytics') {
  //   // Send to Google Analytics
  //   gtag('event', event.action, {
  //     event_category: event.category,
  //     event_label: event.label,
  //     value: event.value,
  //   });
  // }
  //
  // if (service === 'firebase') {
  //   // Send to Firebase Analytics
  //   analytics().logEvent(event.action, {
  //     category: event.category,
  //     label: event.label,
  //     value: event.value,
  //     ...event.metadata,
  //   });
  // }
}

/**
 * Track user engagement metrics
 */
export function trackEngagement(action: string, metadata?: Record<string, unknown>): void {
  trackEvent({
    category: 'engagement',
    action,
    metadata,
  });
}

/**
 * Track goal achievement
 */
export function trackGoalAchievement(goalType: string, value: number): void {
  trackEvent({
    category: 'goals',
    action: 'goal_achieved',
    label: goalType,
    value,
  });
}

/**
 * Track data export actions
 */
export function trackDataExport(format: string, success: boolean): void {
  trackEvent({
    category: 'data_export',
    action: success ? 'export_success' : 'export_failed',
    label: format,
  });
}

/**
 * Track performance metrics
 */
export type PerformanceMetric = {
  operation: string;
  duration: number;
  success: boolean;
  metadata?: Record<string, unknown>;
};

export function trackPerformance(metric: PerformanceMetric): void {
  trackEvent({
    category: 'performance',
    action: metric.operation,
    label: metric.success ? 'success' : 'failure',
    value: metric.duration,
    metadata: metric.metadata,
  });
}

/**
 * Track error occurrences for monitoring
 */
export function trackError(error: Error | string, context?: Record<string, unknown>): void {
  const errorMessage = error instanceof Error ? error.message : error;
  
  trackEvent({
    category: 'errors',
    action: 'error_occurred',
    label: errorMessage,
    metadata: {
      ...context,
      stack: error instanceof Error ? error.stack : undefined,
    },
  });
}
