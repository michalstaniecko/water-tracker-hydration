import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { triggerHapticFeedback, HapticType } from "../useHaptics";

// Mock expo-haptics
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: "light",
    Medium: "medium",
    Heavy: "heavy",
  },
  NotificationFeedbackType: {
    Success: "success",
    Warning: "warning",
    Error: "error",
  },
}));

describe("triggerHapticFeedback", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = "ios";
  });

  describe("haptic types", () => {
    it("should trigger impactLight haptic correctly", async () => {
      await triggerHapticFeedback("impactLight", true);
      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light
      );
    });

    it("should trigger impactMedium haptic correctly", async () => {
      await triggerHapticFeedback("impactMedium", true);
      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Medium
      );
    });

    it("should trigger impactHeavy haptic correctly", async () => {
      await triggerHapticFeedback("impactHeavy", true);
      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Heavy
      );
    });

    it("should trigger notificationSuccess haptic correctly", async () => {
      await triggerHapticFeedback("notificationSuccess", true);
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Success
      );
    });

    it("should trigger notificationWarning haptic correctly", async () => {
      await triggerHapticFeedback("notificationWarning", true);
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Warning
      );
    });

    it("should trigger notificationError haptic correctly", async () => {
      await triggerHapticFeedback("notificationError", true);
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Error
      );
    });

    it("should trigger selection haptic correctly", async () => {
      await triggerHapticFeedback("selection", true);
      expect(Haptics.selectionAsync).toHaveBeenCalled();
    });
  });

  describe("enabled parameter", () => {
    it("should trigger haptics when enabled is true", async () => {
      await triggerHapticFeedback("impactMedium", true);
      expect(Haptics.impactAsync).toHaveBeenCalled();
    });

    it("should not trigger haptics when enabled is false", async () => {
      await triggerHapticFeedback("impactMedium", false);
      expect(Haptics.impactAsync).not.toHaveBeenCalled();
    });

    it("should default enabled to true when not provided", async () => {
      await triggerHapticFeedback("impactLight");
      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light
      );
    });
  });

  describe("platform support", () => {
    it("should trigger haptics on iOS", async () => {
      Platform.OS = "ios";
      await triggerHapticFeedback("impactMedium", true);
      expect(Haptics.impactAsync).toHaveBeenCalled();
    });

    it("should trigger haptics on Android", async () => {
      Platform.OS = "android";
      await triggerHapticFeedback("impactMedium", true);
      expect(Haptics.impactAsync).toHaveBeenCalled();
    });

    it("should not trigger haptics on web", async () => {
      // Platform check is evaluated at module load time (IS_HAPTICS_SUPPORTED constant)
      // To properly test web platform, we need to isolate the module
      jest.isolateModules(() => {
        Platform.OS = "web";
        const { triggerHapticFeedback: webTrigger } = require("../useHaptics");
        webTrigger("impactMedium", true);
        expect(Haptics.impactAsync).not.toHaveBeenCalled();
      });
    });
  });

  describe("error handling", () => {
    it("should silently fail when haptics throw an error", async () => {
      (Haptics.impactAsync as jest.Mock).mockRejectedValue(
        new Error("Haptics error")
      );

      // Should not throw
      await expect(
        triggerHapticFeedback("impactMedium", true)
      ).resolves.not.toThrow();
    });

    it("should silently fail for notification haptics errors", async () => {
      (Haptics.notificationAsync as jest.Mock).mockRejectedValue(
        new Error("Notification haptics error")
      );

      await expect(
        triggerHapticFeedback("notificationSuccess", true)
      ).resolves.not.toThrow();
    });

    it("should silently fail for selection haptics errors", async () => {
      (Haptics.selectionAsync as jest.Mock).mockRejectedValue(
        new Error("Selection haptics error")
      );

      await expect(
        triggerHapticFeedback("selection", true)
      ).resolves.not.toThrow();
    });
  });

  describe("all haptic types integration", () => {
    it("should correctly map all haptic types to their Expo counterparts", async () => {
      const testCases: Array<{
        type: HapticType;
        expectedMethod: jest.Mock;
        expectedArg?: string;
      }> = [
        {
          type: "impactLight",
          expectedMethod: Haptics.impactAsync as jest.Mock,
          expectedArg: Haptics.ImpactFeedbackStyle.Light,
        },
        {
          type: "impactMedium",
          expectedMethod: Haptics.impactAsync as jest.Mock,
          expectedArg: Haptics.ImpactFeedbackStyle.Medium,
        },
        {
          type: "impactHeavy",
          expectedMethod: Haptics.impactAsync as jest.Mock,
          expectedArg: Haptics.ImpactFeedbackStyle.Heavy,
        },
        {
          type: "notificationSuccess",
          expectedMethod: Haptics.notificationAsync as jest.Mock,
          expectedArg: Haptics.NotificationFeedbackType.Success,
        },
        {
          type: "notificationWarning",
          expectedMethod: Haptics.notificationAsync as jest.Mock,
          expectedArg: Haptics.NotificationFeedbackType.Warning,
        },
        {
          type: "notificationError",
          expectedMethod: Haptics.notificationAsync as jest.Mock,
          expectedArg: Haptics.NotificationFeedbackType.Error,
        },
        {
          type: "selection",
          expectedMethod: Haptics.selectionAsync as jest.Mock,
        },
      ];

      for (const testCase of testCases) {
        jest.clearAllMocks();
        await triggerHapticFeedback(testCase.type, true);

        expect(testCase.expectedMethod).toHaveBeenCalled();
        if (testCase.expectedArg) {
          expect(testCase.expectedMethod).toHaveBeenCalledWith(
            testCase.expectedArg
          );
        }
      }
    });
  });
});
