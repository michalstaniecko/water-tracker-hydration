import { useSetupStore } from "@/stores/setup";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe("SetupStore - Input Field Behavior", () => {
  beforeEach(async () => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

    // Reset store state
    await useSetupStore.getState().reset();
    
    // Clear mocks again after reset (since reset calls setItem)
    jest.clearAllMocks();
  });

  describe("setMinimumWater", () => {
    it("should sanitize and persist value", async () => {
      await useSetupStore.getState().setMinimumWater("1500");
      expect(useSetupStore.getState().minimumWater).toBe("1500");
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it("should sanitize empty string to default", async () => {
      await useSetupStore.getState().setMinimumWater("");
      expect(useSetupStore.getState().minimumWater).toBe("2000");
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it("should sanitize invalid values to default", async () => {
      await useSetupStore.getState().setMinimumWater("0");
      expect(useSetupStore.getState().minimumWater).toBe("2000");
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe("setMinimumWaterTemp", () => {
    it("should allow empty string during editing without persisting", () => {
      // Set initial value
      useSetupStore.getState().setMinimumWaterTemp("2000");
      expect(useSetupStore.getState().minimumWater).toBe("2000");

      // Clear the field (empty string)
      useSetupStore.getState().setMinimumWaterTemp("");

      // Should allow empty string
      expect(useSetupStore.getState().minimumWater).toBe("");
      // Should not persist during editing
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it("should allow partial values during editing", () => {
      // User starts typing a new value
      useSetupStore.getState().setMinimumWaterTemp("1");
      expect(useSetupStore.getState().minimumWater).toBe("1");

      useSetupStore.getState().setMinimumWaterTemp("16");
      expect(useSetupStore.getState().minimumWater).toBe("16");

      useSetupStore.getState().setMinimumWaterTemp("160");
      expect(useSetupStore.getState().minimumWater).toBe("160");

      useSetupStore.getState().setMinimumWaterTemp("1600");
      expect(useSetupStore.getState().minimumWater).toBe("1600");

      // Should not persist during editing
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe("setGlassCapacity", () => {
    it("should sanitize and persist value", async () => {
      await useSetupStore.getState().setGlassCapacity("300");
      expect(useSetupStore.getState().glassCapacity).toBe("300");
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it("should sanitize empty string to default", async () => {
      await useSetupStore.getState().setGlassCapacity("");
      expect(useSetupStore.getState().glassCapacity).toBe("250");
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe("setGlassCapacityTemp", () => {
    it("should allow empty string during editing without persisting", () => {
      // Set initial value
      useSetupStore.getState().setGlassCapacityTemp("250");
      expect(useSetupStore.getState().glassCapacity).toBe("250");

      // Clear the field (empty string)
      useSetupStore.getState().setGlassCapacityTemp("");

      // Should allow empty string
      expect(useSetupStore.getState().glassCapacity).toBe("");
      // Should not persist during editing
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it("should allow partial values during editing", () => {
      // User starts typing a new value
      useSetupStore.getState().setGlassCapacityTemp("3");
      expect(useSetupStore.getState().glassCapacity).toBe("3");

      useSetupStore.getState().setGlassCapacityTemp("30");
      expect(useSetupStore.getState().glassCapacity).toBe("30");

      useSetupStore.getState().setGlassCapacityTemp("300");
      expect(useSetupStore.getState().glassCapacity).toBe("300");

      // Should not persist during editing
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe("fetchOrInitData - sanitization on load", () => {
    it("should sanitize invalid minimumWater from storage", async () => {
      const invalidData = {
        glassCapacity: "250",
        minimumWater: "", // Invalid empty string
        day: {
          startHour: "08:00",
          endHour: "23:00",
        },
        dateFormat: "DD/MM/YYYY",
        languageCode: "en",
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(invalidData)
      );

      await useSetupStore.getState().fetchOrInitData();

      // Should use default value for invalid data
      expect(useSetupStore.getState().minimumWater).toBe("2000");
    });

    it("should sanitize invalid glassCapacity from storage", async () => {
      const invalidData = {
        glassCapacity: "", // Invalid empty string
        minimumWater: "2000",
        day: {
          startHour: "08:00",
          endHour: "23:00",
        },
        dateFormat: "DD/MM/YYYY",
        languageCode: "en",
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(invalidData)
      );

      await useSetupStore.getState().fetchOrInitData();

      // Should use default value for invalid data
      expect(useSetupStore.getState().glassCapacity).toBe("250");
    });

    it("should keep valid values from storage", async () => {
      const validData = {
        glassCapacity: "300",
        minimumWater: "1500",
        day: {
          startHour: "08:00",
          endHour: "23:00",
        },
        dateFormat: "DD/MM/YYYY",
        languageCode: "en",
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(validData)
      );

      await useSetupStore.getState().fetchOrInitData();

      expect(useSetupStore.getState().glassCapacity).toBe("300");
      expect(useSetupStore.getState().minimumWater).toBe("1500");
    });
  });
});
