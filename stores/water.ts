import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getToday } from "@/utils/date";
import { sanitizeNonNegativeNumber, isNonNegativeNumber } from "@/utils/validation";
import { logError, logWarning } from "@/utils/errorLogging";

type Water = {
  amount: string;
};

export type HistoryRows = {
  [date: string]: {
    water: string;
  };
} | null;

type WaterStore = {
  history: HistoryRows;
  fetchOrInitData: () => Promise<void>;
  resetWater: () => Promise<void>;
  resetTodayWater: () => Promise<void>;
  setWater: (date: string, amount: string) => Promise<void>;
  setTodayWater: (amount: string) => Promise<void>;
  getWater: (date: string) => string;
  getTodayWater: () => string;
  hasHistory: () => boolean;
  getSortedHistory: () => {
    water: string;
    date: string;
  }[];
  updateStorage: () => Promise<void>;
};

const storageKey = "waterData";

export const useWaterStore = create<WaterStore>((set, get) => ({
  history: null,
  fetchOrInitData: async () => {
    try {
      const data = await AsyncStorage.getItem(storageKey);
      if (data !== null) {
        const parsedData = JSON.parse(data);
        
        // Validate parsed data structure
        if (typeof parsedData === 'object' && parsedData !== null) {
          // Sanitize all water values to ensure they're non-negative
          const sanitizedHistory: HistoryRows = {};
          Object.keys(parsedData).forEach((date) => {
            if (parsedData[date]?.water !== undefined) {
              sanitizedHistory[date] = {
                water: sanitizeNonNegativeNumber(parsedData[date].water),
              };
            }
          });
          set({ history: sanitizedHistory });
        } else {
          logWarning('Invalid data structure in storage, reinitializing', {
            operation: 'fetchOrInitData',
            component: 'WaterStore',
          });
          throw new Error('Invalid data structure');
        }
      } else {
        const today = getToday();
        const history = {
          [today]: {
            water: "0",
          },
        };
        await AsyncStorage.setItem(storageKey, JSON.stringify(history));
        set({ history });
      }
    } catch (error) {
      logError(error, {
        operation: 'fetchOrInitData',
        component: 'WaterStore',
      });
      
      // Initialize with default data on error
      const today = getToday();
      const history = {
        [today]: {
          water: "0",
        },
      };
      set({ history });
      
      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify(history));
      } catch (storageError) {
        logError(storageError, {
          operation: 'fetchOrInitData - recovery',
          component: 'WaterStore',
        });
      }
    }
  },
  setWater: async (date: string, amount: string) => {
    try {
      // Validate input
      if (!isNonNegativeNumber(amount)) {
        logWarning('Attempted to set negative water amount', {
          operation: 'setWater',
          component: 'WaterStore',
          data: { date, amount },
        });
        return;
      }
      
      const sanitizedAmount = sanitizeNonNegativeNumber(amount);
      const history = get().history || {};
      history[date] = { water: sanitizedAmount };
      set({ history });
      
      await AsyncStorage.setItem(storageKey, JSON.stringify(history));
    } catch (error) {
      logError(error, {
        operation: 'setWater',
        component: 'WaterStore',
        data: { date, amount },
      });
    }
  },
  setTodayWater: async (amount: string) => {
    const today = getToday();
    await get().setWater(today, amount);
  },
  updateStorage: async () => {
    try {
      const history = get().history;
      if (history) {
        await AsyncStorage.setItem(storageKey, JSON.stringify(history));
      }
    } catch (error) {
      logError(error, {
        operation: 'updateStorage',
        component: 'WaterStore',
      });
    }
  },
  resetWater: async () => {
    try {
      set({ history: {} });
      await AsyncStorage.removeItem(storageKey);
    } catch (error) {
      logError(error, {
        operation: 'resetWater',
        component: 'WaterStore',
      });
    }
  },
  resetTodayWater: async () => {
    const today = getToday();
    await get().setTodayWater("0");
  },
  getWater: (date) => {
    return get().history?.[date]?.water || "0";
  },
  getTodayWater: () => {
    return get().getWater(getToday());
  },
  hasHistory: () => {
    const history = get().history;
    if (history && Object.keys(history).length > 0) {
      return true;
    }
    return false;
  },
  getSortedHistory: () => {
    const history = get().history;
    if (!history) return [];
    return Object.keys(history)
      .reverse()
      .map((date) => ({
        water: history[date].water,
        date: date,
      }));
  },
}));
