import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createBackup,
  restoreBackup,
  exportToJSON,
  exportToCSV,
  importFromJSON,
  importFromCSV,
  BackupData,
} from '@/utils/backup';
import { useWaterStore } from '@/stores/water';
import { useGamificationStore } from '@/stores/gamification';

describe('Backup Integration Tests', () => {
  beforeEach(async () => {
    // Clear AsyncStorage before each test
    await AsyncStorage.clear();
  });

  afterEach(async () => {
    // Clean up after each test
    await AsyncStorage.clear();
  });

  describe('Full backup and restore flow', () => {
    it('should create and restore a complete backup', async () => {
      // Setup initial data
      const waterData = {
        '2024-01-01': { water: '2000' },
        '2024-01-02': { water: '2500' },
      };
      const setupData = { dailyGoal: '2000', unit: 'ml' };
      const gamificationData = { streak: 5, achievements: [] };
      const onboardingData = { completed: true };

      await AsyncStorage.setItem('waterData', JSON.stringify(waterData));
      await AsyncStorage.setItem('setupData', JSON.stringify(setupData));
      await AsyncStorage.setItem('gamificationData', JSON.stringify(gamificationData));
      await AsyncStorage.setItem('onboardingData', JSON.stringify(onboardingData));

      // Create backup
      const backup = await createBackup();
      expect(backup).not.toBeNull();
      expect(backup?.waterData).toEqual(waterData);
      expect(backup?.setupData).toEqual(setupData);
      expect(backup?.gamificationData).toEqual(gamificationData);
      expect(backup?.onboardingData).toEqual(onboardingData);

      // Clear storage
      await AsyncStorage.clear();

      // Restore backup
      const restored = await restoreBackup(backup!);
      expect(restored).toBe(true);

      // Verify restored data
      const restoredWaterData = JSON.parse(await AsyncStorage.getItem('waterData') || '{}');
      const restoredSetupData = JSON.parse(await AsyncStorage.getItem('setupData') || '{}');
      
      expect(restoredWaterData).toEqual(waterData);
      expect(restoredSetupData).toEqual(setupData);
    });

    it('should handle JSON export and import', async () => {
      // Setup initial data
      const waterData = {
        '2024-01-01': { water: '2000' },
        '2024-01-02': { water: '2500' },
      };
      await AsyncStorage.setItem('waterData', JSON.stringify(waterData));

      // Export to JSON
      const jsonExport = await exportToJSON();
      expect(jsonExport).not.toBeNull();
      
      const parsedExport = JSON.parse(jsonExport!);
      expect(parsedExport.waterData).toEqual(waterData);
      expect(parsedExport.version).toBe('1.0.0');

      // Clear storage
      await AsyncStorage.clear();

      // Import from JSON
      const imported = await importFromJSON(jsonExport!);
      expect(imported).toBe(true);

      // Verify imported data
      const restoredWaterData = JSON.parse(await AsyncStorage.getItem('waterData') || '{}');
      expect(restoredWaterData).toEqual(waterData);
    });

    it('should handle CSV export and import', async () => {
      // Setup initial data
      const waterData = {
        '2024-01-01': { water: '2000' },
        '2024-01-02': { water: '2500' },
        '2024-01-03': { water: '1800' },
      };
      await AsyncStorage.setItem('waterData', JSON.stringify(waterData));

      // Export to CSV
      const csvExport = await exportToCSV();
      expect(csvExport).not.toBeNull();
      expect(csvExport).toContain('Date,Water (ml)');
      expect(csvExport).toContain('2024-01-01,2000');

      // Clear storage
      await AsyncStorage.clear();

      // Import from CSV
      const imported = await importFromCSV(csvExport!);
      expect(imported).toBe(true);

      // Verify imported data
      const restoredWaterData = JSON.parse(await AsyncStorage.getItem('waterData') || '{}');
      expect(restoredWaterData).toEqual(waterData);
    });

    it('should merge CSV data with existing data', async () => {
      // Setup initial data
      const existingData = {
        '2024-01-01': { water: '2000' },
        '2024-01-02': { water: '2500' },
      };
      await AsyncStorage.setItem('waterData', JSON.stringify(existingData));

      // Import CSV with overlapping and new data
      const csvContent = `Date,Water (ml)
2024-01-02,3000
2024-01-03,1800`;

      const imported = await importFromCSV(csvContent);
      expect(imported).toBe(true);

      // Verify merged data
      const mergedData = JSON.parse(await AsyncStorage.getItem('waterData') || '{}');
      expect(mergedData).toEqual({
        '2024-01-01': { water: '2000' },
        '2024-01-02': { water: '3000' }, // Updated
        '2024-01-03': { water: '1800' }, // New
      });
    });

    it('should reload stores and recalculate achievements after importing backup', async () => {
      // Clear stores first
      await AsyncStorage.clear();

      // Initialize water store with no data
      await useWaterStore.getState().fetchOrInitData();
      expect(useWaterStore.getState().hasHistory()).toBe(true); // Will have today with 0

      // Create a backup with water history
      const waterData = {
        '2024-01-01': { water: '2000' },
        '2024-01-02': { water: '2500' },
        '2024-01-03': { water: '1800' },
      };
      const setupData = { minimumWater: '2000' };
      const gamificationData = { achievements: [], notifications: [], lastChecked: null };

      const backup: BackupData = {
        waterData,
        setupData,
        gamificationData,
        onboardingData: null,
        exportDate: new Date().toISOString(),
        version: '1.0.0',
      };

      // Restore the backup and verify stores are reloaded
      const restored = await restoreBackup(backup);
      expect(restored).toBe(true);

      // Manually reload stores (simulating what the backup store does)
      await useWaterStore.getState().fetchOrInitData();
      await useGamificationStore.getState().fetchOrInitData();
      await useGamificationStore.getState().checkAndUnlockAchievements();

      // Verify water data was loaded
      const history = useWaterStore.getState().history;
      expect(history).not.toBeNull();
      expect(history?.['2024-01-01']?.water).toBe('2000');
      expect(history?.['2024-01-02']?.water).toBe('2500');

      // Verify gamification achievements were recalculated
      const achievements = useGamificationStore.getState().achievements;
      const firstGlassAchievement = achievements.find(a => a.id === 'first_glass');
      
      // The first_glass achievement should be unlocked since we have water history
      expect(firstGlassAchievement).toBeDefined();
      expect(firstGlassAchievement?.isUnlocked).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should handle invalid backup data gracefully', async () => {
      const invalidBackup = { invalid: 'data' } as unknown as BackupData;
      const result = await restoreBackup(invalidBackup);
      expect(result).toBe(false);
    });

    it('should handle invalid JSON import', async () => {
      const result = await importFromJSON('invalid json');
      expect(result).toBe(false);
    });

    it('should handle empty CSV import', async () => {
      const result = await importFromCSV('');
      expect(result).toBe(false);
    });
  });
});
