import { FlatList, Text, View } from "react-native";
import { useWaterStore } from "@/stores/water";
import { convertDateFormat } from "@/utils/date";
import { DEFAULT_DATE_FORMAT } from "@/config/date";
import { useSetupStore } from "@/stores/setup";
import ErrorBoundary from "@/components/ErrorBoundary";

const possibleDateFormatsFrom = [
  "YYYY-MM-DD", // ISO format (common in backups)
  "MM/DD/YYYY",
  "DD/M/YYYY",
  "M/D/YYYY",
  DEFAULT_DATE_FORMAT,
];

export default function History() {
  const { getSortedHistory, hasHistory } = useWaterStore();

  if (!hasHistory) {
    return (
      <View className={"flex-1 bg-white dark:bg-gray-950 p-5"}>
        <Text className="text-gray-900 dark:text-gray-100">
          No history available. Drink some water.
        </Text>
      </View>
    );
  }

  return (
    <ErrorBoundary componentName="History Screen">
      <FlatList
        className={"flex-1 bg-white dark:bg-gray-950 p-5"}
        contentContainerClassName={"gap-1"}
        data={getSortedHistory()}
        renderItem={({ item }) => <Item date={item.date} water={item.water} />}
      ></FlatList>
    </ErrorBoundary>
  );
}

function Item({ date, water }: { date: string; water: string }) {
  const { dateFormat } = useSetupStore();
  const convertedDate = convertDateFormat(
    date,
    possibleDateFormatsFrom,
    dateFormat,
  );
  return (
    <View
      key={date}
      className={
        "flex-row py-2 border-b border-gray-200 dark:border-gray-700 justify-between"
      }
    >
      <Text className="text-gray-900 dark:text-gray-100">{convertedDate}</Text>
      <Text className="text-gray-900 dark:text-gray-100">{water}ml</Text>
    </View>
  );
}
