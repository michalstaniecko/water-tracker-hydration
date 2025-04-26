import { FlatList, ScrollView, Text, View } from "react-native";
import { HistoryRows, useWaterStore } from "@/stores/water";
import { useEffect, useState } from "react";

export default function History() {
  const { history } = useWaterStore();
  const [sortedData, setSortedData] = useState<
    {
      water: string;
      date: string;
    }[]
  >();

  useEffect(() => {
    if (!history) return;
    setSortedData(
      Object.keys(history)
        .reverse()
        .map((date) => ({
          water: history[date].water,
          date: date,
        })),
    );
  }, [history]);

  if (!sortedData) {
    return (
      <View className={"flex-1 p-5"}>
        <Text>No history available. Drink some water.</Text>
      </View>
    );
  }

  return (
    <FlatList
      className={"flex-1 p-5"}
      contentContainerClassName={"gap-1"}
      data={sortedData}
      renderItem={({ item }) => <Item date={item.date} water={item.water} />}
    ></FlatList>
  );
}

function Item({ date, water }: { date: string; water: string }) {
  return (
    <View key={date} className={"flex-row py-2 border-b justify-between"}>
      <Text>{date}</Text>
      <Text>{water}ml</Text>
    </View>
  );
}
