import { create } from "zustand";

export enum SetupOptions {
  GLASS_CAPACITY = "glassCapacity",
  MINIMUM_WATER = "minimumWater",
}

type SetupState = {
  [SetupOptions.GLASS_CAPACITY]: number;
  [SetupOptions.MINIMUM_WATER]: number;
};

type SetupActions = {
  setGlassCapacity: (capacity: number) => void;
  setMinimumWater: (water: number) => void;
  reset: () => void;
};

const initialState: SetupState = {
  glassCapacity: 250,
  minimumWater: 2000,
};

export const useSetupStore = create<SetupState & SetupActions>((set) => ({
  ...initialState,
  setGlassCapacity: (capacity: number) => set({ glassCapacity: capacity }),
  setMinimumWater: (water: number) => set({ minimumWater: water }),
  setOption: (option: SetupOptions, value: number | string) => {
    set((state) => ({
      ...state,
      [option]: value,
    }));
  },
  reset: () => set(initialState),
}));
