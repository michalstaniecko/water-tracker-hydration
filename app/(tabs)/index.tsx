import { ScrollView, View, Text } from "react-native";
import { useSetupStore } from "@/stores/setup";
import { useWater } from "@/hooks/useWater";
import AddWater from "@/components/AddWater";
import RemoveWater from "@/components/RemoveWater";
import { Card } from "@/components/ui/Card";
import CardWaterAmount from "@/components/CardWaterAmount";
import Animated, { FadeOut, FadeIn } from "react-native-reanimated";
import CardDayProgress from "@/components/CardDayProgress";

const duration = 50;

export default function Index() {
  const { leftToDrink } = useWater();
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
          </View>
          <View className={"flex-1"}>
            <View className={""}>
              {leftToDrink > 0 && (
                <Animated.View
                  exiting={FadeOut.duration(duration)}
                  entering={FadeIn.delay(duration)}
                >
                  <Card
                    title={`${leftToDrink}ml`}
                    description={"Left to drink"}
                    backgroundColor={"bg-blue-100"}
                  />
                </Animated.View>
              )}
              {leftToDrink <= 0 && (
                <Animated.View
                  exiting={FadeOut.duration(duration)}
                  entering={FadeIn.delay(duration)}
                >
                  <Card
                    title={`You drank enough water today!`}
                    backgroundColor={"bg-blue-900"}
                    titleColor={"text-white"}
                  />
                </Animated.View>
              )}
            </View>
          </View>
        </View>
        <View className={"flex-row gap-3"}>
          <CardDayProgress />
          <CardWaterAmount />
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
