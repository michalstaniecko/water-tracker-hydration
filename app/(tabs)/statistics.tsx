import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from "react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useStatisticsStore, PeriodType } from "@/stores/statistics";
import { Card } from "@/components/ui/Card";
import { LineChart } from "react-native-gifted-charts";
import ErrorBoundary from "@/components/ErrorBoundary";
import dayjs from "@/plugins/dayjs";
import { DEFAULT_DATE_FORMAT } from "@/config/date";
import { useWaterStore } from "@/stores/water";
import { convertDateFormat } from "@/utils/date";
import { useSetupStore } from "@/stores/setup";

type TabType = "week" | "month" | "history";

const possibleDateFormatsFrom = [
  "YYYY-MM-DD", // ISO format (common in backups)
  "MM/DD/YYYY",
  "DD/M/YYYY",
  "M/D/YYYY",
  DEFAULT_DATE_FORMAT,
];

export default function Statistics() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>("week");
  const { getPeriodStats, getBestDay, getCurrentStreak } = useStatisticsStore();
  // Subscribe to water history to trigger re-render when water data changes
  useWaterStore((state) => state.history);

  const period: PeriodType = activeTab === "month" ? "month" : "week";
  const stats = getPeriodStats(period);
  const bestDay = getBestDay(period);
  const streak = getCurrentStreak();

  const screenWidth = Dimensions.get("window").width;
  const hasData = stats.daysTracked > 0;

  // Prepare chart data only if there's data to display
  const chartData = hasData
    ? stats.dailyData.map((d) => {
        const date = dayjs(d.date, DEFAULT_DATE_FORMAT);
        return {
          value: d.amount || 0,
          label: period === "week" ? date.format("ddd") : date.format("D"),
        };
      })
    : [];

  return (
    <ErrorBoundary componentName="Statistics Screen">
      <ScrollView className="flex-1 bg-white">
        <View className="p-5 gap-3">
          {/* Tab selector */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              className={`flex-1 p-4 rounded-lg ${activeTab === "week" ? "bg-blue-600" : "bg-gray-200"}`}
              onPress={() => setActiveTab("week")}
            >
              <Text
                className={`text-center font-semibold ${activeTab === "week" ? "text-white" : "text-gray-700"}`}
              >
                {t("weeklyView")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 p-4 rounded-lg ${activeTab === "month" ? "bg-blue-600" : "bg-gray-200"}`}
              onPress={() => setActiveTab("month")}
            >
              <Text
                className={`text-center font-semibold ${activeTab === "month" ? "text-white" : "text-gray-700"}`}
              >
                {t("monthlyView")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 p-4 rounded-lg ${activeTab === "history" ? "bg-blue-600" : "bg-gray-200"}`}
              onPress={() => setActiveTab("history")}
            >
              <Text
                className={`text-center font-semibold ${activeTab === "history" ? "text-white" : "text-gray-700"}`}
              >
                {t("history")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content based on active tab */}
          {activeTab === "history" ? (
            <HistoryView />
          ) : (
            <>
              {/* Chart */}
              {hasData ? (
                <View className="bg-white rounded-lg overflow-hidden shadow-sm p-4">
                  <Text className="text-lg font-semibold pb-2">
                    {t("waterIntakeChart")}
                  </Text>
                  <LineChart
                    scrollToEnd={true}
                    data={chartData}
                    width={screenWidth - 80}
                    height={220}
                    color="#3b82f6"
                    thickness={2}
                    dataPointsColor="#2563eb"
                    dataPointsRadius={4}
                    spacing={
                      period === "month"
                        ? 40
                        : (screenWidth - 120) /
                          Math.max(chartData.length - 1, 1)
                    }
                    initialSpacing={20}
                    endSpacing={20}
                    noOfSections={5}
                    yAxisColor="#e5e7eb"
                    xAxisColor="#e5e7eb"
                    yAxisTextStyle={{ color: "#6b7280", fontSize: 10 }}
                    xAxisLabelTextStyle={{
                      color: "#6b7280",
                      fontSize: 9,
                      marginLeft: 0,
                    }}
                    showVerticalLines
                    verticalLinesColor="#f3f4f6"
                    backgroundColor="#ffffff"
                    rulesColor="#e5e7eb"
                    showReferenceLine1
                    referenceLine1Config={{
                      color: "#93c5fd",
                      dashWidth: 2,
                      dashGap: 3,
                    }}
                  />
                </View>
              ) : (
                <Card
                  title={t("noDataAvailable")}
                  backgroundColor="bg-gray-100"
                />
              )}

              {/* Progress Summary */}
              <Text className="text-xl font-bold mt-2">
                {t("progressSummary")}
              </Text>

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
            </>
          )}
        </View>
      </ScrollView>
    </ErrorBoundary>
  );
}

function HistoryView() {
  const { getSortedHistory, hasHistory } = useWaterStore();
  const { dateFormat } = useSetupStore();
  const { t } = useTranslation();

  if (!hasHistory()) {
    return (
      <View className="bg-gray-100 p-8 rounded-lg items-center">
        <Text className="text-gray-600 text-center text-base">
          {t("noHistoryAvailable")}
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-lg overflow-hidden shadow-sm">
      <View className="flex-row bg-blue-600 p-4 border-b border-gray-200">
        <Text className="flex-1 font-bold text-white text-base">
          {t("date")}
        </Text>
        <Text className="w-24 font-bold text-white text-base text-right">
          {t("amount")}
        </Text>
      </View>
      <FlatList
        scrollEnabled={false}
        data={getSortedHistory()}
        keyExtractor={(item) => item.date}
        renderItem={({ item, index }) => (
          <HistoryItem
            date={item.date}
            water={item.water}
            dateFormat={dateFormat}
            isOdd={index % 2 === 1}
          />
        )}
      />
    </View>
  );
}

function HistoryItem({
  date,
  water,
  dateFormat,
  isOdd,
}: {
  date: string;
  water: string;
  dateFormat: string;
  isOdd: boolean;
}) {
  const convertedDate = convertDateFormat(
    date,
    possibleDateFormatsFrom,
    dateFormat,
  );
  return (
    <View
      className={`flex-row p-4 border-b border-gray-200 ${isOdd ? "bg-gray-50" : "bg-white"}`}
    >
      <Text className="flex-1 text-gray-800 text-base">{convertedDate}</Text>
      <Text className="w-24 text-gray-800 text-base text-right font-semibold">
        {water}ml
      </Text>
    </View>
  );
}
