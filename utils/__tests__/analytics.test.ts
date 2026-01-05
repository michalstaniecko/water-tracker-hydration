/**
 * Analytics Utility Tests
 */

import {
  trackEvent,
  trackEngagement,
  trackGoalAchievement,
  trackDataExport,
  trackPerformance,
  trackError,
} from '../analytics';

// Mock console.log to capture analytics events
let consoleLogs: any[] = [];

beforeEach(() => {
  consoleLogs = [];
  jest.spyOn(console, 'log').mockImplementation((...args) => {
    consoleLogs.push(args);
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Analytics Utility', () => {
  describe('trackEvent', () => {
    it('should log an event with all properties', () => {
      trackEvent({
        category: 'test',
        action: 'test_action',
        label: 'test_label',
        value: 100,
        metadata: { key: 'value' },
      });

      expect(consoleLogs.length).toBe(1);
      expect(consoleLogs[0][0]).toBe('[Analytics Event]');
      expect(consoleLogs[0][1]).toMatchObject({
        service: 'default',
        category: 'test',
        action: 'test_action',
        label: 'test_label',
        value: 100,
        metadata: { key: 'value' },
      });
    });

    it('should log an event without optional properties', () => {
      trackEvent({
        category: 'test',
        action: 'test_action',
      });

      expect(consoleLogs.length).toBe(1);
      expect(consoleLogs[0][1]).toMatchObject({
        category: 'test',
        action: 'test_action',
      });
    });

    it('should include timestamp in event', () => {
      trackEvent({
        category: 'test',
        action: 'test_action',
      });

      expect(consoleLogs[0][1]).toHaveProperty('timestamp');
      expect(typeof consoleLogs[0][1].timestamp).toBe('string');
    });
  });

  describe('trackEngagement', () => {
    it('should track engagement with metadata', () => {
      trackEngagement('button_click', { button: 'export' });

      expect(consoleLogs.length).toBe(1);
      expect(consoleLogs[0][1]).toMatchObject({
        category: 'engagement',
        action: 'button_click',
        metadata: { button: 'export' },
      });
    });

    it('should track engagement without metadata', () => {
      trackEngagement('page_view');

      expect(consoleLogs.length).toBe(1);
      expect(consoleLogs[0][1]).toMatchObject({
        category: 'engagement',
        action: 'page_view',
      });
    });
  });

  describe('trackGoalAchievement', () => {
    it('should track goal achievement', () => {
      trackGoalAchievement('daily_goal', 2000);

      expect(consoleLogs.length).toBe(1);
      expect(consoleLogs[0][1]).toMatchObject({
        category: 'goals',
        action: 'goal_achieved',
        label: 'daily_goal',
        value: 2000,
      });
    });
  });

  describe('trackDataExport', () => {
    it('should track successful export', () => {
      trackDataExport('pdf', true);

      expect(consoleLogs.length).toBe(1);
      expect(consoleLogs[0][1]).toMatchObject({
        category: 'data_export',
        action: 'export_success',
        label: 'pdf',
      });
    });

    it('should track failed export', () => {
      trackDataExport('csv', false);

      expect(consoleLogs.length).toBe(1);
      expect(consoleLogs[0][1]).toMatchObject({
        category: 'data_export',
        action: 'export_failed',
        label: 'csv',
      });
    });
  });

  describe('trackPerformance', () => {
    it('should track successful performance metric', () => {
      trackPerformance({
        operation: 'data_load',
        duration: 150,
        success: true,
        metadata: { recordCount: 100 },
      });

      expect(consoleLogs.length).toBe(1);
      expect(consoleLogs[0][1]).toMatchObject({
        category: 'performance',
        action: 'data_load',
        label: 'success',
        value: 150,
        metadata: { recordCount: 100 },
      });
    });

    it('should track failed performance metric', () => {
      trackPerformance({
        operation: 'api_call',
        duration: 5000,
        success: false,
      });

      expect(consoleLogs.length).toBe(1);
      expect(consoleLogs[0][1]).toMatchObject({
        category: 'performance',
        action: 'api_call',
        label: 'failure',
        value: 5000,
      });
    });
  });

  describe('trackError', () => {
    it('should track error with Error object', () => {
      const error = new Error('Test error');
      trackError(error, { component: 'TestComponent' });

      expect(consoleLogs.length).toBe(1);
      expect(consoleLogs[0][1]).toMatchObject({
        category: 'errors',
        action: 'error_occurred',
        label: 'Test error',
      });
      expect(consoleLogs[0][1].metadata).toHaveProperty('stack');
      expect(consoleLogs[0][1].metadata.component).toBe('TestComponent');
    });

    it('should track error with string message', () => {
      trackError('Simple error message', { operation: 'test_op' });

      expect(consoleLogs.length).toBe(1);
      expect(consoleLogs[0][1]).toMatchObject({
        category: 'errors',
        action: 'error_occurred',
        label: 'Simple error message',
        metadata: { operation: 'test_op' },
      });
    });

    it('should track error without context', () => {
      trackError('Error without context');

      expect(consoleLogs.length).toBe(1);
      expect(consoleLogs[0][1]).toMatchObject({
        category: 'errors',
        action: 'error_occurred',
        label: 'Error without context',
      });
    });
  });
});
