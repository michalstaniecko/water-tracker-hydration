import React from "react";
import { Text } from "react-native";
import { useWater } from "@/hooks/useWater";
import { useTranslation } from "react-i18next";
import { colors } from "@/constants/colors";
import CircularProgress from "@/components/CircularProgress";
import Animated, {
  FadeIn,
  FadeOut,
  LayoutAnimationConfig,
} from "react-native-reanimated";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const RING_SIZE = 240;
const STROKE_WIDTH = 20;
const ANIMATION_DURATION = 50;

export default function WaterCircularProgress() {
  const { water, minimumWater, percentOfDailyWater, leftToDrink } = useWater();
  const { t } = useTranslation();

  const isGoalAchieved = leftToDrink <= 0;
  const progressColor = isGoalAchieved ? colors.green[500] : colors.blue[500];
  const trackColor = isGoalAchieved ? colors.green[100] : colors.blue[100];

  return (
    <CircularProgress
      size={RING_SIZE}
      strokeWidth={STROKE_WIDTH}
      progress={percentOfDailyWater}
      trackColor={trackColor}
      progressColor={progressColor}
    >
      <LayoutAnimationConfig skipEntering>
        {!isGoalAchieved && (
          <Animated.View
            entering={FadeIn.delay(ANIMATION_DURATION)}
            exiting={FadeOut.duration(ANIMATION_DURATION)}
            className="items-center"
          >
            <Text className="text-3xl font-bold text-gray-900">{water}ml</Text>
            <Text className="text-base text-gray-500 mt-1 font-semibold">
              {t("waterGoalOf", { goal: minimumWater })}
            </Text>
          </Animated.View>
        )}
        {isGoalAchieved && (
          <Animated.View
            entering={FadeIn.delay(ANIMATION_DURATION)}
            exiting={FadeOut.duration(ANIMATION_DURATION)}
            className="items-center"
          >
            <FontAwesome
              name="check-circle"
              size={32}
              color={colors.green[500]}
            />
            <Text className="text-lg font-semibold text-green-600 mt-1 text-center px-4">
              {t("youDrankEnoughWaterToday")}
            </Text>
            <Text className="text-sm text-green-500 mt-1 font-semibold">
              {water}ml {t("waterGoalOf", { goal: minimumWater })}
            </Text>
          </Animated.View>
        )}
      </LayoutAnimationConfig>
    </CircularProgress>
  );
}
