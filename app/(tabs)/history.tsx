import { Text, View } from "react-native";
import { useHistoryStore } from "@/stores/history";
import { useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";

export default function History() {
  const [history, setHistory] = useState<{ date: string; amount: string }[]>();
  const { getHistoryList } = useHistoryStore();

  useFocusEffect(() => {
    const fetchHistory = async () => {
      const historyList = await getHistoryList();
      if (!historyList) {
        return;
      }
      setHistory(historyList);
    };
    fetchHistory();
  });

  return (
    <View>
      <Text>History</Text>
      {history && history.length > 0 && (
        <View>
          {history.map(({ date, amount }, index) => (
            <Text key={index}>
              {date}: {amount}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}
