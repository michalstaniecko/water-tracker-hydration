import { Pressable, Text, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Card } from "@/components/ui/Card";
import { useOnboardingStore } from "@/stores/onboarding";
import Animated, { StretchInY, StretchOutY } from "react-native-reanimated";
import { useTranslation } from "react-i18next";

const tipId = 0;

export default function CardWelcome() {
  const onboardingStore = useOnboardingStore();
  const { t } = useTranslation();

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
          {t("welcome.title", { ns: "onboarding" })}
        </Text>
        <Text className={"text-white text-lg"}>
          {t("welcome.description", { ns: "onboarding" })}
        </Text>
        <View className={"flex-row justify-between"}>
          <Pressable
            onPress={onboardingStore.setCompleted}
            className={"d-flex flex-row items-center gap-2  p-2"}
          >
            <FontAwesome color={"#fff"} name={"times"} />
            <Text className={"text-white uppercase font-semibold text-sm"}>
              {t("dismiss")}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => onboardingStore.setNextTipId()}
            className={"d-flex flex-row items-center gap-2  p-2"}
          >
            <Text className={"text-white uppercase font-semibold text-sm"}>
              {t("nextTip")}
            </Text>
            <FontAwesome color={"#fff"} name={"arrow-circle-right"} />
          </Pressable>
        </View>
      </Card>
    </Animated.View>
  );
}
