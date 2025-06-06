import { Card } from "@/components/ui/Card";
import { useWater } from "@/hooks/useWater";
import { Text, View } from "react-native";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function CardWaterAmount() {
  const { t } = useTranslation();
  const { water, percentOfDailyWater } = useWater();

  useEffect(() => {}, [percentOfDailyWater]);

  return (
    <>
      <Card className={"p-0 flex-[2] h-[200]"} backgroundColor={"bg-white"}>
        <View className={"relative z-10 h-full"}>
          <Text className={`text-lg font-semibold text-gray-900`}>
            {`${water}ml`}
          </Text>
          <Text className={"text-gray-700 mt-auto"}>
            {t("todayWaterAmount")}
          </Text>
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
