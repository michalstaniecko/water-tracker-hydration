/**
 * Error logging utility with structured error reporting and analytics integration
 */

import { trackError, trackPerformance } from './analytics';

type ErrorContext = {
  operation: string;
  component?: string;
  data?: Record<string, unknown>;
};

type LogLevel = 'error' | 'warn' | 'info';

/**
 * Logs an error with context information
 * @param error - The error to log
 * @param context - Additional context about the error
 */
export function logError(error: unknown, context: ErrorContext): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'error' as LogLevel,
    message: errorMessage,
    operation: context.operation,
    component: context.component,
    data: context.data,
    stack: errorStack,
  };

  // Log to console with structured format
  console.error(`[ERROR] ${context.operation}:`, {
    message: errorMessage,
    component: context.component,
    data: context.data,
    stack: errorStack,
  });

  // Track error in analytics for monitoring
  trackError(error instanceof Error ? error : new Error(errorMessage), {
    operation: context.operation,
    component: context.component,
    ...context.data,
  });

  // In production, you could send this to a logging service
  // Example: sendToLoggingService(logEntry);
}

/**
 * Logs a warning with context information
 * @param message - The warning message
 * @param context - Additional context about the warning
 */
export function logWarning(message: string, context: ErrorContext): void {
  console.warn(`[WARN] ${context.operation}:`, {
    message,
    component: context.component,
    data: context.data,
  });

  // In production, you could send this to a logging service
  // Example: sendToLoggingService({
  //   timestamp: new Date().toISOString(),
  //   level: 'warn',
  //   message,
  //   operation: context.operation,
  //   component: context.component,
  //   data: context.data,
  // });
}

/**
 * Logs informational message with context
 * @param message - The info message
 * @param context - Additional context
 */
export function logInfo(message: string, context: ErrorContext): void {
  console.info(`[INFO] ${context.operation}:`, {
    message,
    component: context.component,
    data: context.data,
  });

  // In production, you could send this to a logging service
  // Example: sendToLoggingService({
  //   timestamp: new Date().toISOString(),
  //   level: 'info',
  //   message,
  //   operation: context.operation,
  //   component: context.component,
  //   data: context.data,
  // });
}

/**
 * Wraps an async operation with error logging and performance tracking
 * @param operation - The async operation to execute
 * @param context - Context information for logging
 * @returns Result of the operation or undefined on error
 */
export async function withErrorLogging<T>(
  operation: () => Promise<T>,
  context: ErrorContext
): Promise<T | undefined> {
  const startTime = Date.now();
  try {
    const result = await operation();
    const duration = Date.now() - startTime;
    
    // Track successful operation performance
    trackPerformance({
      operation: context.operation,
      duration,
      success: true,
      metadata: {
        component: context.component,
      },
    });
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Track failed operation performance
    trackPerformance({
      operation: context.operation,
      duration,
      success: false,
      metadata: {
        component: context.component,
      },
    });
    
    logError(error, context);
    return undefined;
  }
}
