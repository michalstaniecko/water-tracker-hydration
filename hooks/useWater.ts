import { useEffect } from "react";
import { useWaterStore } from "@/stores/water";
import { useSetupStore } from "@/stores/setup";
import { roundBy } from "@/utils/numbers";

export function useWater() {
  const waterStore = useWaterStore();
  const setupStore = useSetupStore();

  const computeLeftToDrink = () => {
    const todayWater = waterStore.getTodayWater();
    const left = Number(setupStore.minimumWater) - Number(todayWater);
    return left < 0 ? 0 : left;
  };

  const percentOfDailyWater = () => {
    const todayWater = waterStore.getTodayWater();
    const percent =
      (Number(todayWater) / Number(setupStore.minimumWater)) * 100;
    return percent > 100 ? 100 : percent;
  };

  const addWater = () => {
    const currentWater = waterStore.getTodayWater();
    const newCurrentWater =
      Number(currentWater) + Number(setupStore.glassCapacity);
    waterStore.setTodayWater(newCurrentWater.toString());
  };

  const removeWater = () => {
    const currentWater = waterStore.getTodayWater();
    const newCurrentWater =
      Number(currentWater) - Number(setupStore.glassCapacity);
    if (newCurrentWater <= 0) {
      waterStore.setTodayWater("0");
      return;
    }
    waterStore.setTodayWater(newCurrentWater.toString());
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
