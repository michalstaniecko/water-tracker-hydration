import { create } from "zustand";

type SetupState = {
  glassCapacity: number;
  minimumWater: number;
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
  setGlassCapacity: (capacity) => set({ glassCapacity: capacity }),
  setMinimumWater: (water) => set({ minimumWater: water }),
  reset: () => set(initialState),
}));
