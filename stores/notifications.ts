/**
 * Zustand store for notification settings management
 */

import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logError, logWarning } from "@/utils/errorLogging";
import {
  requestPermissions as requestNotificationPermissions,
  getPermissionStatus,
  scheduleNotifications,
  cancelAllNotifications,
  setupNotificationChannel,
  PermissionStatus,
} from "@/services/notificationService";
import {
  NOTIFICATIONS_STORAGE_KEY,
  DEFAULT_REMINDER_INTERVAL,
  DEFAULT_REMINDERS_ENABLED,
  REMINDER_INTERVALS,
  ReminderInterval,
} from "@/constants/notifications";

/**
 * State shape for the notifications store
 */
type NotificationsState = {
  /** Whether push notification reminders are enabled */
  enabled: boolean;
  /** Interval between reminders in minutes (60, 120, or 180) */
  intervalMinutes: ReminderInterval;
  /** Current notification permission status from the OS */
  permissionStatus: PermissionStatus;
  /** ISO timestamp of when notifications were last scheduled, or null if never */
  lastScheduledTime: string | null;
};

/**
 * Actions available on the notifications store
 */
type NotificationsActions = {
  /**
   * Initializes the store by loading persisted data from AsyncStorage
   * and setting up the Android notification channel.
   * Should be called on app startup.
   */
  fetchOrInitData: () => Promise<void>;
  /**
   * Enables or disables push notification reminders.
   * When disabled, cancels all scheduled notifications.
   * @param enabled - Whether reminders should be enabled
   */
  setEnabled: (enabled: boolean) => Promise<void>;
  /**
   * Sets the interval between reminder notifications.
   * Does not automatically reschedule notifications - call scheduleReminders after.
   * @param intervalMinutes - The interval in minutes (must be a valid ReminderInterval)
   */
  setInterval: (intervalMinutes: ReminderInterval) => Promise<void>;
  /**
   * Requests notification permissions from the OS.
   * Updates the permissionStatus state with the result.
   * @returns The resulting permission status
   */
  requestPermissions: () => Promise<PermissionStatus>;
  /**
   * Checks the current notification permission status without prompting.
   * Updates the permissionStatus state with the result.
   * @returns The current permission status
   */
  checkPermissions: () => Promise<PermissionStatus>;
  /**
   * Schedules reminder notifications within the specified activity hours.
   * Only schedules if enabled is true and permissionStatus is "granted".
   * Cancels any existing notifications before scheduling new ones.
   * @param startHour - Start of activity hours in "HH:mm" format
   * @param endHour - End of activity hours in "HH:mm" format
   * @param title - Notification title text
   * @param body - Notification body text
   */
  scheduleReminders: (
    startHour: string,
    endHour: string,
    title: string,
    body: string
  ) => Promise<void>;
  /**
   * Cancels all scheduled reminder notifications.
   * Resets lastScheduledTime to null.
   */
  cancelReminders: () => Promise<void>;
  /**
   * Resets the store to initial state.
   * Cancels all notifications and clears persisted data.
   */
  reset: () => Promise<void>;
};

const initialState: NotificationsState = {
  enabled: DEFAULT_REMINDERS_ENABLED,
  intervalMinutes: DEFAULT_REMINDER_INTERVAL,
  permissionStatus: "undetermined",
  lastScheduledTime: null,
};

export const useNotificationsStore = create<
  NotificationsState & NotificationsActions
