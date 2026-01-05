import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { useSetupStore } from "@/stores/setup";

export type HapticType =
  | "impactLight"
  | "impactMedium"
  | "impactHeavy"
  | "notificationSuccess"
  | "notificationWarning"
  | "notificationError"
  | "selection";

/**
 * Hook for haptic feedback functionality
 * Provides different types of haptic feedback that can be triggered
 * Respects user preference for haptic feedback (can be disabled in settings)
 */
export function useHaptics() {
  const { hapticsEnabled } = useSetupStore();

  const isHapticsSupported = Platform.OS === "ios" || Platform.OS === "android";

  const triggerHaptic = async (type: HapticType) => {
    if (!hapticsEnabled || !isHapticsSupported) {
      return;
    }

    try {
      switch (type) {
        case "impactLight":
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case "impactMedium":
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case "impactHeavy":
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case "notificationSuccess":
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
          break;
        case "notificationWarning":
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Warning
          );
          break;
        case "notificationError":
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error
          );
          break;
        case "selection":
          await Haptics.selectionAsync();
          break;
      }
    } catch {
      // Silently fail - haptics is not critical functionality
    }
  };

  return {
    triggerHaptic,
    impactLight: () => triggerHaptic("impactLight"),
    impactMedium: () => triggerHaptic("impactMedium"),
    impactHeavy: () => triggerHaptic("impactHeavy"),
    notificationSuccess: () => triggerHaptic("notificationSuccess"),
    notificationWarning: () => triggerHaptic("notificationWarning"),
    notificationError: () => triggerHaptic("notificationError"),
    selection: () => triggerHaptic("selection"),
    isHapticsSupported,
    isEnabled: hapticsEnabled,
  };
}

/**
 * Standalone function for triggering haptics outside of React components
 * Used in stores or other non-component contexts
 * @param type - The type of haptic feedback to trigger
 * @param enabled - Whether haptics are enabled (should be passed from store)
 */
export async function triggerHapticFeedback(
  type: HapticType,
  enabled: boolean = true
) {
  const isHapticsSupported = Platform.OS === "ios" || Platform.OS === "android";

  if (!enabled || !isHapticsSupported) {
    return;
  }

  try {
    switch (type) {
      case "impactLight":
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case "impactMedium":
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case "impactHeavy":
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case "notificationSuccess":
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
        break;
      case "notificationWarning":
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning
        );
        break;
      case "notificationError":
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case "selection":
        await Haptics.selectionAsync();
        break;
    }
  } catch {
    // Silently fail - haptics is not critical functionality
  }
}
