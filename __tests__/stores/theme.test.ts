import { useThemeStore } from "@/stores/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe("ThemeStore", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

    await useThemeStore.getState().reset();

    jest.clearAllMocks();
  });

  describe("setPreference", () => {
    it("should set and persist 'auto'", async () => {
      await useThemeStore.getState().setPreference("auto");
      expect(useThemeStore.getState().preference).toBe("auto");
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "themeData",
        JSON.stringify({ preference: "auto" }),
      );
    });

    it("should set and persist 'light'", async () => {
      await useThemeStore.getState().setPreference("light");
      expect(useThemeStore.getState().preference).toBe("light");
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "themeData",
        JSON.stringify({ preference: "light" }),
      );
    });

    it("should set and persist 'dark'", async () => {
      await useThemeStore.getState().setPreference("dark");
      expect(useThemeStore.getState().preference).toBe("dark");
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "themeData",
        JSON.stringify({ preference: "dark" }),
      );
    });

    it("should log an error but not throw when AsyncStorage.setItem fails", async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
        new Error("storage error"),
      );

      await expect(
        useThemeStore.getState().setPreference("dark"),
      ).resolves.not.toThrow();
      expect(useThemeStore.getState().preference).toBe("dark");
    });
  });

  describe("fetchOrInitData", () => {
    it("should load a valid preference from storage", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify({ preference: "dark" }),
      );

      await useThemeStore.getState().fetchOrInitData();

      expect(useThemeStore.getState().preference).toBe("dark");
    });

    it("should sanitize an invalid preference value to 'auto'", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify({ preference: "purple" }),
      );

      await useThemeStore.getState().fetchOrInitData();

      expect(useThemeStore.getState().preference).toBe("auto");
    });

    it("should initialize with 'auto' and persist when no data exists", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      await useThemeStore.getState().fetchOrInitData();

      expect(useThemeStore.getState().preference).toBe("auto");
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "themeData",
        JSON.stringify({ preference: "auto" }),
      );
    });

    it("should fall back to initial state when getItem throws", async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
        new Error("read error"),
      );

      await useThemeStore.getState().fetchOrInitData();

      expect(useThemeStore.getState().preference).toBe("auto");
    });

    it("should reinitialize when stored data is not an object", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify("not-an-object"),
      );

      await useThemeStore.getState().fetchOrInitData();

      expect(useThemeStore.getState().preference).toBe("auto");
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "themeData",
        JSON.stringify({ preference: "auto" }),
      );
    });
  });

  describe("reset", () => {
    it("should reset to initial state and persist", async () => {
      await useThemeStore.getState().setPreference("dark");
      jest.clearAllMocks();

      await useThemeStore.getState().reset();

      expect(useThemeStore.getState().preference).toBe("auto");
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "themeData",
        JSON.stringify({ preference: "auto" }),
      );
    });

    it("should log an error but not throw when AsyncStorage.setItem fails", async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
        new Error("storage error"),
      );

      await expect(useThemeStore.getState().reset()).resolves.not.toThrow();
      expect(useThemeStore.getState().preference).toBe("auto");
    });
  });

  describe("fetchOrInitData recovery", () => {
    it("logs but does not throw when both getItem and the recovery setItem fail", async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
        new Error("read error"),
      );
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(
        new Error("write error"),
      );

      await expect(
        useThemeStore.getState().fetchOrInitData(),
      ).resolves.not.toThrow();
      expect(useThemeStore.getState().preference).toBe("auto");
    });
  });
});
