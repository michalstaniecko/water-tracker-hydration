import { ScrollView, View } from "react-native";
import { useSetupStore } from "@/stores/setup";
import { useWater } from "@/hooks/useWater";
import AddWater from "@/components/AddWater";
import RemoveWater from "@/components/RemoveWater";
import { Card } from "@/components/ui/Card";
import CardWaterAmount from "@/components/CardWaterAmount";
import Animated, {
  FadeOut,
  FadeIn,
  FadingTransition,
  LayoutAnimationConfig,
} from "react-native-reanimated";
import CardDayProgress from "@/components/CardDayProgress";
import { useTranslation } from "react-i18next";
import CardWelcome from "@/components/onboarding/CardWelcome";
import CardSecond from "@/components/onboarding/CardSecond";

const duration = 50;

export default function Index() {
  const { leftToDrink } = useWater();
  const { minimumWater } = useSetupStore();
  const { t } = useTranslation();

  return (
    <ScrollView contentContainerClassName={"flex-1 p-5"}>
      <View className={"gap-3"}>
        <CardWelcome />
        <Animated.View layout={FadingTransition} className={"flex-row gap-3"}>
          <View className={"flex-1 gap-3"}>
            <Card
              title={`${minimumWater}ml`}
              description={t("dailyRequirement")}
            />
          </View>
          <View className={"flex-1"}>
            <View className={"flex-1"}>
              <LayoutAnimationConfig skipEntering>
                {leftToDrink > 0 && (
                  <Animated.View
                    exiting={FadeOut.duration(duration)}
                    entering={FadeIn.delay(duration)}
                  >
                    <Card
                      className={"h-full"}
                      title={`${leftToDrink}ml`}
                      description={t("leftToDrink")}
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
                      className={"h-full"}
                      title={t("youDrankEnoughWaterToday")}
                      backgroundColor={"bg-blue-900"}
                      titleColor={"text-white"}
                    />
                  </Animated.View>
                )}
              </LayoutAnimationConfig>
            </View>
          </View>
        </Animated.View>

        <CardSecond />
        <Animated.View layout={FadingTransition} className={"flex-row gap-3"}>
          <CardDayProgress />
          <CardWaterAmount />
        </Animated.View>
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
