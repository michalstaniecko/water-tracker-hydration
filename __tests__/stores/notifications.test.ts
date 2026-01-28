import { useNotificationsStore } from "@/stores/notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  NOTIFICATIONS_STORAGE_KEY,
  DEFAULT_REMINDER_INTERVAL,
  DEFAULT_MAX_NOTIFICATIONS,
} from "@/constants/notifications";

// Mock notification service
jest.mock("@/services/notificationService", () => ({
  setupNotificationChannel: jest.fn().mockResolvedValue(undefined),
  getPermissionStatus: jest.fn().mockResolvedValue("undetermined"),
  requestPermissions: jest.fn().mockResolvedValue("granted"),
  scheduleSmartNotifications: jest
    .fn()
    .mockResolvedValue({ ids: [], count: 0 }),
  cancelAllNotifications: jest.fn().mockResolvedValue(undefined),
  getScheduledNotifications: jest.fn().mockResolvedValue([]),
  getNotificationContent: jest
    .fn()
    .mockReturnValue({ title: "Test", body: "Test body" }),
  scheduleNotifications: jest.fn().mockResolvedValue([]),
}));

jest.mock("@/utils/errorLogging", () => ({
  logError: jest.fn(),
  logWarning: jest.fn(),
}));

// Import mocked modules for assertions
import {
  setupNotificationChannel,
  getPermissionStatus,
  scheduleSmartNotifications,
  cancelAllNotifications,
  getScheduledNotifications,
  getNotificationContent,
} from "@/services/notificationService";
import { logError, logWarning } from "@/utils/errorLogging";

const initialState = {
  enabled: false,
  intervalMinutes: DEFAULT_REMINDER_INTERVAL,
  permissionStatus: "undetermined",
  lastScheduledTime: null,
  lastDrinkTimestamp: null,
  notificationsSinceLastDrink: 0,
  maxNotifications: DEFAULT_MAX_NOTIFICATIONS,
  scheduledCount: 0,
};

