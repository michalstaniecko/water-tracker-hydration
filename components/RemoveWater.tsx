import { Pressable, Text } from "react-native";
import { useWater } from "@/hooks/useWater";

export default function RemoveWater() {
  const { removeWater, water } = useWater();

  const variantStyles = {
    default: "border-blue-500 border text-blue-500 px-3 py-2 rounded",
    disabled:
      "border-blue-500 border text-blue-500 px-3 py-2 rounded opacity-30",
  };

  const getVariant = () => {
    if (water > 0) {
      return "default";
    }
    return "disabled";
  };

  return (
    <Pressable onPress={removeWater} className={"active:opacity-50"}>
      <Text className={`${variantStyles[getVariant()]}`}>Remove glass</Text>
    </Pressable>
  );
}
