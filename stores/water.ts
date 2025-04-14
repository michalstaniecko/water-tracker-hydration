import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getToday } from "@/utils/date";

type Water = {
  amount: string;
};

type WaterStore = {
  history: {
    [date: string]: {
      water: string;
    };
  } | null;
  fetchOrInitData: () => Promise<void>;
  resetWater: () => void;
  resetTodayWater: () => void;
  setWater: (date: string, amount: string) => void;
  setTodayWater: (amount: string) => void;
  getWater: (date: string) => string;
  getTodayWater: () => string;
  hasHistory: () => boolean;
};

const storageKey = "waterData";

export const useWaterStore = create<WaterStore>((set, get) => ({
  history: null,
  fetchOrInitData: async () => {
    try {
      const data = await AsyncStorage.getItem(storageKey);
      if (data !== null) {
        const parsedData = JSON.parse(data);
        set({ history: parsedData });
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
      console.error("Error initializing water data:", error);
    }
  },
  setWater: (date: string, amount: string) => {
    try {
      const history = get().history || {};
      history[date] = { water: amount };
      set({ history });
      AsyncStorage.setItem(storageKey, JSON.stringify(history));
    } catch (error) {
      console.error("Error setting water data:", error);
    }
  },
  setTodayWater: (amount: string) => {
    const today = getToday();
    get().setWater(today, amount);
  },
  updateStorage: async () => {
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(get().history));
    } catch (error) {
      console.error("Error updating water data:", error);
    }
  },
  resetWater: () => {
    set({ history: null });
  },
  resetTodayWater: () => {
    const today = getToday();
    try {
    } catch (error) {
      console.error("Error resetting water data:", error);
    }
    get().setTodayWater("0");
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
}));
