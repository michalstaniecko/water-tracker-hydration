/**
 * Validation utilities for input data
 */

/**
 * Validates if a number is non-negative
 * @param value - The value to validate
 * @returns true if valid, false otherwise
 */
export function isNonNegativeNumber(value: string | number): boolean {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && num >= 0;
}

/**
 * Validates if a string represents a valid positive number
 * @param value - The value to validate
 * @returns true if valid, false otherwise
 */
export function isPositiveNumber(value: string | number): boolean {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && num > 0;
}

/**
 * Validates if a string is in valid time format (HH:mm or H:mm)
 * @param value - The time string to validate
 * @returns true if valid, false otherwise
 */
export function isValidTimeFormat(value: string): boolean {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(value);
}

/**
 * Validates if a value is a valid string with content
 * @param value - The value to validate
 * @returns true if valid, false otherwise
 */
export function isNonEmptyString(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Sanitizes a number value to ensure it's non-negative
 * @param value - The value to sanitize
 * @param defaultValue - The default value if sanitization fails
 * @returns sanitized number as string
 */
export function sanitizeNonNegativeNumber(
  value: string | number,
  defaultValue: string = '0'
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num) || num < 0) {
    return defaultValue;
  }
  return num.toString();
}

/**
 * Sanitizes a positive number value
 * @param value - The value to sanitize
 * @param defaultValue - The default value if sanitization fails
 * @returns sanitized number as string
 */
export function sanitizePositiveNumber(
  value: string | number,
  defaultValue: string = '1'
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num) || num <= 0) {
    return defaultValue;
  }
  return num.toString();
}
