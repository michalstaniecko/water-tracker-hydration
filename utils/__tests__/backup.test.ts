import {
  waterHistoryToCSV,
  parseCSVToWaterHistory,
  WaterHistoryData,
} from '../backup';

describe('Backup Utils', () => {
  describe('waterHistoryToCSV', () => {
    it('should convert water history to CSV format', () => {
      const waterData = {
        '2024-01-01': { water: '2000' },
        '2024-01-02': { water: '2500' },
        '2024-01-03': { water: '1800' },
      };

      const csv = waterHistoryToCSV(waterData);
      
      expect(csv).toContain('Date,Water (ml)');
      expect(csv).toContain('2024-01-01,2000');
      expect(csv).toContain('2024-01-02,2500');
      expect(csv).toContain('2024-01-03,1800');
    });

    it('should handle empty water data', () => {
      const csv = waterHistoryToCSV({});
      expect(csv).toBe('Date,Water (ml)\n');
    });

    it('should handle null water data', () => {
      const csv = waterHistoryToCSV(null as any);
      expect(csv).toBe('Date,Water (ml)\n');
    });

    it('should handle missing water values', () => {
      const waterData = {
        '2024-01-01': { water: '2000' },
        '2024-01-02': {} as any,
      };

      const csv = waterHistoryToCSV(waterData);
      
      expect(csv).toContain('2024-01-01,2000');
      expect(csv).toContain('2024-01-02,0');
    });
  });

  describe('parseCSVToWaterHistory', () => {
    it('should parse valid CSV to water history', () => {
      const csvContent = `Date,Water (ml)
2024-01-01,2000
2024-01-02,2500
2024-01-03,1800`;

      const result = parseCSVToWaterHistory(csvContent);
      
      expect(result).toEqual({
        '2024-01-01': { water: '2000' },
        '2024-01-02': { water: '2500' },
        '2024-01-03': { water: '1800' },
      });
    });

    it('should handle CSV with spaces', () => {
      const csvContent = `Date,Water (ml)
2024-01-01, 2000
2024-01-02 , 2500 `;

      const result = parseCSVToWaterHistory(csvContent);
      
      expect(result['2024-01-01']).toEqual({ water: '2000' });
      expect(result['2024-01-02']).toEqual({ water: '2500' });
    });

    it('should skip invalid date formats', () => {
      const csvContent = `Date,Water (ml)
2024-01-01,2000
invalid-date,1500
2024-01-03,1800`;

      const result = parseCSVToWaterHistory(csvContent);
      
      expect(result).toEqual({
        '2024-01-01': { water: '2000' },
        '2024-01-03': { water: '1800' },
      });
      expect(result['invalid-date']).toBeUndefined();
    });

    it('should sanitize negative water amounts', () => {
      const csvContent = `Date,Water (ml)
2024-01-01,-500
2024-01-02,2000`;

      const result = parseCSVToWaterHistory(csvContent);
      
      expect(result['2024-01-01']).toEqual({ water: '0' });
      expect(result['2024-01-02']).toEqual({ water: '2000' });
    });

    it('should sanitize invalid water amounts', () => {
      const csvContent = `Date,Water (ml)
2024-01-01,abc
2024-01-02,2000`;

      const result = parseCSVToWaterHistory(csvContent);
      
      expect(result['2024-01-01']).toEqual({ water: '0' });
      expect(result['2024-01-02']).toEqual({ water: '2000' });
    });

    it('should handle empty CSV', () => {
      const result = parseCSVToWaterHistory('');
      expect(result).toEqual({});
    });

    it('should handle CSV with only header', () => {
      const csvContent = 'Date,Water (ml)';
      const result = parseCSVToWaterHistory(csvContent);
      expect(result).toEqual({});
    });

    it('should skip lines with missing data', () => {
      const csvContent = `Date,Water (ml)
2024-01-01,2000
2024-01-02,
,1500
2024-01-03,1800`;

      const result = parseCSVToWaterHistory(csvContent);
      
      expect(result).toEqual({
        '2024-01-01': { water: '2000' },
        '2024-01-03': { water: '1800' },
      });
    });
  });

  describe('CSV round-trip', () => {
    it('should maintain data integrity in round-trip conversion', () => {
      const originalData = {
        '2024-01-01': { water: '2000' },
        '2024-01-02': { water: '2500' },
        '2024-01-03': { water: '1800' },
      };

      const csv = waterHistoryToCSV(originalData);
      const parsedData = parseCSVToWaterHistory(csv);

      expect(parsedData).toEqual(originalData);
    });
  });
});
