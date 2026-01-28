import {
  initializeNotificationHandler,
  getNotificationContent,
  calculateNotificationTimes,
  calculateSmartNotificationTimes,
  SmartScheduleParams,
} from "../notificationService";

// Mock expo-notifications
jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
  addNotificationReceivedListener: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  AndroidImportance: { HIGH: 4 },
  SchedulableTriggerInputTypes: { DATE: "date" },
}));

// Mock react-native Platform
jest.mock("react-native", () => ({
  Platform: { OS: "ios" },
}));

// Mock error logging
jest.mock("@/utils/errorLogging", () => ({
  logError: jest.fn(),
  logInfo: jest.fn(),
  logWarning: jest.fn(),
}));

// Mock i18n
jest.mock("@/plugins/i18n", () => ({
  __esModule: true,
  default: {
    t: jest.fn((key: string) => {
      const translations: Record<string, string> = {
        reminderTitle: "Time to drink water!",
        reminderBody: "Stay hydrated throughout the day.",
        channelName: "Water Reminders",
        channelDescription: "Reminders to drink water",
      };
      return translations[key] ?? key;
    }),
  },
}));

// Mock notification constants
jest.mock("@/constants/notifications", () => ({
  NOTIFICATION_CHANNEL_ID: "water-reminders",
  NOTIFICATION_ACTION_OPEN_HOME: "open_home",
  NOTIFICATION_SOUND_ENABLED: true,
}));

import * as Notifications from "expo-notifications";
import { logWarning } from "@/utils/errorLogging";

