import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import { DEFAULT_DATE_FORMAT } from "@/config/date";
import * as Localization from "expo-localization";
import { sanitizePositiveNumber, isValidTimeFormat } from "@/utils/validation";
import { logError, logWarning } from "@/utils/errorLogging";
import { DEFAULT_DAILY_GOAL } from "@/constants/app";

export enum SetupOptions {
  GLASS_CAPACITY = "glassCapacity",
  MINIMUM_WATER = "minimumWater",
  DAY = "day",
  DATE_FORMAT = "dateFormat",
  LANGUAGE_CODE = "languageCode",
  HAPTICS_ENABLED = "hapticsEnabled",
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
  [SetupOptions.HAPTICS_ENABLED]: boolean;
};

type SetupActions = {
  setGlassCapacity: (capacity: string) => Promise<void>;
  setMinimumWater: (water: string) => Promise<void>;
  setGlassCapacityTemp: (capacity: string) => void;
  setMinimumWaterTemp: (water: string) => void;
  setLanguageCode: (languageCode: string) => Promise<void>;
  setHapticsEnabled: (enabled: boolean) => Promise<void>;
  getOptions: () => SetupState;
  setOption: (option: SetupOptions, value: number | string | {} | boolean) => Promise<void>;
  reset: () => Promise<void>;
  fetchOrInitData: () => Promise<void>;
  getDayProgress: () => number;
};

const storageKey = "setupData";

const initialState: SetupState = {
  glassCapacity: "250",
  minimumWater: String(DEFAULT_DAILY_GOAL),
  day: {
    startHour: "08:00",
    endHour: "23:00",
  },
  dateFormat: DEFAULT_DATE_FORMAT,
  languageCode: Localization.getLocales()[0].languageCode || "en",
  hapticsEnabled: true,
};

