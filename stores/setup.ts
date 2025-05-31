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
  day: {
    startHour: string;
    endHour: string;
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
    startHour: "08:00",
    endHour: "23:00",
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
    const endHourDate = dayjs(endHour, ["HH:mm", "H"], true);
    const endHourInMinutes = endHourDate.hour() * 60 + endHourDate.minute();
    const startHourDate = dayjs(startHour, ["HH:mm", "H"], true);
    const startHourInMinutes =
      startHourDate.hour() * 60 + startHourDate.minute();
    const fullDayInMinutes = endHourDate.diff(startHourDate, "minutes");
    const now = dayjs();
    const currentHour = now.hour();
    const currentMinute = now.minute();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    if (currentTimeInMinutes <= startHourInMinutes) {
      return 0;
    }
    if (currentTimeInMinutes >= endHourInMinutes) {
      return 100;
    }
    const progress = Math.round(
      ((currentTimeInMinutes - startHourInMinutes) / fullDayInMinutes) * 100,
    );
    if (!progress) {
      return 0;
    }
    return progress;
  },
}));
