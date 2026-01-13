import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import {
  triggerHapticFeedback,
  useHaptics,
  HapticType,
  IS_HAPTICS_SUPPORTED,
} from "../useHaptics";
import { useSetupStore } from "@/stores/setup";

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

// Mock the setup store
jest.mock("@/stores/setup", () => ({
  useSetupStore: jest.fn(),
}));

// Mock error logging
jest.mock("@/utils/errorLogging", () => ({
  logWarning: jest.fn(),
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

describe("useHaptics hook", () => {
  const mockUseSetupStore = useSetupStore as jest.MockedFunction<
    typeof useSetupStore
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = "ios";
    // Default: haptics enabled
    mockUseSetupStore.mockReturnValue({ hapticsEnabled: true } as ReturnType<
      typeof useSetupStore
    >);
  });

  describe("returned methods", () => {
    it("should return all expected methods and properties", () => {
      const result = useHaptics();

      expect(result.triggerHaptic).toBeDefined();
      expect(typeof result.triggerHaptic).toBe("function");

      expect(result.impactLight).toBeDefined();
      expect(typeof result.impactLight).toBe("function");

      expect(result.impactMedium).toBeDefined();
      expect(typeof result.impactMedium).toBe("function");

      expect(result.impactHeavy).toBeDefined();
      expect(typeof result.impactHeavy).toBe("function");

      expect(result.notificationSuccess).toBeDefined();
      expect(typeof result.notificationSuccess).toBe("function");

      expect(result.notificationWarning).toBeDefined();
      expect(typeof result.notificationWarning).toBe("function");

      expect(result.notificationError).toBeDefined();
      expect(typeof result.notificationError).toBe("function");

      expect(result.selection).toBeDefined();
      expect(typeof result.selection).toBe("function");

      expect(result.isHapticsSupported).toBeDefined();
      expect(typeof result.isHapticsSupported).toBe("boolean");

      expect(result.isEnabled).toBeDefined();
      expect(typeof result.isEnabled).toBe("boolean");
    });

    it("should return isEnabled as true when haptics are enabled in store", () => {
      mockUseSetupStore.mockReturnValue({ hapticsEnabled: true } as ReturnType<
        typeof useSetupStore
      >);
      const result = useHaptics();
      expect(result.isEnabled).toBe(true);
    });

    it("should return isEnabled as false when haptics are disabled in store", () => {
      mockUseSetupStore.mockReturnValue({ hapticsEnabled: false } as ReturnType<
        typeof useSetupStore
      >);
      const result = useHaptics();
      expect(result.isEnabled).toBe(false);
    });

    it("should return isHapticsSupported correctly based on platform", () => {
      const result = useHaptics();
      // Platform is 'ios' in beforeEach, so should be supported
      expect(result.isHapticsSupported).toBe(IS_HAPTICS_SUPPORTED);
    });
  });

  describe("triggerHaptic method", () => {
    it("should trigger haptic when enabled", async () => {
      mockUseSetupStore.mockReturnValue({ hapticsEnabled: true } as ReturnType<
        typeof useSetupStore
      >);
      const { triggerHaptic } = useHaptics();

      await triggerHaptic("impactMedium");

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Medium
      );
    });

    it("should not trigger haptic when disabled in store", async () => {
      mockUseSetupStore.mockReturnValue({ hapticsEnabled: false } as ReturnType<
        typeof useSetupStore
      >);
      const { triggerHaptic } = useHaptics();

      await triggerHaptic("impactMedium");

      expect(Haptics.impactAsync).not.toHaveBeenCalled();
    });

    it("should handle all haptic types correctly", async () => {
      mockUseSetupStore.mockReturnValue({ hapticsEnabled: true } as ReturnType<
        typeof useSetupStore
      >);
      const { triggerHaptic } = useHaptics();

      const hapticTypes: HapticType[] = [
        "impactLight",
        "impactMedium",
        "impactHeavy",
        "notificationSuccess",
        "notificationWarning",
        "notificationError",
        "selection",
      ];

      for (const type of hapticTypes) {
        jest.clearAllMocks();
        await triggerHaptic(type);

        if (type.startsWith("impact")) {
          expect(Haptics.impactAsync).toHaveBeenCalled();
        } else if (type.startsWith("notification")) {
          expect(Haptics.notificationAsync).toHaveBeenCalled();
        } else if (type === "selection") {
          expect(Haptics.selectionAsync).toHaveBeenCalled();
        }
      }
    });
  });

  describe("convenience methods", () => {
    beforeEach(() => {
      mockUseSetupStore.mockReturnValue({ hapticsEnabled: true } as ReturnType<
        typeof useSetupStore
      >);
    });

    it("impactLight should trigger light impact haptic", async () => {
      const { impactLight } = useHaptics();
      await impactLight();
      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light
      );
    });

    it("impactMedium should trigger medium impact haptic", async () => {
      const { impactMedium } = useHaptics();
      await impactMedium();
      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Medium
      );
    });

    it("impactHeavy should trigger heavy impact haptic", async () => {
      const { impactHeavy } = useHaptics();
      await impactHeavy();
      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Heavy
      );
    });

    it("notificationSuccess should trigger success notification haptic", async () => {
      const { notificationSuccess } = useHaptics();
      await notificationSuccess();
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Success
      );
    });

    it("notificationWarning should trigger warning notification haptic", async () => {
      const { notificationWarning } = useHaptics();
      await notificationWarning();
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Warning
      );
    });

    it("notificationError should trigger error notification haptic", async () => {
      const { notificationError } = useHaptics();
      await notificationError();
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Error
      );
    });

    it("selection should trigger selection haptic", async () => {
      const { selection } = useHaptics();
      await selection();
      expect(Haptics.selectionAsync).toHaveBeenCalled();
    });
  });

  describe("convenience methods when disabled", () => {
    beforeEach(() => {
      mockUseSetupStore.mockReturnValue({ hapticsEnabled: false } as ReturnType<
        typeof useSetupStore
      >);
    });

    it("should not trigger any haptics when disabled", async () => {
      const {
        impactLight,
        impactMedium,
        impactHeavy,
        notificationSuccess,
        notificationWarning,
        notificationError,
        selection,
      } = useHaptics();

      await impactLight();
      await impactMedium();
      await impactHeavy();
      await notificationSuccess();
      await notificationWarning();
      await notificationError();
      await selection();

      expect(Haptics.impactAsync).not.toHaveBeenCalled();
      expect(Haptics.notificationAsync).not.toHaveBeenCalled();
      expect(Haptics.selectionAsync).not.toHaveBeenCalled();
    });
  });

  describe("error handling in hook", () => {
    beforeEach(() => {
      mockUseSetupStore.mockReturnValue({ hapticsEnabled: true } as ReturnType<
        typeof useSetupStore
      >);
    });

    it("should silently fail when haptics throw an error", async () => {
      (Haptics.impactAsync as jest.Mock).mockRejectedValue(
        new Error("Haptics error")
      );

      const { impactMedium } = useHaptics();

      // Should not throw
      await expect(impactMedium()).resolves.not.toThrow();
    });

    it("should silently fail for notification haptics errors", async () => {
      (Haptics.notificationAsync as jest.Mock).mockRejectedValue(
        new Error("Notification haptics error")
      );

      const { notificationSuccess } = useHaptics();

      await expect(notificationSuccess()).resolves.not.toThrow();
    });

    it("should silently fail for selection haptics errors", async () => {
      (Haptics.selectionAsync as jest.Mock).mockRejectedValue(
        new Error("Selection haptics error")
      );

      const { selection } = useHaptics();

      await expect(selection()).resolves.not.toThrow();
    });
  });
});

describe("IS_HAPTICS_SUPPORTED constant", () => {
  it("should be exported and be a boolean", () => {
    expect(typeof IS_HAPTICS_SUPPORTED).toBe("boolean");
  });

  it("should be true for iOS platform", () => {
    // The constant is evaluated at module load time
    // In test environment, Platform.OS is 'ios' by default
    expect(IS_HAPTICS_SUPPORTED).toBe(true);
  });
});