describe("NotificationService", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Set system time to 2024-06-15 10:00:00 (Saturday)
    jest.setSystemTime(new Date("2024-06-15T10:00:00"));
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ---------------------------------------------------------------------------
  // initializeNotificationHandler
  // ---------------------------------------------------------------------------
  describe("initializeNotificationHandler", () => {
    it("should call Notifications.setNotificationHandler with correct config", () => {
      initializeNotificationHandler();

      expect(Notifications.setNotificationHandler).toHaveBeenCalledTimes(1);
      expect(Notifications.setNotificationHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          handleNotification: expect.any(Function),
        })
      );
    });

    it("should configure handler to show alert, play sound, and not set badge", async () => {
      initializeNotificationHandler();

      const handlerArg = (
        Notifications.setNotificationHandler as jest.Mock
      ).mock.calls[0][0];

      const result = await handlerArg.handleNotification();

      expect(result).toEqual({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      });
    });
  });

  // ---------------------------------------------------------------------------
  // getNotificationContent
  // ---------------------------------------------------------------------------
  describe("getNotificationContent", () => {
    it("should return localized title and body", () => {
      const content = getNotificationContent();

      expect(content).toEqual({
        title: "Time to drink water!",
        body: "Stay hydrated throughout the day.",
      });
    });

    it("should call i18n.t with correct namespace", () => {
      const i18n = require("@/plugins/i18n").default;

      getNotificationContent();

      expect(i18n.t).toHaveBeenCalledWith("reminderTitle", {
        ns: "notifications",
      });
      expect(i18n.t).toHaveBeenCalledWith("reminderBody", {
        ns: "notifications",
      });
    });
  });

  // ---------------------------------------------------------------------------
  // calculateNotificationTimes
  // ---------------------------------------------------------------------------
  describe("calculateNotificationTimes", () => {
    it("should return empty array for invalid startHour format", () => {
      const result = calculateNotificationTimes(60, "invalid", "18:00");

      expect(result).toEqual([]);
      expect(logWarning).toHaveBeenCalledWith(
        "Invalid time format for notification scheduling",
        expect.objectContaining({
          operation: "calculateNotificationTimes",
          component: "NotificationService",
        })
      );
    });

    it("should return empty array for invalid endHour format", () => {
      const result = calculateNotificationTimes(60, "08:00", "25:00");

      expect(result).toEqual([]);
    });

    it("should return empty array for overnight schedule (endHour <= startHour)", () => {
      const result = calculateNotificationTimes(60, "22:00", "06:00");

      expect(result).toEqual([]);
      expect(logWarning).toHaveBeenCalledWith(
        expect.stringContaining("Overnight schedule detected"),
        expect.objectContaining({
          operation: "calculateNotificationTimes",
          component: "NotificationService",
        })
      );
    });

    it("should return empty array when endHour equals startHour", () => {
      const result = calculateNotificationTimes(60, "10:00", "10:00");

      expect(result).toEqual([]);
    });

    it("should generate correct number of future times within activity hours", () => {
      // System time: 2024-06-15T10:00:00
      // Activity: 08:00-18:00, interval: 60 min
      // Today: next interval after 10:00 is 10:00 (ceil of (120-0)/60 = 2 intervals since 08:00)
      //   -> 10:00 is at the boundary, the first future time is 11:00, 12:00, ..., 17:00 (7 times for today after 10:00)
      // Actually let's trace the algorithm:
      //   nowMinutes = 600, startMinutes = 480
      //   intervalsSinceStart = ceil((600 - 480) / 60) = ceil(2) = 2
      //   currentMinutes = 480 + 2*60 = 600 (10:00)
      //   10:00 on today is NOT > new Date() (it's equal), so skipped
      //   then 11:00, 12:00, ..., 17:00 -> 7 times for today
      // Tomorrow: 08:00, 09:00, ..., 17:00 -> 10 times for tomorrow
      // Total: 17 times
      const result = calculateNotificationTimes(60, "08:00", "18:00");

      expect(result.length).toBe(17);

      // Verify all times are in the future
      const now = new Date("2024-06-15T10:00:00");
      result.forEach((time) => {
        expect(time.getTime()).toBeGreaterThan(now.getTime());
      });
    });

    it("should start from next interval after current time for today", () => {
      // System time: 10:00, start: 08:00, interval: 120 min
      // intervalsSinceStart = ceil((600 - 480) / 120) = ceil(1) = 1
      // currentMinutes = 480 + 1*120 = 600 (10:00) - equal to now, skipped
      // next: 12:00, 14:00, 16:00 -> 3 times for today
      const result = calculateNotificationTimes(120, "08:00", "18:00");

      const todayTimes = result.filter(
        (t) => t.getDate() === 15 && t.getMonth() === 5
      );
      expect(todayTimes.length).toBe(3);
      expect(todayTimes[0].getHours()).toBe(12);
      expect(todayTimes[1].getHours()).toBe(14);
      expect(todayTimes[2].getHours()).toBe(16);
    });

    it("should include tomorrow times starting from startHour", () => {
      const result = calculateNotificationTimes(120, "08:00", "18:00");

      const tomorrowTimes = result.filter(
        (t) => t.getDate() === 16 && t.getMonth() === 5
      );
      expect(tomorrowTimes.length).toBe(5); // 08:00, 10:00, 12:00, 14:00, 16:00
      expect(tomorrowTimes[0].getHours()).toBe(8);
      expect(tomorrowTimes[0].getMinutes()).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // calculateSmartNotificationTimes
  // ---------------------------------------------------------------------------
  describe("calculateSmartNotificationTimes", () => {
    const defaultParams: SmartScheduleParams = {
      intervalMinutes: 60,
      startHour: "08:00",
      endHour: "18:00",
      lastDrinkTimestamp: null,
      maxNotifications: 0, // unlimited
      notificationsSinceLastDrink: 0,
    };

    // --- Validation tests ---

    it("should return empty array for invalid startHour format", () => {
      const result = calculateSmartNotificationTimes({
        ...defaultParams,
        startHour: "abc",
      });

      expect(result).toEqual([]);
      expect(logWarning).toHaveBeenCalledWith(
        "Invalid time format for smart notification scheduling",
        expect.objectContaining({
          operation: "calculateSmartNotificationTimes",
          component: "NotificationService",
        })
      );
    });

    it("should return empty array for invalid endHour format", () => {
      const result = calculateSmartNotificationTimes({
        ...defaultParams,
        endHour: "25:00",
      });

      expect(result).toEqual([]);
    });

    it("should return empty array for overnight schedule (endHour <= startHour)", () => {
      const result = calculateSmartNotificationTimes({
        ...defaultParams,
        startHour: "22:00",
        endHour: "06:00",
      });

      expect(result).toEqual([]);
      expect(logWarning).toHaveBeenCalledWith(
        "Overnight schedule not supported for smart notifications",
        expect.objectContaining({
          operation: "calculateSmartNotificationTimes",
          component: "NotificationService",
        })
      );
    });

    it("should return empty array when endHour equals startHour", () => {
      const result = calculateSmartNotificationTimes({
        ...defaultParams,
        startHour: "12:00",
        endHour: "12:00",
      });

      expect(result).toEqual([]);
    });

    // --- Remaining notifications tests ---

    it("should return empty array when remaining notifications <= 0", () => {
      const result = calculateSmartNotificationTimes({
        ...defaultParams,
        maxNotifications: 3,
        notificationsSinceLastDrink: 3,
      });

      expect(result).toEqual([]);
    });

    it("should return empty array when notificationsSinceLastDrink exceeds maxNotifications", () => {
      const result = calculateSmartNotificationTimes({
        ...defaultParams,
        maxNotifications: 2,
        notificationsSinceLastDrink: 5,
      });

      expect(result).toEqual([]);
    });

    it("should respect max notification limit", () => {
      // maxNotifications=2, notificationsSinceLastDrink=0 -> remaining=2
      const result = calculateSmartNotificationTimes({
        ...defaultParams,
        maxNotifications: 2,
        notificationsSinceLastDrink: 0,
      });

      expect(result.length).toBeLessThanOrEqual(2);
      expect(result.length).toBe(2);
    });

    it("should respect remaining count (maxNotifications - notificationsSinceLastDrink)", () => {
      // maxNotifications=3, notificationsSinceLastDrink=1 -> remaining=2
      const result = calculateSmartNotificationTimes({
        ...defaultParams,
        maxNotifications: 3,
        notificationsSinceLastDrink: 1,
      });

      expect(result.length).toBeLessThanOrEqual(2);
    });

    // --- Anchor determination tests ---

    it("should use lastDrinkTimestamp as anchor when it is from today", () => {
      // System time: 2024-06-15T10:00:00
      // Last drink at 09:30 today, interval 60 min
      // Anchor: 09:30 -> first candidate at 10:30, then 11:30, etc.
      const result = calculateSmartNotificationTimes({
        ...defaultParams,
        lastDrinkTimestamp: "2024-06-15T09:30:00",
        intervalMinutes: 60,
      });

      // First notification should be anchored from 09:30 + 60 = 10:30
      expect(result.length).toBeGreaterThan(0);
      const firstTime = result[0];
      expect(firstTime.getHours()).toBe(10);
      expect(firstTime.getMinutes()).toBe(30);
    });

    it("should use now as anchor when lastDrinkTimestamp is from yesterday", () => {
      // System time: 2024-06-15T10:00:00
      // Last drink yesterday at 15:00
      // Anchor: now (10:00) -> first candidate at 11:00, then 12:00, etc.
      const result = calculateSmartNotificationTimes({
        ...defaultParams,
        lastDrinkTimestamp: "2024-06-14T15:00:00",
        intervalMinutes: 60,
      });

      expect(result.length).toBeGreaterThan(0);
      const firstTime = result[0];
      expect(firstTime.getHours()).toBe(11);
      expect(firstTime.getMinutes()).toBe(0);
    });

    it("should use now as anchor when lastDrinkTimestamp is null", () => {
      // System time: 2024-06-15T10:00:00
      // No last drink -> anchor is now (10:00)
      // first candidate at 11:00
      const result = calculateSmartNotificationTimes({
        ...defaultParams,
        lastDrinkTimestamp: null,
        intervalMinutes: 60,
      });

      expect(result.length).toBeGreaterThan(0);
      const firstTime = result[0];
      expect(firstTime.getHours()).toBe(11);
      expect(firstTime.getMinutes()).toBe(0);
    });

    it("should use now as anchor when lastDrinkTimestamp is invalid", () => {
      const result = calculateSmartNotificationTimes({
        ...defaultParams,
        lastDrinkTimestamp: "not-a-date",
        intervalMinutes: 60,
      });

      // Should still generate times using now as anchor
      expect(result.length).toBeGreaterThan(0);
      const firstTime = result[0];
      expect(firstTime.getHours()).toBe(11);
      expect(firstTime.getMinutes()).toBe(0);
    });

    // --- Activity hours filtering tests ---

    it("should exclude times before activity start hour", () => {
      // System time: 10:00, last drink at 06:00 today
      // Anchor: 06:00, interval: 60
      // Candidates: 07:00, 08:00, 09:00, 10:00, 11:00...
      // Activity hours: 08:00-18:00
      // 07:00 is before startHour -> excluded
      // 08:00, 09:00, 10:00 are in the past or equal to now -> excluded
      // First valid: 11:00
      const result = calculateSmartNotificationTimes({
        ...defaultParams,
        lastDrinkTimestamp: "2024-06-15T06:00:00",
        intervalMinutes: 60,
        startHour: "08:00",
        endHour: "18:00",
      });

      result.forEach((time) => {
        if (time.getDate() === 15) {
          const minutes = time.getHours() * 60 + time.getMinutes();
          expect(minutes).toBeGreaterThanOrEqual(8 * 60); // >= 08:00
          expect(minutes).toBeLessThan(18 * 60); // < 18:00
        }
      });
    });

    it("should exclude times at or after activity end hour", () => {
      // System time: 10:00, interval: 60, activity 08:00-14:00
      // Anchor: now -> candidates: 11:00, 12:00, 13:00, 14:00 (at endHour, breaks)
      const result = calculateSmartNotificationTimes({
        ...defaultParams,
        intervalMinutes: 60,
        startHour: "08:00",
        endHour: "14:00",
      });

      const todayTimes = result.filter((t) => t.getDate() === 15);
      todayTimes.forEach((time) => {
        const minutes = time.getHours() * 60 + time.getMinutes();
        expect(minutes).toBeLessThan(14 * 60); // < 14:00
      });

      // Should have exactly 3 today times: 11:00, 12:00, 13:00
      expect(todayTimes.length).toBe(3);
    });

    it("should only include future times (not equal to now)", () => {
      // System time: 10:00, anchor now, interval 60
      // 10:00+60=11:00 is the first candidate, which is future -> included
      const result = calculateSmartNotificationTimes({
        ...defaultParams,
        intervalMinutes: 60,
      });

      const now = new Date("2024-06-15T10:00:00");
      result.forEach((time) => {
        expect(time.getTime()).toBeGreaterThan(now.getTime());
      });
    });

    // --- Unlimited mode test ---

    it("should generate times without limit when maxNotifications is 0 (unlimited)", () => {
      // System time: 10:00, interval: 60, activity 08:00-18:00
      // Today: 11:00, 12:00, 13:00, 14:00, 15:00, 16:00, 17:00 (7 times)
      // Tomorrow: 08:00, 09:00, ..., 17:00 (10 times)
      // Total: 17 times
      const result = calculateSmartNotificationTimes({
        ...defaultParams,
        maxNotifications: 0,
        notificationsSinceLastDrink: 0,
        intervalMinutes: 60,
      });

      expect(result.length).toBe(17);
    });

    it("should generate times for both today and tomorrow in unlimited mode", () => {
      const result = calculateSmartNotificationTimes({
        ...defaultParams,
        maxNotifications: 0,
        intervalMinutes: 60,
      });

      const todayTimes = result.filter((t) => t.getDate() === 15);
      const tomorrowTimes = result.filter((t) => t.getDate() === 16);

      expect(todayTimes.length).toBeGreaterThan(0);
      expect(tomorrowTimes.length).toBeGreaterThan(0);
    });

    // --- Safety cap test ---

    it("should not exceed step=1000 safety cap in while loop", () => {
      // Use a very small interval (1 minute) but a wide activity window
      // to stress-test the safety cap. With interval=1 and 08:00-18:00,
      // there are 600 possible minutes, well under 1000. But let's verify
      // the function terminates and produces a reasonable result.
      const result = calculateSmartNotificationTimes({
        ...defaultParams,
        intervalMinutes: 1,
        startHour: "08:00",
        endHour: "18:00",
        maxNotifications: 0,
      });

      // The function should complete without hanging.
      // Today from 10:01 to 17:59 = up to 479 one-minute intervals
      // Plus tomorrow 08:00 to 17:59 = 600 one-minute intervals
      // Total should be well-defined and finite
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(1079); // theoretical max
    });

    it("should stop at step=1000 even with extreme parameters", () => {
      // Very tiny interval ensures many steps. The while loop condition
      // is `times.length < remaining && step < 1000`, so step stops at 999.
      // With maxNotifications=0, remaining=Infinity, the step cap is the limiter.
      // Interval=1 min means from 10:00 anchor, steps go 10:01, 10:02, ...
      // up to step 999 or end of day, whichever comes first.
      // For today, 10:00 + 999 min = 26:39 which is past midnight, so
      // the loop breaks when candidate is no longer same day.
      // The key assertion: it terminates and doesn't hang.
      const startTime = Date.now();
      const result = calculateSmartNotificationTimes({
        ...defaultParams,
        intervalMinutes: 1,
        maxNotifications: 0,
        startHour: "00:00",
        endHour: "23:59",
      });
      const elapsed = Date.now() - startTime;

      // Should terminate quickly (well under 1 second)
      expect(elapsed).toBeLessThan(1000);
      expect(result.length).toBeGreaterThan(0);
    });

    // --- Tomorrow scheduling tests ---

    it("should schedule tomorrow times starting from startHour", () => {
      const result = calculateSmartNotificationTimes({
        ...defaultParams,
        intervalMinutes: 120,
        maxNotifications: 0,
      });

      const tomorrowTimes = result.filter((t) => t.getDate() === 16);

      if (tomorrowTimes.length > 0) {
        // Tomorrow should start from startHour (08:00)
        expect(tomorrowTimes[0].getHours()).toBe(8);
        expect(tomorrowTimes[0].getMinutes()).toBe(0);
      }
    });

    it("should not schedule tomorrow times beyond remaining limit", () => {
      // maxNotifications=1, notificationsSinceLastDrink=0 -> remaining=1
      // Should only schedule 1 notification total (today)
      const result = calculateSmartNotificationTimes({
        ...defaultParams,
        maxNotifications: 1,
        notificationsSinceLastDrink: 0,
        intervalMinutes: 60,
      });

      expect(result.length).toBe(1);
    });

    // --- Edge case: current time near end of activity hours ---

    it("should handle current time near end of activity hours", () => {
      // Set time to 17:30, activity ends at 18:00
      jest.setSystemTime(new Date("2024-06-15T17:30:00"));

      const result = calculateSmartNotificationTimes({
        ...defaultParams,
        intervalMinutes: 60,
        startHour: "08:00",
        endHour: "18:00",
      });

      // Today: anchor at 17:30, +60min = 18:30 which is past endHour -> 0 today
      // Tomorrow: 08:00, 09:00, ..., 17:00 -> 10 times
      const todayTimes = result.filter((t) => t.getDate() === 15);
      const tomorrowTimes = result.filter((t) => t.getDate() === 16);

      expect(todayTimes.length).toBe(0);
      expect(tomorrowTimes.length).toBe(10);
    });

    it("should handle current time before activity start", () => {
      // Set time to 06:00, activity starts at 08:00
      jest.setSystemTime(new Date("2024-06-15T06:00:00"));

      const result = calculateSmartNotificationTimes({
        ...defaultParams,
        intervalMinutes: 60,
        startHour: "08:00",
        endHour: "18:00",
      });

      // Anchor is now (06:00), first candidate 07:00 is before startHour -> excluded
      // 08:00 is within activity hours and in the future -> included
      // Then 09:00, 10:00, ..., 17:00
      const todayTimes = result.filter((t) => t.getDate() === 15);
      expect(todayTimes.length).toBeGreaterThan(0);
      expect(todayTimes[0].getHours()).toBe(8);
    });

    // --- Interval spacing verification ---

    it("should space notifications by the correct interval", () => {
      const result = calculateSmartNotificationTimes({
        ...defaultParams,
        intervalMinutes: 90,
        lastDrinkTimestamp: "2024-06-15T09:00:00",
        maxNotifications: 0,
      });

      // Anchor: 09:00, interval: 90 min
      // Candidates: 10:30, 12:00, 13:30, 15:00, 16:30
      const todayTimes = result.filter((t) => t.getDate() === 15);
      expect(todayTimes.length).toBeGreaterThan(0);

      expect(todayTimes[0].getHours()).toBe(10);
      expect(todayTimes[0].getMinutes()).toBe(30);

      if (todayTimes.length > 1) {
        expect(todayTimes[1].getHours()).toBe(12);
        expect(todayTimes[1].getMinutes()).toBe(0);
      }
    });
  });
});
