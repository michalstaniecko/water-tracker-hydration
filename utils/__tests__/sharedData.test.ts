import { Platform } from 'react-native';
import type { WidgetData } from '../sharedData';

jest.mock('../errorLogging', () => ({
  logError: jest.fn(),
  logWarning: jest.fn(),
}));

// Import the mocked error logging functions for assertions
const { logError, logWarning } = jest.requireMock('../errorLogging');

const mockWidgetData: WidgetData = {
  todayWater: 1500,
  dailyGoal: 2000,
  percentage: 75,
  streak: 3,
  glassCapacity: 250,
  lastUpdated: '2026-01-28T12:00:00.000Z',
  dateKey: '2026-01-28',
};

// Helper to load sharedData with a custom HydrationWidget mock
function loadWithMock(mockModule: any) {
  let result: typeof import('../sharedData');
  jest.isolateModules(() => {
    jest.doMock('expo', () => ({
      requireOptionalNativeModule: (name: string) => {
        if (name === 'HydrationWidget') return mockModule;
        return null;
      },
    }));
    result = require('../sharedData');
  });
  return result!;
}

describe('sharedData', () => {
  let mockUpdateWidgetData: jest.Mock;
  let mockReadWidgetData: jest.Mock;
  let mockReloadWidget: jest.Mock;
  let mockRefreshWidgetNative: jest.Mock;
  let writeWidgetData: typeof import('../sharedData').writeWidgetData;
  let readWidgetData: typeof import('../sharedData').readWidgetData;
  let refreshWidget: typeof import('../sharedData').refreshWidget;
  let SHARED_PREFS_NAME: string;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateWidgetData = jest.fn().mockResolvedValue(undefined);
    mockReadWidgetData = jest.fn();
    mockReloadWidget = jest.fn().mockResolvedValue(undefined);
    mockRefreshWidgetNative = jest.fn().mockResolvedValue(undefined);

    const mod = loadWithMock({
      updateWidgetData: mockUpdateWidgetData,
      readWidgetData: mockReadWidgetData,
      reloadWidget: mockReloadWidget,
      refreshWidget: mockRefreshWidgetNative,
    });
    writeWidgetData = mod.writeWidgetData;
    readWidgetData = mod.readWidgetData;
    refreshWidget = mod.refreshWidget;
    SHARED_PREFS_NAME = mod.SHARED_PREFS_NAME;
  });

  describe('writeWidgetData', () => {
    it('should call updateWidgetData with data object on iOS', async () => {
      Platform.OS = 'ios';
      await writeWidgetData(mockWidgetData);

      expect(mockUpdateWidgetData).toHaveBeenCalledWith({
        todayWater: 1500,
        dailyGoal: 2000,
        percentage: 75,
        streak: 3,
        glassCapacity: 250,
        lastUpdated: '2026-01-28T12:00:00.000Z',
        dateKey: '2026-01-28',
      });
    });

    it('should call updateWidgetData with SHARED_PREFS_NAME and JSON string on Android', async () => {
      Platform.OS = 'android';
      await writeWidgetData(mockWidgetData);

      expect(mockUpdateWidgetData).toHaveBeenCalledWith(
        SHARED_PREFS_NAME,
        JSON.stringify(mockWidgetData)
      );
    });

    it('should return true on success (iOS)', async () => {
      Platform.OS = 'ios';
      const result = await writeWidgetData(mockWidgetData);
      expect(result).toBe(true);
    });

    it('should return true on success (Android)', async () => {
      Platform.OS = 'android';
      const result = await writeWidgetData(mockWidgetData);
      expect(result).toBe(true);
    });

    it('should return false when native module is not available', async () => {
      const mod = loadWithMock(null);
      const result = await mod.writeWidgetData(mockWidgetData);
      expect(result).toBe(false);
    });

    it('should log warning when native module is not available', async () => {
      const mod = loadWithMock(null);
      await mod.writeWidgetData(mockWidgetData);

      expect(logWarning).toHaveBeenCalledWith(
        'HydrationWidget native module not available',
        expect.objectContaining({
          operation: 'writeWidgetData',
          component: 'SharedData',
        })
      );
    });

    it('should return false and log error when native call throws', async () => {
      Platform.OS = 'ios';
      const error = new Error('Native call failed');
      mockUpdateWidgetData.mockRejectedValue(error);

      const result = await writeWidgetData(mockWidgetData);

      expect(result).toBe(false);
      expect(logError).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          operation: 'writeWidgetData',
          component: 'SharedData',
        })
      );
    });
  });

  describe('readWidgetData', () => {
    it('should return WidgetData from native module on iOS', async () => {
      Platform.OS = 'ios';
      const nativeData = {
        todayWater: 1500,
        dailyGoal: 2000,
        percentage: 75,
        streak: 3,
        glassCapacity: 250,
        lastUpdated: '2026-01-28T12:00:00.000Z',
        dateKey: '2026-01-28',
      };
      mockReadWidgetData.mockResolvedValue(nativeData);

      const result = await readWidgetData();

      expect(result).toEqual(nativeData);
    });

    it('should return null when native module returns null on iOS', async () => {
      Platform.OS = 'ios';
      mockReadWidgetData.mockResolvedValue(null);

      const result = await readWidgetData();
      expect(result).toBeNull();
    });

    it('should set default values for missing fields on iOS', async () => {
      Platform.OS = 'ios';
      mockReadWidgetData.mockResolvedValue({});

      const result = await readWidgetData();

      expect(result).toEqual(
        expect.objectContaining({
          todayWater: 0,
          dailyGoal: 2000,
          percentage: 0,
          streak: 0,
          glassCapacity: 250,
          dateKey: '',
        })
      );
      expect(result?.lastUpdated).toBeDefined();
    });

    it('should parse JSON string and return WidgetData on Android', async () => {
      Platform.OS = 'android';
      mockReadWidgetData.mockResolvedValue(JSON.stringify(mockWidgetData));

      const result = await readWidgetData();
      expect(result).toEqual(mockWidgetData);
    });

    it('should set default values for missing fields on Android', async () => {
      Platform.OS = 'android';
      mockReadWidgetData.mockResolvedValue(JSON.stringify({ todayWater: 500 }));

      const result = await readWidgetData();

      expect(result).toEqual(
        expect.objectContaining({
          todayWater: 500,
          dailyGoal: 2000,
          percentage: 0,
          streak: 0,
          glassCapacity: 250,
          dateKey: '',
        })
      );
      expect(result?.lastUpdated).toBeDefined();
    });

    it('should return null when Android SharedPreferences has invalid JSON', async () => {
      Platform.OS = 'android';
      mockReadWidgetData.mockResolvedValue('not valid json{{{');

      const result = await readWidgetData();

      expect(result).toBeNull();
      expect(logError).toHaveBeenCalledWith(
        expect.any(SyntaxError),
        expect.objectContaining({
          operation: 'readWidgetData',
          component: 'SharedData',
        })
      );
    });

    it('should return null when no data in SharedPreferences on Android', async () => {
      Platform.OS = 'android';
      mockReadWidgetData.mockResolvedValue(null);

      const result = await readWidgetData();
      expect(result).toBeNull();
    });

    it('should return null when native module is not available', async () => {
      const mod = loadWithMock(null);
      const result = await mod.readWidgetData();
      expect(result).toBeNull();
    });

    it('should log warning when native module is not available', async () => {
      const mod = loadWithMock(null);
      await mod.readWidgetData();

      expect(logWarning).toHaveBeenCalledWith(
        'HydrationWidget native module not available',
        expect.objectContaining({
          operation: 'readWidgetData',
          component: 'SharedData',
        })
      );
    });

    it('should return null and log error when native call throws', async () => {
      Platform.OS = 'ios';
      const error = new Error('Read failed');
      mockReadWidgetData.mockRejectedValue(error);

      const result = await readWidgetData();

      expect(result).toBeNull();
      expect(logError).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          operation: 'readWidgetData',
          component: 'SharedData',
        })
      );
    });
  });

  describe('refreshWidget', () => {
    it('should call reloadWidget on iOS', async () => {
      Platform.OS = 'ios';
      await refreshWidget();
      expect(mockReloadWidget).toHaveBeenCalled();
    });

    it('should call refreshWidget on Android', async () => {
      Platform.OS = 'android';
      await refreshWidget();
      expect(mockRefreshWidgetNative).toHaveBeenCalled();
    });

    it('should return true on success', async () => {
      Platform.OS = 'ios';
      const result = await refreshWidget();
      expect(result).toBe(true);
    });

    it('should return false when native module is not available', async () => {
      const mod = loadWithMock(null);
      const result = await mod.refreshWidget();
      expect(result).toBe(false);
    });

    it('should log warning when native module is not available', async () => {
      const mod = loadWithMock(null);
      await mod.refreshWidget();

      expect(logWarning).toHaveBeenCalledWith(
        'HydrationWidget native module not available',
        expect.objectContaining({
          operation: 'refreshWidget',
          component: 'SharedData',
        })
      );
    });

    it('should return false and log error when native call throws', async () => {
      Platform.OS = 'ios';
      const error = new Error('Refresh failed');
      mockReloadWidget.mockRejectedValue(error);

      const result = await refreshWidget();

      expect(result).toBe(false);
      expect(logError).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          operation: 'refreshWidget',
          component: 'SharedData',
        })
      );
    });
  });
});
