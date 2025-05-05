import { FlatList, Text, View } from "react-native";
import { useWaterStore } from "@/stores/water";

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
    <FlatList
      className={"flex-1 p-5"}
      contentContainerClassName={"gap-1"}
      data={getSortedHistory()}
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
