import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { useSetupStore } from "@/stores/setup";
import { logWarning } from "@/utils/errorLogging";

export type HapticType =
  | "impactLight"
  | "impactMedium"
  | "impactHeavy"
  | "notificationSuccess"
  | "notificationWarning"
  | "notificationError"
  | "selection";

/** Whether the current platform supports haptic feedback */
export const IS_HAPTICS_SUPPORTED = Platform.OS === "ios" || Platform.OS === "android";

/**
 * Core function that executes the haptic feedback
 * Extracted to avoid code duplication between hook and standalone function
 */
async function executeHaptic(type: HapticType): Promise<void> {
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
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      break;
    case "notificationWarning":
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      break;
    case "notificationError":
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      break;
    case "selection":
      await Haptics.selectionAsync();
      break;
  }
}

/**
 * Hook for haptic feedback functionality
 * Provides different types of haptic feedback that can be triggered
 * Respects user preference for haptic feedback (can be disabled in settings)
 *
 * @returns Object containing:
 * - triggerHaptic: Generic function to trigger any haptic type
 * - impactLight/Medium/Heavy: Convenience methods for impact feedback
 * - notificationSuccess/Warning/Error: Convenience methods for notification feedback
 * - selection: Convenience method for selection feedback
 * - isHapticsSupported: Whether the platform supports haptics
 * - isEnabled: Current user preference for haptics
 */
export function useHaptics() {
  const { hapticsEnabled } = useSetupStore();

  const triggerHaptic = async (type: HapticType): Promise<void> => {
    if (!hapticsEnabled || !IS_HAPTICS_SUPPORTED) {
      return;
    }

    try {
      await executeHaptic(type);
    } catch (error) {
      // Silently fail in production - haptics is not critical functionality
      // Log warning in dev mode for debugging
      if (__DEV__) {
        logWarning(`Haptic feedback failed: ${type}`, {
          operation: "triggerHaptic",
          component: "useHaptics",
          data: { type, error: error instanceof Error ? error.message : String(error) },
        });
      }
    }
  };

  return {
    triggerHaptic,
    impactLight: (): Promise<void> => triggerHaptic("impactLight"),
    impactMedium: (): Promise<void> => triggerHaptic("impactMedium"),
    impactHeavy: (): Promise<void> => triggerHaptic("impactHeavy"),
    notificationSuccess: (): Promise<void> => triggerHaptic("notificationSuccess"),
    notificationWarning: (): Promise<void> => triggerHaptic("notificationWarning"),
    notificationError: (): Promise<void> => triggerHaptic("notificationError"),
    selection: (): Promise<void> => triggerHaptic("selection"),
    isHapticsSupported: IS_HAPTICS_SUPPORTED,
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
): Promise<void> {
  if (!enabled || !IS_HAPTICS_SUPPORTED) {
    return;
  }

  try {
    await executeHaptic(type);
  } catch (error) {
    // Silently fail in production - haptics is not critical functionality
    // Log warning in dev mode for debugging
    if (__DEV__) {
      logWarning(`Haptic feedback failed: ${type}`, {
        operation: "triggerHapticFeedback",
        component: "useHaptics",
        data: { type, error: error instanceof Error ? error.message : String(error) },
      });
    }
  }
}
