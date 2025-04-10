import { create } from "zustand";

type WaterStore = {
  water: number;
  addWater: (amount: number) => void;
  removeWater: (amount: number) => void;
  resetWater: () => void;
};

export const useWaterStore = create<WaterStore>((set) => ({
  water: 0,
  addWater: (amount) => set((state) => ({ water: state.water + amount })),
  removeWater: (amount) => set((state) => ({ water: state.water - amount })),
  resetWater: () => set({ water: 0 }),
}));
