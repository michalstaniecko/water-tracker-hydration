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
  });

  describe("setMinimumWater", () => {
    it("should allow empty string during editing", async () => {
      // Set initial value
      await useSetupStore.getState().setMinimumWater("2000");
      expect(useSetupStore.getState().minimumWater).toBe("2000");

      // Clear the field (empty string)
      await useSetupStore.getState().setMinimumWater("");

      // Should allow empty string
      expect(useSetupStore.getState().minimumWater).toBe("");
    });

    it("should allow partial values during editing", async () => {
      // User starts typing a new value
      await useSetupStore.getState().setMinimumWater("1");
      expect(useSetupStore.getState().minimumWater).toBe("1");

      await useSetupStore.getState().setMinimumWater("16");
      expect(useSetupStore.getState().minimumWater).toBe("16");

      await useSetupStore.getState().setMinimumWater("160");
      expect(useSetupStore.getState().minimumWater).toBe("160");

      await useSetupStore.getState().setMinimumWater("1600");
      expect(useSetupStore.getState().minimumWater).toBe("1600");
    });

    it("should store valid numeric values", async () => {
      await useSetupStore.getState().setMinimumWater("1500");

      expect(useSetupStore.getState().minimumWater).toBe("1500");
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe("setGlassCapacity", () => {
    it("should allow empty string during editing", async () => {
      // Set initial value
      await useSetupStore.getState().setGlassCapacity("250");
      expect(useSetupStore.getState().glassCapacity).toBe("250");

      // Clear the field (empty string)
      await useSetupStore.getState().setGlassCapacity("");

      // Should allow empty string
      expect(useSetupStore.getState().glassCapacity).toBe("");
    });

    it("should allow partial values during editing", async () => {
      // User starts typing a new value
      await useSetupStore.getState().setGlassCapacity("3");
      expect(useSetupStore.getState().glassCapacity).toBe("3");

      await useSetupStore.getState().setGlassCapacity("30");
      expect(useSetupStore.getState().glassCapacity).toBe("30");

      await useSetupStore.getState().setGlassCapacity("300");
      expect(useSetupStore.getState().glassCapacity).toBe("300");
    });

    it("should store valid numeric values", async () => {
      await useSetupStore.getState().setGlassCapacity("300");

      expect(useSetupStore.getState().glassCapacity).toBe("300");
      expect(AsyncStorage.setItem).toHaveBeenCalled();
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
