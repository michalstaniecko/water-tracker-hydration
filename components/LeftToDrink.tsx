import { Text, View } from "react-native";
import { useWater } from "@/hooks/useWater";

export default function LeftToDrink() {
  const { leftToDrink } = useWater();
  return (
    <View>
      {leftToDrink > 0 && <Text>Left to drink: {leftToDrink}ml</Text>}
      {leftToDrink <= 0 && (
        <Text
          className={
            "text-green-500 font-semibold p-2 border border-green-500 rounded"
          }
        >
          You drank enough water today!
        </Text>
      )}
    </View>
  );
}
