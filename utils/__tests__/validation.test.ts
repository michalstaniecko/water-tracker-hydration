import {
  isNonNegativeNumber,
  isPositiveNumber,
  isValidTimeFormat,
  isNonEmptyString,
  sanitizeNonNegativeNumber,
  sanitizePositiveNumber,
} from '../validation';

describe('Validation Utils', () => {
  describe('isNonNegativeNumber', () => {
    it('should return true for valid non-negative numbers', () => {
      expect(isNonNegativeNumber(0)).toBe(true);
      expect(isNonNegativeNumber(5)).toBe(true);
      expect(isNonNegativeNumber(100.5)).toBe(true);
      expect(isNonNegativeNumber('0')).toBe(true);
      expect(isNonNegativeNumber('42.5')).toBe(true);
    });

    it('should return false for negative numbers', () => {
      expect(isNonNegativeNumber(-1)).toBe(false);
      expect(isNonNegativeNumber(-100.5)).toBe(false);
      expect(isNonNegativeNumber('-5')).toBe(false);
    });

    it('should return false for invalid values', () => {
      expect(isNonNegativeNumber('abc')).toBe(false);
      expect(isNonNegativeNumber('')).toBe(false);
      expect(isNonNegativeNumber(NaN)).toBe(false);
    });
  });

  describe('isPositiveNumber', () => {
    it('should return true for valid positive numbers', () => {
      expect(isPositiveNumber(1)).toBe(true);
      expect(isPositiveNumber(5.5)).toBe(true);
      expect(isPositiveNumber('10')).toBe(true);
      expect(isPositiveNumber('42.5')).toBe(true);
    });

    it('should return false for zero and negative numbers', () => {
      expect(isPositiveNumber(0)).toBe(false);
      expect(isPositiveNumber(-1)).toBe(false);
      expect(isPositiveNumber('-5')).toBe(false);
      expect(isPositiveNumber('0')).toBe(false);
    });

    it('should return false for invalid values', () => {
      expect(isPositiveNumber('abc')).toBe(false);
      expect(isPositiveNumber('')).toBe(false);
      expect(isPositiveNumber(NaN)).toBe(false);
    });
  });

  describe('isValidTimeFormat', () => {
    it('should return true for valid time formats', () => {
      expect(isValidTimeFormat('00:00')).toBe(true);
      expect(isValidTimeFormat('09:30')).toBe(true);
      expect(isValidTimeFormat('12:45')).toBe(true);
      expect(isValidTimeFormat('23:59')).toBe(true);
      expect(isValidTimeFormat('8:00')).toBe(true);
      expect(isValidTimeFormat('9:05')).toBe(true);
    });

    it('should return false for invalid time formats', () => {
      expect(isValidTimeFormat('24:00')).toBe(false);
      expect(isValidTimeFormat('12:60')).toBe(false);
      expect(isValidTimeFormat('abc')).toBe(false);
      expect(isValidTimeFormat('12')).toBe(false);
      expect(isValidTimeFormat('12:5')).toBe(false);
      expect(isValidTimeFormat('')).toBe(false);
    });
  });

  describe('isNonEmptyString', () => {
    it('should return true for non-empty strings', () => {
      expect(isNonEmptyString('hello')).toBe(true);
      expect(isNonEmptyString('test string')).toBe(true);
      expect(isNonEmptyString('  text  ')).toBe(true);
    });

    it('should return false for empty or invalid values', () => {
      expect(isNonEmptyString('')).toBe(false);
      expect(isNonEmptyString('   ')).toBe(false);
      expect(isNonEmptyString(null)).toBe(false);
      expect(isNonEmptyString(undefined)).toBe(false);
      expect(isNonEmptyString(123)).toBe(false);
      expect(isNonEmptyString({})).toBe(false);
    });
  });

  describe('sanitizeNonNegativeNumber', () => {
    it('should return sanitized string for valid non-negative numbers', () => {
      expect(sanitizeNonNegativeNumber(0)).toBe('0');
      expect(sanitizeNonNegativeNumber(5)).toBe('5');
      expect(sanitizeNonNegativeNumber(100.5)).toBe('100.5');
      expect(sanitizeNonNegativeNumber('42')).toBe('42');
    });

    it('should return default value for invalid numbers', () => {
      expect(sanitizeNonNegativeNumber(-1)).toBe('0');
      expect(sanitizeNonNegativeNumber('abc')).toBe('0');
      expect(sanitizeNonNegativeNumber(-10, '5')).toBe('5');
    });

    it('should handle custom default values', () => {
      expect(sanitizeNonNegativeNumber('invalid', '100')).toBe('100');
      expect(sanitizeNonNegativeNumber(-5, '50')).toBe('50');
    });
  });

  describe('sanitizePositiveNumber', () => {
    it('should return sanitized string for valid positive numbers', () => {
      expect(sanitizePositiveNumber(1)).toBe('1');
      expect(sanitizePositiveNumber(5.5)).toBe('5.5');
      expect(sanitizePositiveNumber('42')).toBe('42');
    });

    it('should return default value for invalid numbers', () => {
      expect(sanitizePositiveNumber(0)).toBe('1');
      expect(sanitizePositiveNumber(-1)).toBe('1');
      expect(sanitizePositiveNumber('abc')).toBe('1');
      expect(sanitizePositiveNumber(0, '10')).toBe('10');
    });

    it('should handle custom default values', () => {
      expect(sanitizePositiveNumber('invalid', '100')).toBe('100');
      expect(sanitizePositiveNumber(-5, '50')).toBe('50');
    });
  });
});
