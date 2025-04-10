import { Pressable, Text, View } from "react-native";
import { useWaterStore } from "@/stores/water";
import { useSetupStore } from "@/stores/setup";

export default function Index() {
  const { water, addWater } = useWater();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Water amount: {water}</Text>
      <Pressable onPress={addWater}>
        <Text>Add water</Text>
      </Pressable>
    </View>
  );
}

function useWater() {
  const waterStore = useWaterStore();
  const setupStore = useSetupStore();

  const addWater = () => {
    waterStore.addWater(setupStore.glassCapacity);
  };

  return {
    water: waterStore.water,
    addWater,
  };
}
