import { Card } from "@/components/ui/Card";
import { Text, View } from "react-native";
import { useSetupStore, SetupOptions } from "@/stores/setup";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function CardDayProgress() {
  const setupStore = useSetupStore();
  const [time, setTime] = useState(dayjs().format("HH:mm"));
  const { t } = useTranslation();

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(dayjs().format("HH:mm"));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card backgroundColor="bg-white">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          <FontAwesome name="clock-o" size={16} color="#64707e" />
          <Text className="text-lg font-semibold text-gray-900">{time}</Text>
        </View>
        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center gap-1">
            <FontAwesome name="sun-o" size={12} color="#64707e" />
            <Text className="text-sm font-semibold text-gray-600">
              {setupStore[SetupOptions.DAY].startHour}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <FontAwesome name="moon-o" size={12} color="#64707e" />
            <Text className="text-sm font-semibold text-gray-600">
              {setupStore[SetupOptions.DAY].endHour}
            </Text>
          </View>
        </View>
      </View>
      <AnimatedBar />
      <Text className="text-gray-500 text-xs mt-1">{t("dayProgress")}</Text>
    </Card>
  );
}

const AnimatedBar = () => {
  const setupStore = useSetupStore();
  const dayProgress = setupStore.getDayProgress();
  const width = useSharedValue<number>(dayProgress || 0);

  const widthPercent = useDerivedValue<`${number}%`>(() => {
    return `${width.value}%`;
  });

  const widthStyle = useAnimatedStyle(() => ({
    width: widthPercent.value,
  }));

  useEffect(() => {
    width.value = dayProgress;
  }, [dayProgress, width]);

  return (
    <View className="h-3 rounded-full bg-green-100 overflow-hidden">
      <Animated.View
        className="h-full rounded-full bg-green-500"
        style={widthStyle}
      />
    </View>
  );
};
