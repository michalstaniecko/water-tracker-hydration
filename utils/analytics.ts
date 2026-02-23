/**
 * Analytics Integration Utility
 *
 * Provides hooks for analytics systems (Google Analytics, Firebase, etc.)
 * to track user behavior, app performance, and business metrics.
 */

import { logFirebaseEvent } from "@/services/firebaseAnalytics";

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
 * @param service - Analytics service to use (defaults to 'firebase')
 */
export function trackEvent(
  event: AnalyticsEvent,
  service: AnalyticsService = "firebase"
): void {
  if (__DEV__) {
    console.log("[Analytics Event]", {
      timestamp: new Date().toISOString(),
      service,
      ...event,
    });
  }

  if (service === "firebase") {
    logFirebaseEvent(event);
  }
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
