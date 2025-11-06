import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import { DEFAULT_DATE_FORMAT } from "@/config/date";
import * as Localization from "expo-localization";
import { sanitizePositiveNumber, isValidTimeFormat } from "@/utils/validation";
import { logError, logWarning } from "@/utils/errorLogging";

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
  setOption: (option: SetupOptions, value: number | string | {}) => Promise<void>;
  reset: () => Promise<void>;
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
        
        // Validate and sanitize parsed data
        if (typeof parsedData === 'object' && parsedData !== null) {
          const validatedData = { ...initialState };
          
          // Sanitize numeric values
          if (parsedData.glassCapacity) {
            validatedData.glassCapacity = sanitizePositiveNumber(parsedData.glassCapacity, '250');
          }
          if (parsedData.minimumWater) {
            validatedData.minimumWater = sanitizePositiveNumber(parsedData.minimumWater, '2000');
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
  }),
  setGlassCapacity: (capacity: string) => {
    const sanitized = sanitizePositiveNumber(capacity, '250');
    get().setOption(SetupOptions.GLASS_CAPACITY, sanitized);
  },
  setMinimumWater: (water: string) => {
    const sanitized = sanitizePositiveNumber(water, '2000');
    get().setOption(SetupOptions.MINIMUM_WATER, sanitized);
  },
  setOption: async (option: SetupOptions, value: number | string | {}) => {
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
  setLanguageCode: (languageCode: string) => {
    get().setOption(SetupOptions.LANGUAGE_CODE, languageCode);
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
