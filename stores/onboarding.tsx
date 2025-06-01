import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Status = "completed" | "in-progress";

type OnboardingStateProps = {
  status: Status;
  currentTipId?: number;
};

type OnBoardingActionsProps = {
  setStatus: (status: Status) => void;
  setCurrentTipId?: (tipId: number) => void;
  setNextTipId: () => void;

  getIsShown: () => boolean;
  getIsShownTip: (tipId: number) => boolean;

  fetchOrInitData: () => Promise<void>;
};

type OnboardingStoreProps = OnboardingStateProps & OnBoardingActionsProps;

const storageKey = "onboardingCompleted";

export const useOnboardingStore = create<OnboardingStoreProps>((set, get) => ({
  status: "in-progress",
  currentTipId: 0,

  setStatus: (status: Status) => {
    set({ status });
    AsyncStorage.setItem(storageKey, JSON.stringify(status));
  },

  setCurrentTipId: (tipId: number) => {
    set({ currentTipId: tipId });
  },

  setNextTipId: () => {
    const nextTipId = (get().currentTipId || 0) + 1;
    set({ currentTipId: nextTipId });
  },

  fetchOrInitData: async () => {
    try {
      const data = await AsyncStorage.getItem(storageKey);
      if (data !== null) {
        const parsedData = JSON.parse(data);
        set({ status: parsedData });
        return;
      }
      get().setStatus("in-progress");
    } catch (error) {
      console.error("Error initializing onboarding data:", error);
      get().setStatus("in-progress");
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