describe("NotificationsStore", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

    // Reset store state to initial
    await useNotificationsStore.getState().reset();

    // Clear mocks again after reset (since reset calls cancelAll + setItem)
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // fetchOrInitData
  // ---------------------------------------------------------------------------
  describe("fetchOrInitData", () => {
    it("should set defaults when no data is stored", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      await useNotificationsStore.getState().fetchOrInitData();

      const state = useNotificationsStore.getState();
      expect(state.enabled).toBe(false);
      expect(state.intervalMinutes).toBe(DEFAULT_REMINDER_INTERVAL);
      expect(state.permissionStatus).toBe("undetermined");
      expect(state.lastScheduledTime).toBeNull();
      expect(state.lastDrinkTimestamp).toBeNull();
      expect(state.notificationsSinceLastDrink).toBe(0);
      expect(state.maxNotifications).toBe(DEFAULT_MAX_NOTIFICATIONS);
      expect(state.scheduledCount).toBe(0);
    });

    it("should persist initial state when no data is stored", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      await useNotificationsStore.getState().fetchOrInitData();

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        NOTIFICATIONS_STORAGE_KEY,
        expect.any(String)
      );
    });

    it("should setup notification channel on init", async () => {
      await useNotificationsStore.getState().fetchOrInitData();

      expect(setupNotificationChannel).toHaveBeenCalledTimes(1);
    });

    it("should check permission status on init", async () => {
      await useNotificationsStore.getState().fetchOrInitData();

      expect(getPermissionStatus).toHaveBeenCalledTimes(1);
    });

    it("should load persisted valid data correctly", async () => {
      const persistedData = {
        enabled: true,
        intervalMinutes: 60,
        lastScheduledTime: "2026-01-28T10:00:00.000Z",
        lastDrinkTimestamp: "2026-01-28T09:30:00.000Z",
        notificationsSinceLastDrink: 2,
        maxNotifications: 1,
        scheduledCount: 5,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(persistedData)
      );
      (getPermissionStatus as jest.Mock).mockResolvedValue("granted");

      await useNotificationsStore.getState().fetchOrInitData();

      const state = useNotificationsStore.getState();
      expect(state.enabled).toBe(true);
      expect(state.intervalMinutes).toBe(60);
      expect(state.lastScheduledTime).toBe("2026-01-28T10:00:00.000Z");
      expect(state.lastDrinkTimestamp).toBe("2026-01-28T09:30:00.000Z");
      expect(state.notificationsSinceLastDrink).toBe(2);
      expect(state.maxNotifications).toBe(1);
      expect(state.scheduledCount).toBe(5);
      // permissionStatus comes from OS check, not storage
      expect(state.permissionStatus).toBe("granted");
    });

    it("should fall back to defaults for invalid data (non-object)", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify("not-an-object")
      );

      await useNotificationsStore.getState().fetchOrInitData();

      const state = useNotificationsStore.getState();
      expect(state.enabled).toBe(false);
      expect(state.intervalMinutes).toBe(DEFAULT_REMINDER_INTERVAL);
      expect(state.notificationsSinceLastDrink).toBe(0);
      expect(logWarning).toHaveBeenCalledWith(
        "Invalid notifications data structure, reinitializing",
        expect.objectContaining({
          operation: "fetchOrInitData",
          component: "NotificationsStore",
        })
      );
    });

    it("should fall back to defaults for invalid field values", async () => {
      const invalidData = {
        enabled: "yes", // should be boolean
        intervalMinutes: 45, // not a valid interval (60, 120, 180)
        notificationsSinceLastDrink: -5, // negative
        maxNotifications: 99, // not in MAX_NOTIFICATION_OPTIONS
        scheduledCount: -1, // negative
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(invalidData)
      );

      await useNotificationsStore.getState().fetchOrInitData();

      const state = useNotificationsStore.getState();
      expect(state.enabled).toBe(false);
      expect(state.intervalMinutes).toBe(DEFAULT_REMINDER_INTERVAL);
      expect(state.notificationsSinceLastDrink).toBe(0);
      expect(state.maxNotifications).toBe(DEFAULT_MAX_NOTIFICATIONS);
      expect(state.scheduledCount).toBe(0);
    });

    it("should handle backward compatibility - missing new fields use defaults", async () => {
      // Simulates data saved by an older version that did not have
      // maxNotifications, scheduledCount, lastDrinkTimestamp, or
      // notificationsSinceLastDrink
      const oldVersionData = {
        enabled: true,
        intervalMinutes: 180,
        lastScheduledTime: "2026-01-20T08:00:00.000Z",
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(oldVersionData)
      );

      await useNotificationsStore.getState().fetchOrInitData();

      const state = useNotificationsStore.getState();
      // Persisted fields are loaded
      expect(state.enabled).toBe(true);
      expect(state.intervalMinutes).toBe(180);
      expect(state.lastScheduledTime).toBe("2026-01-20T08:00:00.000Z");
      // Missing fields fall back to defaults
      expect(state.lastDrinkTimestamp).toBeNull();
      expect(state.notificationsSinceLastDrink).toBe(0);
      expect(state.maxNotifications).toBe(DEFAULT_MAX_NOTIFICATIONS);
      expect(state.scheduledCount).toBe(0);
    });

    it("should fall back to defaults and log error on JSON parse failure", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        "{{invalid-json}}"
      );

      await useNotificationsStore.getState().fetchOrInitData();

      const state = useNotificationsStore.getState();
      expect(state.enabled).toBe(false);
      expect(state.intervalMinutes).toBe(DEFAULT_REMINDER_INTERVAL);
      expect(logError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          operation: "fetchOrInitData",
          component: "NotificationsStore",
        })
      );
    });
  });

  // ---------------------------------------------------------------------------
  // onWaterDrunk
  // ---------------------------------------------------------------------------
  describe("onWaterDrunk", () => {
    it("should reset notificationsSinceLastDrink counter", async () => {
      // Put the store in a state with notifications fired
      useNotificationsStore.setState({
        notificationsSinceLastDrink: 3,
        enabled: true,
        permissionStatus: "granted",
      });

      await useNotificationsStore.getState().onWaterDrunk("08:00", "22:00");

      expect(useNotificationsStore.getState().notificationsSinceLastDrink).toBe(
        0
      );
    });

    it("should set lastDrinkTimestamp to current time", async () => {
      const beforeTime = new Date().toISOString();

      await useNotificationsStore.getState().onWaterDrunk("08:00", "22:00");

      const state = useNotificationsStore.getState();
      expect(state.lastDrinkTimestamp).not.toBeNull();
      // Timestamp should be at or after the time before the call
      expect(state.lastDrinkTimestamp! >= beforeTime).toBe(true);
    });

    it("should persist state after updating timestamp and counter", async () => {
      await useNotificationsStore.getState().onWaterDrunk("08:00", "22:00");

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        NOTIFICATIONS_STORAGE_KEY,
        expect.any(String)
      );
    });

    it("should reschedule notifications when enabled and granted", async () => {
      useNotificationsStore.setState({
        enabled: true,
        permissionStatus: "granted",
        intervalMinutes: 60,
        maxNotifications: 3,
      });

      (scheduleSmartNotifications as jest.Mock).mockResolvedValue({
        ids: ["id-1", "id-2"],
        count: 2,
      });

      await useNotificationsStore.getState().onWaterDrunk("08:00", "22:00");

      expect(scheduleSmartNotifications).toHaveBeenCalledTimes(1);
      expect(scheduleSmartNotifications).toHaveBeenCalledWith(
        expect.objectContaining({
          intervalMinutes: 60,
          startHour: "08:00",
          endHour: "22:00",
          maxNotifications: 3,
          notificationsSinceLastDrink: 0,
          title: "Test",
          body: "Test body",
        })
      );

      expect(useNotificationsStore.getState().scheduledCount).toBe(2);
    });

    it("should call getNotificationContent statically (not via dynamic import)", async () => {
      useNotificationsStore.setState({
        enabled: true,
        permissionStatus: "granted",
      });

      await useNotificationsStore.getState().onWaterDrunk("08:00", "22:00");

      // getNotificationContent is imported at module level and called
      // synchronously -- not dynamically imported at runtime.
      expect(getNotificationContent).toHaveBeenCalledTimes(1);
    });

    it("should not reschedule when not enabled", async () => {
      useNotificationsStore.setState({
        enabled: false,
        permissionStatus: "granted",
      });

      await useNotificationsStore.getState().onWaterDrunk("08:00", "22:00");

      expect(scheduleSmartNotifications).not.toHaveBeenCalled();
    });

    it("should not reschedule when permission is not granted", async () => {
      useNotificationsStore.setState({
        enabled: true,
        permissionStatus: "denied",
      });

      await useNotificationsStore.getState().onWaterDrunk("08:00", "22:00");

      expect(scheduleSmartNotifications).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // onNotificationReceived
  // ---------------------------------------------------------------------------
  describe("onNotificationReceived", () => {
    it("should increment notificationsSinceLastDrink by 1", () => {
      useNotificationsStore.setState({ notificationsSinceLastDrink: 0 });

      useNotificationsStore.getState().onNotificationReceived();

      expect(useNotificationsStore.getState().notificationsSinceLastDrink).toBe(
        1
      );
    });

    it("should increment from any starting count", () => {
      useNotificationsStore.setState({ notificationsSinceLastDrink: 5 });

      useNotificationsStore.getState().onNotificationReceived();

      expect(useNotificationsStore.getState().notificationsSinceLastDrink).toBe(
        6
      );
    });

    it("should persist state (fire-and-forget)", () => {
      useNotificationsStore.setState({ notificationsSinceLastDrink: 0 });

      useNotificationsStore.getState().onNotificationReceived();

      // Fire-and-forget persist -- setItem is called asynchronously
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        NOTIFICATIONS_STORAGE_KEY,
        expect.any(String)
      );
    });
  });

  // ---------------------------------------------------------------------------
  // cancelReminders
  // ---------------------------------------------------------------------------
  describe("cancelReminders", () => {
    it("should call cancelAllNotifications", async () => {
      await useNotificationsStore.getState().cancelReminders();

      expect(cancelAllNotifications).toHaveBeenCalledTimes(1);
    });

    it("should set lastScheduledTime to null", async () => {
      useNotificationsStore.setState({
        lastScheduledTime: "2026-01-28T10:00:00.000Z",
      });

      await useNotificationsStore.getState().cancelReminders();

      expect(useNotificationsStore.getState().lastScheduledTime).toBeNull();
    });

    it("should set scheduledCount to 0", async () => {
      useNotificationsStore.setState({ scheduledCount: 5 });

      await useNotificationsStore.getState().cancelReminders();

      expect(useNotificationsStore.getState().scheduledCount).toBe(0);
    });

    it("should persist state after cancellation (S6 fix)", async () => {
      useNotificationsStore.setState({
        lastScheduledTime: "2026-01-28T10:00:00.000Z",
        scheduledCount: 5,
      });

      await useNotificationsStore.getState().cancelReminders();

      // The key fix: cancelReminders must persist state via AsyncStorage.setItem
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        NOTIFICATIONS_STORAGE_KEY,
        expect.any(String)
      );

      // Verify persisted data reflects cleared scheduling state
      const persistedCall = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
        (call) => call[0] === NOTIFICATIONS_STORAGE_KEY
      );
      expect(persistedCall).toBeDefined();
      const persistedData = JSON.parse(persistedCall![1]);
      expect(persistedData.lastScheduledTime).toBeNull();
      expect(persistedData.scheduledCount).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // correctNotificationCount
  // ---------------------------------------------------------------------------
  describe("correctNotificationCount", () => {
    it("should correct counter when notifications have fired", async () => {
      useNotificationsStore.setState({
        enabled: true,
        scheduledCount: 5,
        notificationsSinceLastDrink: 1,
      });

      // 3 remaining means 2 have fired (5 - 3 = 2)
      (getScheduledNotifications as jest.Mock).mockResolvedValue([
        { id: "1" },
        { id: "2" },
        { id: "3" },
      ]);

      await useNotificationsStore.getState().correctNotificationCount();

      const state = useNotificationsStore.getState();
      expect(state.notificationsSinceLastDrink).toBe(3); // 1 + 2 fired
      expect(state.scheduledCount).toBe(3); // corrected to remaining
    });

    it("should log warning with drift information when fired > 0", async () => {
      useNotificationsStore.setState({
        enabled: true,
        scheduledCount: 4,
        notificationsSinceLastDrink: 0,
      });

      // 2 remaining means 2 have fired (4 - 2 = 2)
      (getScheduledNotifications as jest.Mock).mockResolvedValue([
        { id: "1" },
        { id: "2" },
      ]);

      await useNotificationsStore.getState().correctNotificationCount();

      expect(logWarning).toHaveBeenCalledWith(
        "Notification counter drift corrected",
        expect.objectContaining({
          operation: "correctNotificationCount",
          component: "NotificationsStore",
          data: expect.objectContaining({
            fired: 2,
            previousCount: 0,
            correctedCount: 2,
          }),
        })
      );
    });

    it("should persist corrected state", async () => {
      useNotificationsStore.setState({
        enabled: true,
        scheduledCount: 3,
        notificationsSinceLastDrink: 0,
      });

      (getScheduledNotifications as jest.Mock).mockResolvedValue([
        { id: "1" },
      ]);

      await useNotificationsStore.getState().correctNotificationCount();

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        NOTIFICATIONS_STORAGE_KEY,
        expect.any(String)
      );
    });

    it("should not correct when no notifications have fired", async () => {
      useNotificationsStore.setState({
        enabled: true,
        scheduledCount: 3,
        notificationsSinceLastDrink: 0,
      });

      // All 3 are still scheduled -- 0 fired
      (getScheduledNotifications as jest.Mock).mockResolvedValue([
        { id: "1" },
        { id: "2" },
        { id: "3" },
      ]);

      await useNotificationsStore.getState().correctNotificationCount();

      expect(useNotificationsStore.getState().notificationsSinceLastDrink).toBe(
        0
      );
      expect(logWarning).not.toHaveBeenCalled();
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it("should skip correction when not enabled", async () => {
      useNotificationsStore.setState({
        enabled: false,
        scheduledCount: 5,
      });

      await useNotificationsStore.getState().correctNotificationCount();

      expect(getScheduledNotifications).not.toHaveBeenCalled();
    });

    it("should skip correction when scheduledCount is 0", async () => {
      useNotificationsStore.setState({
        enabled: true,
        scheduledCount: 0,
      });

      await useNotificationsStore.getState().correctNotificationCount();

      expect(getScheduledNotifications).not.toHaveBeenCalled();
    });
  });
});
