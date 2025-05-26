import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import { DEFAULT_DATE_FORMAT } from "@/config/date";
import * as Localization from "expo-localization";

export enum SetupOptions {
  GLASS_CAPACITY = "glassCapacity",
  MINIMUM_WATER = "minimumWater",
  DAY = "day",
  DATE_FORMAT = "dateFormat",
  LANGUAGE_CODE = "languageCode",
}

type SetupState = {
  [SetupOptions.GLASS_CAPACITY]: string;
  [SetupOptions.MINIMUM_WATER]: string;
  [SetupOptions.DAY]: {
    startHour: number;
    endHour: number;
  };
  [SetupOptions.DATE_FORMAT]: string;
  [SetupOptions.LANGUAGE_CODE]?: string;
};

type SetupActions = {
  setGlassCapacity: (capacity: string) => void;
  setMinimumWater: (water: string) => void;
  setLanguageCode: (languageCode: string) => void;
  getOptions: () => SetupState;
  setOption: (option: SetupOptions, value: number | string | {}) => void;
  reset: () => void;
  fetchOrInitData: () => Promise<void>;
  getDayProgress: () => number;
};

const storageKey = "setupData";

const initialState: SetupState = {
  glassCapacity: "250",
  minimumWater: "2000",
  day: {
    startHour: 8,
    endHour: 23,
  },
  dateFormat: DEFAULT_DATE_FORMAT,
  languageCode: Localization.getLocales()[0].languageCode || "en",
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
      return;
    } catch (error) {
      console.error("Error initializing setup data:", error);
    }
  },
  getOptions: () => ({
    glassCapacity: get().glassCapacity,
    minimumWater: get().minimumWater,
    day: get().day,
    dateFormat: get()[SetupOptions.DATE_FORMAT],
    languageCode: get()[SetupOptions.LANGUAGE_CODE],
  }),
  setGlassCapacity: (capacity: string) => {
    get().setOption(SetupOptions.GLASS_CAPACITY, capacity);
  },
  setMinimumWater: (water: string) => {
    get().setOption(SetupOptions.MINIMUM_WATER, water);
  },
  setOption: (option: SetupOptions, value: number | string | {}) => {
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
  setLanguageCode: (languageCode: string) => {
    get().setOption(SetupOptions.LANGUAGE_CODE, languageCode);
  },
  reset: () => set(initialState),
  getDayProgress: () => {
    const { startHour, endHour } = get().day;
    const fullDay = endHour - startHour;
    const now = dayjs();
    const currentHour = now.hour();
    if (currentHour <= startHour) {
      return 0;
    }
    if (currentHour >= endHour) {
      return 100;
    }
    const progress = Math.round(((currentHour - startHour) / fullDay) * 100);
    if (!progress) {
      return 0;
    }
    return progress;
  },
}));
