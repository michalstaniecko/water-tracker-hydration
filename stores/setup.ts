import { create } from "zustand";

type SetupState = {
  glassCapacity: number;
  minimumWater: number;
  maximumWater: number;
};

type SetupActions = {
  setGlassCapacity: (capacity: number) => void;
  setMinimumWater: (water: number) => void;
  setMaximumWater: (water: number) => void;
  reset: () => void;
};

const initialState: SetupState = {
  glassCapacity: 250,
  minimumWater: 0,
  maximumWater: 0,
};

export const useSetupStore = create<SetupState & SetupActions>((set) => ({
  ...initialState,
  setGlassCapacity: (capacity) => set({ glassCapacity: capacity }),
  setMinimumWater: (water) => set({ minimumWater: water }),
  setMaximumWater: (water) => set({ maximumWater: water }),
  reset: () => set(initialState),
}));
