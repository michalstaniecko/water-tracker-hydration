import { Pressable, Text } from "react-native";
import { useWater } from "@/hooks/useWater";
import { useSetupStore } from "@/stores/setup";

export default function AddWater() {
  const { addWater } = useWater();
  const { glassCapacity } = useSetupStore();
  return (
    <Pressable onPress={addWater} className={"active:opacity-50"}>
      <Text
        className={
          "bg-blue-500 border border-blue-500 text-white px-3 py-3 rounded text-center font-semibold"
        }
      >
        Add {glassCapacity}ml
      </Text>
    </Pressable>
  );
}
