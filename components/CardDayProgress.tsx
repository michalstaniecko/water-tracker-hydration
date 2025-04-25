import { Card } from "@/components/ui/Card";
import { Text, View } from "react-native";
import { SetupOptions, useSetupStore } from "@/stores/setup";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";

export default function CardDayProgress() {
  const setupStore = useSetupStore();
  const [time, setTime] = useState(dayjs().format("HH:mm"));

  useEffect(() => {
    const interval = setInterval(() => {
      const now = dayjs();
      setTime(now.format("HH:mm"));
    }, 10000); // Update every ten seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Card className={"p-0 flex-1 h-[200]"} backgroundColor={"bg-white"}>
        <View className={"relative z-10"}>
          <Text className={`text-lg font-semibold text-gray-900`}>
            Time: {`${time}`}
          </Text>
          <Text className={"font-semibold text-gray-600"}>
            Start:{setupStore[SetupOptions.DAY].startHour}:00
          </Text>
          <Text className={"font-semibold text-gray-600"}>
            End: {setupStore[SetupOptions.DAY].endHour}:00
          </Text>
          <Text className={"text-gray-700"}>Day progress</Text>
        </View>
        <View
          className={
            "absolute bottom-0 left-0 right-0 top-0 bg-green-100 overflow-hidden rounded-lg"
          }
        >
          <AnimatedView />
        </View>
      </Card>
    </>
  );
}

const AnimatedView = () => {
  const setupStore = useSetupStore();
  const height = useSharedValue<number>(setupStore.getDayProgress() || 0);

  const heightPercent = useDerivedValue<`${number}%`>(() => {
    return `${height.value}%`;
  });

  const heightStyle = useAnimatedStyle(() => ({
    height: heightPercent.value,
  }));

  useEffect(() => {
    height.value = setupStore.getDayProgress();
  }, [setupStore.getDayProgress()]);

  return (
    <Animated.View
      className={
        "absolute z-10 bottom-0 left-0 right-0 bg-orange-200 transition-[height] duration-300"
      }
      style={heightStyle}
    ></Animated.View>
  );
};
