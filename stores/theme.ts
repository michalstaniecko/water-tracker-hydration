import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logError, logWarning } from "@/utils/errorLogging";

export type ThemePreference = "auto" | "light" | "dark";

const VALID_PREFERENCES: ThemePreference[] = ["auto", "light", "dark"];

type ThemeState = {
  preference: ThemePreference;
};

type ThemeActions = {
  setPreference: (preference: ThemePreference) => Promise<void>;
  fetchOrInitData: () => Promise<void>;
  reset: () => Promise<void>;
};

const storageKey = "themeData";

const initialState: ThemeState = {
  preference: "auto",
};

export const useThemeStore = create<ThemeState & ThemeActions>((set) => ({
  ...initialState,
  fetchOrInitData: async () => {
    try {
      const data = await AsyncStorage.getItem(storageKey);
      if (data !== null) {
        const parsedData = JSON.parse(data);

        if (typeof parsedData === "object" && parsedData !== null) {
          const validatedData = { ...initialState };

          if (
            typeof parsedData.preference === "string" &&
            VALID_PREFERENCES.includes(parsedData.preference)
          ) {
            validatedData.preference = parsedData.preference;
          } else {
            logWarning("Invalid theme preference, falling back to auto", {
              operation: "fetchOrInitData",
              component: "ThemeStore",
              data: { preference: parsedData.preference },
            });
          }

          set(validatedData);
        } else {
          logWarning("Invalid theme data structure, reinitializing", {
            operation: "fetchOrInitData",
            component: "ThemeStore",
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
        operation: "fetchOrInitData",
        component: "ThemeStore",
      });

      set(initialState);

      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify(initialState));
      } catch (storageError) {
        logError(storageError, {
          operation: "fetchOrInitData - recovery",
          component: "ThemeStore",
        });
      }
    }
  },
  setPreference: async (preference: ThemePreference) => {
    set({ preference });
    try {
      await AsyncStorage.setItem(
        storageKey,
        JSON.stringify({ preference }),
      );
    } catch (error) {
      logError(error, {
        operation: "setPreference",
        component: "ThemeStore",
        data: { preference },
      });
    }
  },
  reset: async () => {
    set(initialState);
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(initialState));
    } catch (error) {
      logError(error, {
        operation: "reset",
        component: "ThemeStore",
      });
    }
  },
}));
