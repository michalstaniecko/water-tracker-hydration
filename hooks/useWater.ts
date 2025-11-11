import { useEffect } from "react";
import { useWaterStore } from "@/stores/water";
import { useSetupStore } from "@/stores/setup";
import { useGamificationStore } from "@/stores/gamification";
import { roundBy } from "@/utils/numbers";
import { logError } from "@/utils/errorLogging";

export function useWater() {
  const waterStore = useWaterStore();
  const setupStore = useSetupStore();
  const gamificationStore = useGamificationStore();

  const computeLeftToDrink = () => {
    const todayWater = waterStore.getTodayWater();
    const left = Number(setupStore.minimumWater) - Number(todayWater);
    return left < 0 ? 0 : left;
  };

  const percentOfDailyWater = () => {
    const todayWater = waterStore.getTodayWater();
    const minimumWater = Number(setupStore.minimumWater);

    if (minimumWater <= 0) {
      return 0;
    }

    const percent = (Number(todayWater) / minimumWater) * 100;
    return percent > 100 ? 100 : percent;
  };

  const addWater = async () => {
    try {
      const currentWater = waterStore.getTodayWater();
      const newCurrentWater =
        Number(currentWater) + Number(setupStore.glassCapacity);
      await waterStore.setTodayWater(newCurrentWater.toString());
      gamificationStore.checkAndUnlockAchievements();
    } catch (error) {
      logError(error, {
        operation: "addWater",
        component: "useWater",
      });
    }
  };

  const removeWater = async () => {
    try {
      const currentWater = waterStore.getTodayWater();
      const newCurrentWater =
        Number(currentWater) - Number(setupStore.glassCapacity);
      if (newCurrentWater <= 0) {
        await waterStore.setTodayWater("0");
        return;
      }
      await waterStore.setTodayWater(newCurrentWater.toString());
    } catch (error) {
      logError(error, {
        operation: "removeWater",
        component: "useWater",
      });
    }
  };

  useEffect(() => {
    computeLeftToDrink();
  }, [waterStore.getTodayWater, setupStore.minimumWater]);

  return {
    water: waterStore.getTodayWater(),
    addWater,
    removeWater,
    leftToDrink: computeLeftToDrink(),
    minimumWater: setupStore.minimumWater,
    percentOfDailyWater: percentOfDailyWater(),
  };
}
