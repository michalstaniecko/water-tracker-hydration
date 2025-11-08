import { roundToTen, roundBy } from '../numbers';

describe('Numbers Utils', () => {
  describe('roundToTen', () => {
    it('should round numbers to nearest ten', () => {
      expect(roundToTen(0)).toBe(0);
      expect(roundToTen(5)).toBe(10);
      expect(roundToTen(14)).toBe(10);
      expect(roundToTen(15)).toBe(20);
      expect(roundToTen(25)).toBe(30);
      expect(roundToTen(44)).toBe(40);
      expect(roundToTen(45)).toBe(50);
      expect(roundToTen(95)).toBe(100);
    });

    it('should handle negative numbers', () => {
      expect(roundToTen(-5)).toBe(-0); // -5 / 10 = -0.5, rounds to -0
      expect(roundToTen(-14)).toBe(-10);
      expect(roundToTen(-15)).toBe(-10); // -15 / 10 = -1.5, rounds to -1, * 10 = -10
      expect(roundToTen(-16)).toBe(-20);
      expect(roundToTen(-6)).toBe(-10);
    });

    it('should handle already rounded numbers', () => {
      expect(roundToTen(10)).toBe(10);
      expect(roundToTen(20)).toBe(20);
      expect(roundToTen(100)).toBe(100);
    });
  });

  describe('roundBy', () => {
    it('should round numbers by specified value', () => {
      expect(roundBy(12, 5)).toBe(10);
      expect(roundBy(13, 5)).toBe(15);
      expect(roundBy(17, 5)).toBe(15);
      expect(roundBy(18, 5)).toBe(20);
    });

    it('should round by 10', () => {
      expect(roundBy(14, 10)).toBe(10);
      expect(roundBy(15, 10)).toBe(20);
      expect(roundBy(24, 10)).toBe(20);
      expect(roundBy(25, 10)).toBe(30);
    });

    it('should round by 20', () => {
      expect(roundBy(19, 20)).toBe(20);
      expect(roundBy(29, 20)).toBe(20);
      expect(roundBy(30, 20)).toBe(40);
    });

    it('should handle edge cases', () => {
      expect(roundBy(0, 5)).toBe(0);
      expect(roundBy(1, 5)).toBe(0);
      expect(roundBy(2, 5)).toBe(0);
      expect(roundBy(3, 5)).toBe(5);
    });

    it('should handle decimal numbers by rounding first', () => {
      expect(roundBy(12.4, 5)).toBe(10);
      expect(roundBy(12.6, 5)).toBe(15);
      expect(roundBy(17.4, 5)).toBe(15);
      expect(roundBy(17.6, 5)).toBe(20);
    });
  });
});
