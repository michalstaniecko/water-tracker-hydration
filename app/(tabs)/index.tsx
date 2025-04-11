import { Pressable, ScrollView, Text, View } from "react-native";
import { useWaterStore } from "@/stores/water";
import { useSetupStore } from "@/stores/setup";
import { useEffect, useState } from "react";

export default function Index() {
  const { water, addWater, removeWater, leftToDrink } = useWater();
  const { glassCapacity, minimumWater } = useSetupStore();

  return (
    <ScrollView
      contentContainerClassName={"flex-1 items-center justify-center"}
    >
      <View className={"gap-2 flex-1 items-center justify-center"}>
        <Text>Today: {new Date().toLocaleDateString()}</Text>
        <Text>Daily water requirement: {minimumWater}ml</Text>
        {leftToDrink > 0 && <Text>Left to drink: {leftToDrink}ml</Text>}
        {leftToDrink <= 0 && (
          <Text
            className={
              "text-green-500 font-semibold p-2 border border-green-500 rounded"
            }
          >
            You drank enough water today!
          </Text>
        )}
        <Text>Water amount: {water}ml</Text>
        <Text>Glass capacity: {glassCapacity}ml</Text>
        <View className={"flex-row gap-2"}>
          <Pressable onPress={addWater}>
            <Text
              className={
                "bg-blue-500 border border-blue-500 text-white px-3 py-2 rounded"
              }
            >
              Add glass
            </Text>
          </Pressable>
          <Pressable onPress={removeWater}>
            <Text
              className={
                "border-blue-500 border text-blue-500 px-3 py-2 rounded"
              }
            >
              Remove glass
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

function useWater() {
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
  };
}