export const useSetupStore = create<SetupState & SetupActions>((set, get) => ({
  ...initialState,
  fetchOrInitData: async () => {
    try {
      const data = await AsyncStorage.getItem(storageKey);
      if (data !== null) {
        const parsedData = JSON.parse(data);
        
        // Validate and sanitize parsed data
        if (typeof parsedData === 'object' && parsedData !== null) {
          const validatedData = { ...initialState };
          
          // Sanitize numeric values
          if (parsedData.glassCapacity) {
            validatedData.glassCapacity = sanitizePositiveNumber(parsedData.glassCapacity, '250');
          }
          if (parsedData.minimumWater) {
            validatedData.minimumWater = sanitizePositiveNumber(parsedData.minimumWater, String(DEFAULT_DAILY_GOAL));
          }
          
          // Validate time format
          if (parsedData.day?.startHour && isValidTimeFormat(parsedData.day.startHour)) {
            validatedData.day.startHour = parsedData.day.startHour;
          }
          if (parsedData.day?.endHour && isValidTimeFormat(parsedData.day.endHour)) {
            validatedData.day.endHour = parsedData.day.endHour;
          }
          
          // Validate date format
          if (parsedData.dateFormat && typeof parsedData.dateFormat === 'string') {
            validatedData.dateFormat = parsedData.dateFormat;
          }
          
          // Validate language code
          if (parsedData.languageCode && typeof parsedData.languageCode === 'string') {
            validatedData.languageCode = parsedData.languageCode;
          }

          // Validate haptics setting (default to true if not set)
          if (typeof parsedData.hapticsEnabled === 'boolean') {
            validatedData.hapticsEnabled = parsedData.hapticsEnabled;
          }

          set(validatedData);
        } else {
          logWarning('Invalid setup data structure, reinitializing', {
            operation: 'fetchOrInitData',
            component: 'SetupStore',
          });
          await AsyncStorage.setItem(storageKey, JSON.stringify(initialState));
          set(initialState);
        }
      } else {
        await AsyncStorage.setItem(storageKey, JSON.stringify(initialState));
        set(initialState);
      }
    } catch (error) {
      logError(error, {
        operation: 'fetchOrInitData',
        component: 'SetupStore',
      });
      
      // Set initial state on error
      set(initialState);
      
      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify(initialState));
      } catch (storageError) {
        logError(storageError, {
          operation: 'fetchOrInitData - recovery',
          component: 'SetupStore',
        });
      }
    }
  },
  getOptions: () => ({
    glassCapacity: get().glassCapacity,
    minimumWater: get().minimumWater,
    day: get().day,
    dateFormat: get()[SetupOptions.DATE_FORMAT],
    languageCode: get()[SetupOptions.LANGUAGE_CODE],
    hapticsEnabled: get()[SetupOptions.HAPTICS_ENABLED],
  }),
  setGlassCapacity: async (capacity: string) => {
    // Sanitize and persist to storage
    const sanitized = sanitizePositiveNumber(capacity, '250');
    await get().setOption(SetupOptions.GLASS_CAPACITY, sanitized);
  },
  setMinimumWater: async (water: string) => {
    // Sanitize and persist to storage
    const sanitized = sanitizePositiveNumber(water, String(DEFAULT_DAILY_GOAL));
    await get().setOption(SetupOptions.MINIMUM_WATER, sanitized);
  },
  setGlassCapacityTemp: (capacity: string) => {
    // Temporary update without persisting - for editing
    set((state) => ({
      ...state,
      [SetupOptions.GLASS_CAPACITY]: capacity,
    }));
  },
  setMinimumWaterTemp: (water: string) => {
    // Temporary update without persisting - for editing
    set((state) => ({
      ...state,
      [SetupOptions.MINIMUM_WATER]: water,
    }));
  },
  setOption: async (option: SetupOptions, value: number | string | {} | boolean) => {
    set((state) => ({
      ...state,
      [option]: value,
    }));
    try {
      const options = get().getOptions();
      await AsyncStorage.setItem(storageKey, JSON.stringify(options));
    } catch (error) {
      logError(error, {
        operation: 'setOption',
        component: 'SetupStore',
        data: { option, value },
      });
    }
  },
  setLanguageCode: async (languageCode: string) => {
    await get().setOption(SetupOptions.LANGUAGE_CODE, languageCode);
  },
  setHapticsEnabled: async (enabled: boolean) => {
    await get().setOption(SetupOptions.HAPTICS_ENABLED, enabled);
  },
  reset: async () => {
    set(initialState);
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(initialState));
    } catch (error) {
      logError(error, {
        operation: 'reset',
        component: 'SetupStore',
      });
    }
  },
  getDayProgress: () => {
    try {
      const { startHour, endHour } = get().day;
      
      // Validate time formats
      if (!isValidTimeFormat(startHour) || !isValidTimeFormat(endHour)) {
        logWarning('Invalid time format in day progress calculation', {
          operation: 'getDayProgress',
          component: 'SetupStore',
          data: { startHour, endHour },
        });
        return 0;
      }
      
      const endHourDate = dayjs(endHour, ["HH:mm", "H"], true);
      const startHourDate = dayjs(startHour, ["HH:mm", "H"], true);
      
      if (!endHourDate.isValid() || !startHourDate.isValid()) {
        logWarning('Invalid dayjs parsing in day progress', {
          operation: 'getDayProgress',
          component: 'SetupStore',
          data: { startHour, endHour },
        });
        return 0;
      }
      
      const endHourInMinutes = endHourDate.hour() * 60 + endHourDate.minute();
      const startHourInMinutes = startHourDate.hour() * 60 + startHourDate.minute();
      const fullDayInMinutes = endHourDate.diff(startHourDate, "minutes");
      
      if (fullDayInMinutes <= 0) {
        logWarning('Invalid day duration in progress calculation', {
          operation: 'getDayProgress',
          component: 'SetupStore',
          data: { startHour, endHour, fullDayInMinutes },
        });
        return 0;
      }
      
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
      
      if (!progress || progress < 0) {
        return 0;
      }
      
      return Math.min(progress, 100);
    } catch (error) {
      logError(error, {
        operation: 'getDayProgress',
        component: 'SetupStore',
      });
      return 0;
    }
  },
}));
