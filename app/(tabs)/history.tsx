import { Text, View } from "react-native";
import { useWaterStore } from "@/stores/water";

export default function History() {
  const { history, hasHistory } = useWaterStore();
  return (
    <View>
      <Text>History</Text>
      {history &&
        hasHistory() &&
        Object.keys(history).map((date) => {
          const { water } = history[date];
          return (
            <View key={date}>
              <Text>{date}</Text>
              <Text>{water}ml</Text>
            </View>
          );
        })}
    </View>
  );
}
