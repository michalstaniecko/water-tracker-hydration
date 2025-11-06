import { FlatList, Text, View } from "react-native";
import { useWaterStore } from "@/stores/water";
import { convertDateFormat } from "@/utils/date";
import { DEFAULT_DATE_FORMAT } from "@/config/date";
import { useSetupStore } from "@/stores/setup";
import ErrorBoundary from "@/components/ErrorBoundary";

const possibleDateFormatsFrom = [
  "MM/DD/YYYY",
  "DD/M/YYYY",
  "M/D/YYYY",
  DEFAULT_DATE_FORMAT,
];

export default function History() {
  const { getSortedHistory, hasHistory } = useWaterStore();

  if (!hasHistory) {
    return (
      <View className={"flex-1 p-5"}>
        <Text>No history available. Drink some water.</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary componentName="History Screen">
      <FlatList
        className={"flex-1 p-5"}
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
    <View key={date} className={"flex-row py-2 border-b justify-between"}>
      <Text>{convertedDate}</Text>
      <Text>{water}ml</Text>
    </View>
  );
}
