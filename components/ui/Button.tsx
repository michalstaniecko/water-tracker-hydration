import { Pressable, Text } from "react-native";
import { useHaptics, HapticType } from "@/hooks/useHaptics";

type ButtonProps = {
  text: string;
  onPress?: () => void;
  disabled?: boolean;
  /**
   * Enable haptic feedback on button press.
   * - `true`: Uses "impactMedium" feedback
   * - `HapticType`: Uses the specified feedback type (e.g., "impactLight", "notificationSuccess")
   * - `false` or omitted: No haptic feedback
   */
  haptic?: HapticType | boolean;
};
export default function Button({
  text,
  onPress,
  disabled,
  haptic,
}: ButtonProps) {
  const { triggerHaptic } = useHaptics();

  const handlePress = () => {
    if (!disabled) {
      if (haptic) {
        const hapticType =
          typeof haptic === "boolean" ? "impactMedium" : haptic;
        triggerHaptic(hapticType);
      }
      onPress?.();
    }
  };
  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      className={
        disabled
          ? "bg-gray-400 p-4 rounded-lg opacity-50"
          : "bg-blue-500  p-4 rounded-lg active:opacity-50 active:bg-blue-400 transition-all"
      }
    >
      <Text className={"text-white text-lg text-center font-bold"}>{text}</Text>
    </Pressable>
  );
}
