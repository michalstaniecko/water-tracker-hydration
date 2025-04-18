import { ScrollView, View } from "react-native";
import { useSetupStore } from "@/stores/setup";
import { useWater } from "@/hooks/useWater";
import AddWater from "@/components/AddWater";
import RemoveWater from "@/components/RemoveWater";
import { Card } from "@/components/ui/Card";
import CardWaterAmount from "@/components/CardWaterAmount";

export default function Index() {
  const { water, leftToDrink } = useWater();
  const { minimumWater } = useSetupStore();

  return (
    <ScrollView contentContainerClassName={"flex-1 p-5"}>
      <View className={"gap-3"}>
        <View className={"flex-row gap-3"}>
          <View className={"flex-1 gap-3"}>
            <Card
              title={`${minimumWater}ml`}
              description={"Daily requirement"}
            />
            <View className={""}>
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
          </View>
          <View className={"flex-1"}>
            <CardWaterAmount />
          </View>
        </View>
        <View className={"flex-row gap-3"}>
          <View className={"flex-1"}>
            <RemoveWater />
          </View>
          <View className={"flex-1"}>
            <AddWater />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
