import { Pressable, Text } from "react-native";
import { useWater } from "@/hooks/useWater";

export default function AddWater() {
  const { addWater } = useWater();
  return (
    <Pressable onPress={addWater} className={"active:opacity-50"}>
      <Text
        className={
          "bg-blue-500 border border-blue-500 text-white px-3 py-2 rounded"
        }
      >
        Add glass
      </Text>
    </Pressable>
  );
}
