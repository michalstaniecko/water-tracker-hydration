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
          <Pressable
            onPress={() => onboardingStore.setPreviousTipId()}
            className={"d-flex flex-row items-center gap-2 ml-auto p-2"}
          >
            <FontAwesome color={"#fff"} name={"arrow-circle-left"} />
            <Text className={"text-white uppercase font-semibold text-sm"}>
              Previous tip
            </Text>
          </Pressable>
          <Pressable
            onPress={onboardingStore.setCompleted}
            className={"d-flex flex-row items-center gap-2  p-2"}
          >
            <Text className={"text-white uppercase font-semibold text-sm"}>
              Finish
            </Text>
            <FontAwesome color={"#fff"} name={"check-circle"} />
          </Pressable>
        </View>
      </Card>
    </Animated.View>
  );
}