>((set, get) => ({
  ...initialState,

  fetchOrInitData: async () => {
    try {
      // Setup notification channel for Android
      await setupNotificationChannel();

      // Check current permission status
      const permissionStatus = await getPermissionStatus();

      const data = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);

      if (data !== null) {
        const parsedData = JSON.parse(data);

        if (typeof parsedData === "object" && parsedData !== null) {
          const validatedData = { ...initialState };

          // Validate enabled
          if (typeof parsedData.enabled === "boolean") {
            validatedData.enabled = parsedData.enabled;
          }

          // Validate interval
          if (
            typeof parsedData.intervalMinutes === "number" &&
            REMINDER_INTERVALS.includes(
              parsedData.intervalMinutes as ReminderInterval
            )
          ) {
            validatedData.intervalMinutes = parsedData.intervalMinutes;
          }

          // Validate lastScheduledTime
          if (typeof parsedData.lastScheduledTime === "string") {
            validatedData.lastScheduledTime = parsedData.lastScheduledTime;
          }

          set({ ...validatedData, permissionStatus });
        } else {
          logWarning("Invalid notifications data structure, reinitializing", {
            operation: "fetchOrInitData",
            component: "NotificationsStore",
          });
          await AsyncStorage.setItem(
            NOTIFICATIONS_STORAGE_KEY,
            JSON.stringify(initialState)
          );
          set({ ...initialState, permissionStatus });
        }
      } else {
        await AsyncStorage.setItem(
          NOTIFICATIONS_STORAGE_KEY,
          JSON.stringify(initialState)
        );
        set({ ...initialState, permissionStatus });
      }
    } catch (error) {
      logError(error, {
        operation: "fetchOrInitData",
        component: "NotificationsStore",
      });
      set(initialState);

      try {
        await AsyncStorage.setItem(
          NOTIFICATIONS_STORAGE_KEY,
          JSON.stringify(initialState)
        );
      } catch (storageError) {
        logError(storageError, {
          operation: "fetchOrInitData - recovery",
          component: "NotificationsStore",
        });
      }
    }
  },

  setEnabled: async (enabled: boolean) => {
    try {
      set({ enabled });

      const currentState = get();
      const stateToSave = {
        enabled,
        intervalMinutes: currentState.intervalMinutes,
        lastScheduledTime: currentState.lastScheduledTime,
      };

      await AsyncStorage.setItem(
        NOTIFICATIONS_STORAGE_KEY,
        JSON.stringify(stateToSave)
      );

      if (!enabled) {
        await cancelAllNotifications();
      }
    } catch (error) {
      logError(error, {
        operation: "setEnabled",
        component: "NotificationsStore",
        data: { enabled },
      });
    }
  },

  setInterval: async (intervalMinutes: ReminderInterval) => {
    try {
      set({ intervalMinutes });

      const currentState = get();
      const stateToSave = {
        enabled: currentState.enabled,
        intervalMinutes,
        lastScheduledTime: currentState.lastScheduledTime,
      };

      await AsyncStorage.setItem(
        NOTIFICATIONS_STORAGE_KEY,
        JSON.stringify(stateToSave)
      );
    } catch (error) {
      logError(error, {
        operation: "setInterval",
        component: "NotificationsStore",
        data: { intervalMinutes },
      });
    }
  },

  requestPermissions: async () => {
    const status = await requestNotificationPermissions();
    set({ permissionStatus: status });
    return status;
  },

  checkPermissions: async () => {
    const status = await getPermissionStatus();
    set({ permissionStatus: status });
    return status;
  },

  scheduleReminders: async (
    startHour: string,
    endHour: string,
    title: string,
    body: string
  ) => {
    try {
      const { enabled, intervalMinutes, permissionStatus } = get();

      if (!enabled || permissionStatus !== "granted") {
        return;
      }

      await scheduleNotifications({
        intervalMinutes,
        startHour,
        endHour,
        title,
        body,
      });

      set({ lastScheduledTime: new Date().toISOString() });

      // Update storage
      const currentState = get();
      const stateToSave = {
        enabled: currentState.enabled,
        intervalMinutes: currentState.intervalMinutes,
        lastScheduledTime: currentState.lastScheduledTime,
      };
      await AsyncStorage.setItem(
        NOTIFICATIONS_STORAGE_KEY,
        JSON.stringify(stateToSave)
      );
    } catch (error) {
      logError(error, {
        operation: "scheduleReminders",
        component: "NotificationsStore",
      });
    }
  },

  cancelReminders: async () => {
    try {
      await cancelAllNotifications();
      set({ lastScheduledTime: null });
    } catch (error) {
      logError(error, {
        operation: "cancelReminders",
        component: "NotificationsStore",
      });
    }
  },

  reset: async () => {
    try {
      await cancelAllNotifications();
      set(initialState);
      await AsyncStorage.setItem(
        NOTIFICATIONS_STORAGE_KEY,
        JSON.stringify(initialState)
      );
    } catch (error) {
      logError(error, {
        operation: "reset",
        component: "NotificationsStore",
      });
    }
  },
}));
