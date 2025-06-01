import { Pressable, Text, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Card } from "@/components/ui/Card";
import { useOnboardingStore } from "@/stores/onboarding";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

const tipId = 1;

export default function CardSecond() {
  const onboardingStore = useOnboardingStore();

  if (!onboardingStore.getIsShownTip(tipId)) {
    return null;
  }

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut}>
      <Card backgroundColor={"bg-blue-900"}>
        <Text className={"text-white text-lg font-semibold"}>Second tip!</Text>
        <Text className={"text-white text-lg"}>
          You can update your daily water intake goal in the settings.
        </Text>
        <View className={"flex-row justify-between"}>
          <Pressable className={"d-flex flex-row items-center gap-2  p-2"}>
            <FontAwesome color={"#fff"} name={"times"} />
            <Text className={"text-white uppercase font-semibold text-sm"}>
              Dismiss
            </Text>
          </Pressable>
          <Pressable className={"d-flex flex-row items-center gap-2  p-2"}>
            <Text className={"text-white uppercase font-semibold text-sm"}>
              Next tip
            </Text>
            <FontAwesome color={"#fff"} name={"arrow-circle-right"} />
          </Pressable>
        </View>
      </Card>
    </Animated.View>
  );
}
