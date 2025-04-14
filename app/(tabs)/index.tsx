import { Pressable, ScrollView, Text, View } from "react-native";
import { useSetupStore } from "@/stores/setup";
import { useWater } from "@/hooks/useWater";
import AddWater from "@/components/AddWater";
import RemoveWater from "@/components/RemoveWater";
import { getToday } from "@/utils/date";

export default function Index() {
  const { water, leftToDrink } = useWater();
  const { glassCapacity, minimumWater } = useSetupStore();

  const today = getToday();

  return (
    <ScrollView
      contentContainerClassName={"flex-1 items-center justify-center"}
    >
      <View className={"gap-2 flex-1 items-center justify-center"}>
        <Text>Today: {today}</Text>
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
          <AddWater />
          <RemoveWater />
        </View>
      </View>
    </ScrollView>
  );
}
