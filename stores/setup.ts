import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export enum SetupOptions {
  GLASS_CAPACITY = "glassCapacity",
  MINIMUM_WATER = "minimumWater",
}

type SetupState = {
  [SetupOptions.GLASS_CAPACITY]: string;
  [SetupOptions.MINIMUM_WATER]: string;
};

type SetupActions = {
  setGlassCapacity: (capacity: string) => void;
  setMinimumWater: (water: string) => void;
  getOptions: () => SetupState;
  setOption: (option: SetupOptions, value: number | string) => void;
  reset: () => void;
  fetchOrInitData: () => Promise<void>;
};

const storageKey = "setupData";

const initialState: SetupState = {
  glassCapacity: "250",
  minimumWater: "2000",
};

export const useSetupStore = create<SetupState & SetupActions>((set, get) => ({
  ...initialState,
  fetchOrInitData: async () => {
    try {
      const data = await AsyncStorage.getItem(storageKey);
      if (data !== null) {
        const parsedData = JSON.parse(data);
        set({ ...initialState, ...parsedData });
      } else {
        await AsyncStorage.setItem(storageKey, JSON.stringify(initialState));
        set(initialState);
      }
    } catch (error) {
      console.error("Error initializing setup data:", error);
    }
  },
  getOptions: () => ({
    glassCapacity: get().glassCapacity,
    minimumWater: get().minimumWater,
  }),
  setGlassCapacity: (capacity: string) => {
    get().setOption(SetupOptions.GLASS_CAPACITY, capacity);
  },
  setMinimumWater: (water: string) => {
    get().setOption(SetupOptions.MINIMUM_WATER, water);
  },
  setOption: (option: SetupOptions, value: number | string) => {
    set((state) => ({
      ...state,
      [option]: value,
    }));
    try {
      const options = get().getOptions();
      AsyncStorage.setItem(storageKey, JSON.stringify(options));
    } catch (error) {
      console.error("Error setting option:", error);
    }
  },
  reset: () => set(initialState),
}));
