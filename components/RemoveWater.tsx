import { Pressable, Text } from "react-native";
import { useWater } from "@/hooks/useWater";
import { useSetupStore } from "@/stores/setup";

export default function RemoveWater() {
  const { removeWater, water } = useWater();
  const { glassCapacity } = useSetupStore();

  const defaultClasses =
    "border-blue-500 border text-blue-500 px-3 py-3 rounded text-center font-semibold";

  const variantStyles = {
    default: "",
    disabled:
      "border-blue-500 border text-blue-500 px-3 py-3 rounded text-center font-semibold opacity-30",
  };

  const getVariant = () => {
    if (Number(water) > 0) {
      return "default";
    }
    return "disabled";
  };

  return (
    <Pressable
      onPress={removeWater}
      className={`${getVariant() !== "disabled" ? "active:opacity-50" : ""}`}
    >
      <Text className={`${defaultClasses} ${variantStyles[getVariant()]}`}>
        Remove {glassCapacity}ml
      </Text>
    </Pressable>
  );
}
