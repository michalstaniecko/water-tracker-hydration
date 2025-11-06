import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useStatisticsStore, PeriodType } from "@/stores/statistics";
import { Card } from "@/components/ui/Card";
import { LineChart } from "react-native-chart-kit";
import ErrorBoundary from "@/components/ErrorBoundary";
import dayjs from "@/plugins/dayjs";

export default function Statistics() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<PeriodType>("week");
  const { getPeriodStats, getBestDay, getCurrentStreak } = useStatisticsStore();

  const stats = getPeriodStats(period);
  const bestDay = getBestDay(period);
  const streak = getCurrentStreak();

  const screenWidth = Dimensions.get("window").width;

  // Prepare chart data
  const chartData = {
    labels: stats.dailyData.map((d) => {
      const date = dayjs(d.date);
      return period === "week" ? date.format("ddd") : date.format("D");
    }),
    datasets: [
      {
        data: stats.dailyData.map((d) => d.amount || 0),
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // blue-500
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#f3f4f6",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#2563eb",
    },
  };

  const hasData = stats.daysTracked > 0;

  return (
    <ErrorBoundary componentName="Statistics Screen">
      <ScrollView className="flex-1 bg-white">
        <View className="p-5 gap-3">
          {/* Period selector */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              className={`flex-1 p-4 rounded-lg ${period === "week" ? "bg-blue-600" : "bg-gray-200"}`}
              onPress={() => setPeriod("week")}
            >
              <Text
                className={`text-center font-semibold ${period === "week" ? "text-white" : "text-gray-700"}`}
              >
                {t("weeklyView")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 p-4 rounded-lg ${period === "month" ? "bg-blue-600" : "bg-gray-200"}`}
              onPress={() => setPeriod("month")}
            >
              <Text
                className={`text-center font-semibold ${period === "month" ? "text-white" : "text-gray-700"}`}
              >
                {t("monthlyView")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Chart */}
          {hasData ? (
            <View className="bg-white rounded-lg overflow-hidden shadow-sm">
              <Text className="text-lg font-semibold p-4 pb-2">
                {t("waterIntakeChart")}
              </Text>
              <LineChart
                data={chartData}
                width={screenWidth - 40}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
                withInnerLines={false}
                withOuterLines={true}
                withVerticalLabels={true}
                withHorizontalLabels={true}
              />
            </View>
          ) : (
            <Card title={t("noDataAvailable")} backgroundColor="bg-gray-100" />
          )}

          {/* Progress Summary */}
          <Text className="text-xl font-bold mt-2">{t("progressSummary")}</Text>

          {/* Stats Cards */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Card
                title={`${stats.average}ml`}
                description={t("average")}
                backgroundColor="bg-blue-50"
              />
            </View>
            <View className="flex-1">
              <Card
                title={`${stats.total}ml`}
                description={t("total")}
                backgroundColor="bg-blue-50"
              />
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Card
                title={`${stats.daysTracked}`}
                description={t("daysTracked")}
                backgroundColor="bg-green-50"
              />
            </View>
            <View className="flex-1">
              <Card
                title={`${stats.goalMetPercentage}%`}
                description={t("goalAchieved")}
                backgroundColor="bg-green-50"
              />
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Card
                title={`${streak} ${t("days")}`}
                description={t("currentStreak")}
                backgroundColor="bg-yellow-50"
              />
            </View>
            {bestDay && (
              <View className="flex-1">
                <Card
                  title={`${bestDay.amount}ml`}
                  description={t("bestDay")}
                  backgroundColor="bg-yellow-50"
                />
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ErrorBoundary>
  );
}
