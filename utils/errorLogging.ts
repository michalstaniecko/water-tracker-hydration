/**
 * Error logging utility with structured error reporting
 */

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
 * Wraps an async operation with error logging
 * @param operation - The async operation to execute
 * @param context - Context information for logging
 * @returns Result of the operation or undefined on error
 */
export async function withErrorLogging<T>(
  operation: () => Promise<T>,
  context: ErrorContext
): Promise<T | undefined> {
  try {
    return await operation();
  } catch (error) {
    logError(error, context);
    return undefined;
  }
}
