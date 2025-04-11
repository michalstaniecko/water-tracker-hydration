import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

type WaterStore = {
  water: number;
  fetchData: () => Promise<void>;
  addWater: (amount: number) => void;
  removeWater: (amount: number) => void;
  resetWater: () => void;
};

export const useWaterStore = create<WaterStore>((set) => ({
  water: 0,
  fetchData: async () => {
    const today = new Date().toLocaleDateString();
    try {
      const data = await AsyncStorage.getItem(today);
      if (data !== null) {
        set({ water: data as unknown as number });
      } else {
        const initialData = 0;
        await AsyncStorage.setItem(today, initialData.toString());
        set({ water: initialData });
      }
    } catch (error) {
      console.error("Error fetching water data:", error);
    }
  },
  addWater: async (amount) => {
    const today = new Date().toLocaleDateString();
    try {
      const data = await AsyncStorage.getItem(today);
      if (data !== null) {
        const newWater = parseInt(data) + amount;
        await AsyncStorage.setItem(today, newWater.toString());
        set({ water: newWater });
      } else {
        const initialData = amount;
        await AsyncStorage.setItem(today, initialData.toString());
        set({ water: initialData });
      }
    } catch (error) {
      console.error("Error adding water data:", error);
    }
  },
  removeWater: (amount) => {
    const today = new Date().toLocaleDateString();
    AsyncStorage.getItem(today).then((data) => {
      if (data !== null) {
        const newWater = parseInt(data) - amount;
        AsyncStorage.setItem(today, newWater.toString());
        set({ water: newWater });
      }
    });
  },
  resetWater: () => {
    const today = new Date().toLocaleDateString();
    AsyncStorage.setItem(today, "0");
    set({ water: 0 });
  },
}));
