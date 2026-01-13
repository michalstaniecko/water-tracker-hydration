import { Pressable, Text } from "react-native";
import { useWater } from "@/hooks/useWater";
import { useSetupStore } from "@/stores/setup";
import { useTranslation } from "react-i18next";
import { useHaptics } from "@/hooks/useHaptics";

export default function RemoveWater() {
  const { t } = useTranslation();
  const { removeWater, water } = useWater();
  const { glassCapacity } = useSetupStore();
  const { impactLight } = useHaptics();

  const handleRemoveWater = () => {
    // Only trigger haptic feedback when removal will actually occur
    // This check ensures feedback is only given for successful actions
    if (Number(water) > 0) {
      impactLight();
      removeWater();
    }
  };

  const defaultClasses =
    "border-blue-500 border text-blue-500 text-lg px-3 py-3 rounded text-center font-semibold";

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
      onPress={handleRemoveWater}
      className={`${getVariant() !== "disabled" ? "active:opacity-50" : ""}`}
    >
      <Text className={`${defaultClasses} ${variantStyles[getVariant()]}`}>
        {t(`removeWaterButton`, { capacity: glassCapacity })}
      </Text>
    </Pressable>
  );
}
