import { ScrollView, Text, View } from "react-native";
import { useSetupStore } from "@/stores/setup";
import { useWater } from "@/hooks/useWater";
import AddWater from "@/components/AddWater";
import RemoveWater from "@/components/RemoveWater";
import { Card } from "@/components/ui/Card";

export default function Index() {
  const { water, leftToDrink } = useWater();
  const { glassCapacity, minimumWater } = useSetupStore();

  return (
    <ScrollView contentContainerClassName={"flex-1 p-5"}>
      <View className={"gap-3 flex-1 "}>
        <Card
          title={`${minimumWater}ml`}
          description={"Daily water requirement"}
        />
        <View className={"flex-row gap-3 items-stretch"}>
          <View className={"flex-1"}>
            {leftToDrink > 0 && (
              <Card
                title={`${leftToDrink}ml`}
                description={"Left to drink"}
                backgroundColor={"bg-blue-100"}
              />
            )}
            {leftToDrink <= 0 && (
              <Card
                title={`You drank enough water today!`}
                backgroundColor={"bg-blue-900"}
                titleColor={"text-white"}
              />
            )}
          </View>
          <View className={"flex-1"}>
            <Card
              title={`${water}ml`}
              description={"Water amount"}
              backgroundColor={"bg-blue-300/100"}
            />
          </View>
        </View>
        <View className={"flex-row gap-2"}>
          <View className={"flex-1"}>
            <AddWater />
          </View>
          <View className={"flex-1"}>
            <RemoveWater />
          </View>
        </View>
        <Text>Glass capacity: {glassCapacity}ml</Text>
      </View>
    </ScrollView>
  );
}
