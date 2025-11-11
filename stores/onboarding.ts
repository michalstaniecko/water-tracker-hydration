import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logError } from "@/utils/errorLogging";

export type Status = "completed" | "in-progress";

type OnboardingStateProps = {
  status: Status;
  currentTipId?: number;
};

type OnBoardingActionsProps = {
  setStatus: (status: Status) => Promise<void>;
  setCurrentTipId?: (tipId: number) => void;
  setNextTipId: () => void;
  setPreviousTipId: () => void;
  setCompleted: () => Promise<void>;

  getIsShown: () => boolean;
  getIsShownTip: (tipId: number) => boolean;

  fetchOrInitData: () => Promise<void>;
};

type OnboardingStoreProps = OnboardingStateProps & OnBoardingActionsProps;

const storageKey = "onboardingCompleted";

export const useOnboardingStore = create<OnboardingStoreProps>((set, get) => ({
  status: "completed",
  currentTipId: 0,

  setStatus: async (status: Status) => {
    set({ status, currentTipId: 0 });
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(status));
    } catch (error) {
      logError(error, {
        operation: 'setStatus',
        component: 'OnboardingStore',
        data: { status },
      });
    }
  },

  setCurrentTipId: (tipId: number) => {
    set({ currentTipId: tipId });
  },

  setNextTipId: () => {
    const nextTipId = (get().currentTipId || 0) + 1;
    set({ currentTipId: nextTipId });
  },

  setPreviousTipId: () => {
    const previousTipId = (get().currentTipId || 0) - 1;
    if (previousTipId >= 0) {
      set({ currentTipId: previousTipId });
    }
  },

  setCompleted: async () => {
    set({ status: "completed", currentTipId: 0 });
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify("completed"));
    } catch (error) {
      logError(error, {
        operation: 'setCompleted',
        component: 'OnboardingStore',
      });
    }
  },

  fetchOrInitData: async () => {
    try {
      const data = await AsyncStorage.getItem(storageKey);
      if (data !== null) {
        const parsedData = JSON.parse(data);
        
        // Validate that the parsed data is a valid status
        if (parsedData === "completed" || parsedData === "in-progress") {
          set({ status: parsedData });
        } else {
          // Invalid data, reinitialize
          await get().setStatus("in-progress");
        }
      } else {
        await get().setStatus("in-progress");
      }
    } catch (error) {
      logError(error, {
        operation: 'fetchOrInitData',
        component: 'OnboardingStore',
      });
      
      // Set default status on error
      try {
        await get().setStatus("in-progress");
      } catch (setError) {
        // If even setting fails, just update the state
        set({ status: "in-progress" });
      }
    }
  },

  getIsShown: () => {
    return get().status === "in-progress";
  },

  getIsShownTip: (tipId: number) => {
    if (get().status === "completed") {
      return false;
    }
    return get().currentTipId === tipId;
  },
}));
