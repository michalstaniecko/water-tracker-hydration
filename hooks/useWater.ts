import { useEffect, useState } from "react";
import { useWaterStore } from "@/stores/water";
import { useSetupStore, SetupOptions } from "@/stores/setup";

export function useWater() {
  const [leftToDrink, setLeftToDrink] = useState(0);
  const waterStore = useWaterStore();
  const setupStore = useSetupStore();

  const computeLeftToDrink = () => {
    const left = setupStore.minimumWater - waterStore.water;
    setLeftToDrink(left < 0 ? 0 : left);
  };

  const addWater = () => {
    waterStore.addWater(setupStore.glassCapacity);
  };

  const removeWater = () => {
    if (waterStore.water - setupStore[SetupOptions.GLASS_CAPACITY] <= 0) {
      waterStore.setWater(0);
      return;
    }
    waterStore.removeWater(setupStore.glassCapacity);
  };

  useEffect(() => {
    waterStore.fetchData();
  }, []);

  useEffect(() => {
    computeLeftToDrink();
  }, [waterStore.water, setupStore.minimumWater]);

  return {
    water: waterStore.water,
    addWater,
    removeWater,
    leftToDrink,
    minimumWater: setupStore.minimumWater,
  };
}
