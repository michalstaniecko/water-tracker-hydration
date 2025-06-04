import { Pressable, Text, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Card } from "@/components/ui/Card";
import { useOnboardingStore } from "@/stores/onboarding";
import Animated, { StretchInY, StretchOutY } from "react-native-reanimated";
import { useTranslation } from "react-i18next";

const tipId = 2;

export default function CardThird() {
  const onboardingStore = useOnboardingStore();
  const { t } = useTranslation("onboarding");

  if (!onboardingStore.getIsShownTip(tipId)) {
    return null;
  }

  return (
    <Animated.View
      style={{ transformOrigin: "top" }}
      entering={StretchInY}
      exiting={StretchOutY}
    >
      <Card backgroundColor={"bg-blue-900"}>
        <Text className={"text-white text-lg font-semibold"}>
          Track Daily Water Intake Goal
        </Text>
        <Text className={"text-white text-lg"}>
          Track your daily hydration – see how much water you’ve already drunk
          and how much time you have left to reach your daily goal before the
          day ends!
        </Text>
        <View className={"flex-row justify-between"}>
          <Pressable
            onPress={() => onboardingStore.setPreviousTipId()}
            className={"d-flex flex-row items-center gap-2 ml-auto p-2"}
          >
            <FontAwesome color={"#fff"} name={"arrow-circle-left"} />
            <Text className={"text-white uppercase font-semibold text-sm"}>
              {t("previousTip", { ns: "translation" })}
            </Text>
          </Pressable>
          <Pressable
            onPress={onboardingStore.setCompleted}
            className={"d-flex flex-row items-center gap-2  p-2"}
          >
            <Text className={"text-white uppercase font-semibold text-sm"}>
              {t("finish", { ns: "translation" })}
            </Text>
            <FontAwesome color={"#fff"} name={"check-circle"} />
          </Pressable>
        </View>
      </Card>
    </Animated.View>
  );
}
