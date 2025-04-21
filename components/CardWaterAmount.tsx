import { Card } from "@/components/ui/Card";
import { useWater } from "@/hooks/useWater";
import { Text, View } from "react-native";

export default function CardWaterAmount() {
  const { water, percentOfDailyWater } = useWater();

  return (
    <>
      <Card className={"flex-1 p-0"} backgroundColor={"bg-white"}>
        <View className={"relative z-10"}>
          <Text className={`text-lg font-semibold text-gray-900`}>
            {`${water}ml`}
          </Text>
          <Text className={"text-gray-700"}>Water amount</Text>
        </View>
        <View
          className={
            "absolute bottom-0 left-0 right-0 top-0  overflow-hidden rounded-lg"
          }
        >
          <View
            className={
              "absolute z-10 bottom-0 left-0 right-0 bg-blue-300 transition-[height] duration-300"
            }
            style={{ height: `${percentOfDailyWater}%` }}
          ></View>
        </View>
      </Card>
    </>
  );
}
