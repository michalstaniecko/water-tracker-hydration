import { Pressable, Text, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Card } from "@/components/ui/Card";
import { useOnboardingStore } from "@/stores/onboarding";
import Animated, {
  FadeIn,
  FadeOut,
  FadingTransition,
} from "react-native-reanimated";

const tipId = 0;

export default function CardWelcome() {
  const onboardingStore = useOnboardingStore();

  if (!onboardingStore.getIsShownTip(tipId)) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      layout={FadingTransition}
    >
      <Card backgroundColor={"bg-blue-900"}>
        <Text className={"text-white text-lg font-semibold"}>
          Welcome to your daily water tracker!
        </Text>
        <Text className={"text-white text-lg"}>
          It's your first time here, so let's get you started.
        </Text>
        <View className={"flex-row justify-between"}>
          <Pressable
            onPress={onboardingStore.setCompleted}
            className={"d-flex flex-row items-center gap-2  p-2"}
          >
            <FontAwesome color={"#fff"} name={"times"} />
            <Text className={"text-white uppercase font-semibold text-sm"}>
              Dismiss
            </Text>
          </Pressable>
          <Pressable
            onPress={() => onboardingStore.setNextTipId()}
            className={"d-flex flex-row items-center gap-2  p-2"}
          >
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
