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
  scheduleSmartNotifications,
  cancelAllNotifications,
  setupNotificationChannel,
  getScheduledNotifications,
  PermissionStatus,
} from "@/services/notificationService";
import {
  NOTIFICATIONS_STORAGE_KEY,
  DEFAULT_REMINDER_INTERVAL,
  DEFAULT_REMINDERS_ENABLED,
  REMINDER_INTERVALS,
  ReminderInterval,
  MAX_NOTIFICATION_OPTIONS,
  MaxNotificationOption,
  DEFAULT_MAX_NOTIFICATIONS,
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
  /** ISO timestamp of the last time user drank water, or null */
  lastDrinkTimestamp: string | null;
  /** Number of notifications fired since last drink */
  notificationsSinceLastDrink: number;
  /** Maximum notifications before next drink (0 = unlimited) */
  maxNotifications: MaxNotificationOption;
  /** Number of notifications scheduled in the last batch */
  scheduledCount: number;
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
  /**
   * Called when the user drinks water.
   * Resets the notification counter, saves timestamp, and reschedules.
   */
  onWaterDrunk: (startHour: string, endHour: string) => Promise<void>;
  /**
   * Called when a notification is received in the foreground.
   * Increments the notificationsSinceLastDrink counter.
   */
  onNotificationReceived: () => void;
  /**
   * Sets the maximum notifications before next drink.
   */
  setMaxNotifications: (max: MaxNotificationOption) => Promise<void>;
  /**
   * Corrects the notification counter based on scheduled notifications
   * remaining (used when returning from background).
   */
  correctNotificationCount: () => Promise<void>;
};

const initialState: NotificationsState = {
  enabled: DEFAULT_REMINDERS_ENABLED,
  intervalMinutes: DEFAULT_REMINDER_INTERVAL,
  permissionStatus: "undetermined",
  lastScheduledTime: null,
  lastDrinkTimestamp: null,
  notificationsSinceLastDrink: 0,
  maxNotifications: DEFAULT_MAX_NOTIFICATIONS,
  scheduledCount: 0,
};

/**
 * Builds the persistable state object from the current store state.
 * Excludes permissionStatus since it's fetched from OS on init.
 */
function getStateToPersist(
  state: NotificationsState
): Omit<NotificationsState, "permissionStatus"> {
  return {
    enabled: state.enabled,
    intervalMinutes: state.intervalMinutes,
    lastScheduledTime: state.lastScheduledTime,
    lastDrinkTimestamp: state.lastDrinkTimestamp,
    notificationsSinceLastDrink: state.notificationsSinceLastDrink,
    maxNotifications: state.maxNotifications,
    scheduledCount: state.scheduledCount,
  };
}

async function persistState(state: NotificationsState): Promise<void> {
  await AsyncStorage.setItem(
    NOTIFICATIONS_STORAGE_KEY,
    JSON.stringify(getStateToPersist(state))
  );
}

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

          // Validate lastDrinkTimestamp (backward compat)
          if (typeof parsedData.lastDrinkTimestamp === "string") {
            validatedData.lastDrinkTimestamp = parsedData.lastDrinkTimestamp;
          }

          // Validate notificationsSinceLastDrink (backward compat)
          if (
            typeof parsedData.notificationsSinceLastDrink === "number" &&
            parsedData.notificationsSinceLastDrink >= 0
          ) {
            validatedData.notificationsSinceLastDrink =
              parsedData.notificationsSinceLastDrink;
          }

          // Validate maxNotifications (backward compat)
          if (
            typeof parsedData.maxNotifications === "number" &&
            MAX_NOTIFICATION_OPTIONS.includes(
              parsedData.maxNotifications as MaxNotificationOption
            )
          ) {
            validatedData.maxNotifications = parsedData.maxNotifications;
          }

          // Validate scheduledCount (backward compat)
          if (
            typeof parsedData.scheduledCount === "number" &&
            parsedData.scheduledCount >= 0
          ) {
            validatedData.scheduledCount = parsedData.scheduledCount;
          }

          set({ ...validatedData, permissionStatus });
        } else {
          logWarning("Invalid notifications data structure, reinitializing", {
            operation: "fetchOrInitData",
            component: "NotificationsStore",
          });
          await AsyncStorage.setItem(
            NOTIFICATIONS_STORAGE_KEY,
            JSON.stringify(getStateToPersist(initialState))
          );
          set({ ...initialState, permissionStatus });
        }
      } else {
        await AsyncStorage.setItem(
          NOTIFICATIONS_STORAGE_KEY,
          JSON.stringify(getStateToPersist(initialState))
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
          JSON.stringify(getStateToPersist(initialState))
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
      await persistState(currentState);

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
      await persistState(currentState);
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
      const {
        enabled,
        intervalMinutes,
        permissionStatus,
        lastDrinkTimestamp,
        notificationsSinceLastDrink,
        maxNotifications,
      } = get();

      if (!enabled || permissionStatus !== "granted") {
        return;
      }

      const { count } = await scheduleSmartNotifications({
        intervalMinutes,
        startHour,
        endHour,
        lastDrinkTimestamp,
        maxNotifications,
        notificationsSinceLastDrink,
        title,
        body,
      });

      set({
        lastScheduledTime: new Date().toISOString(),
        scheduledCount: count,
      });

      const currentState = get();
      await persistState(currentState);
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
      set({ lastScheduledTime: null, scheduledCount: 0 });
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
        JSON.stringify(getStateToPersist(initialState))
      );
    } catch (error) {
      logError(error, {
        operation: "reset",
        component: "NotificationsStore",
      });
    }
  },

  onWaterDrunk: async (startHour: string, endHour: string) => {
    try {
      const timestamp = new Date().toISOString();
      set({
        lastDrinkTimestamp: timestamp,
        notificationsSinceLastDrink: 0,
      });

      const currentState = get();
      await persistState(currentState);

      // Reschedule with reset counter
      if (
        currentState.enabled &&
        currentState.permissionStatus === "granted"
      ) {
        const { getNotificationContent } = await import(
          "@/services/notificationService"
        );
        const { title, body } = getNotificationContent();

        const { count } = await scheduleSmartNotifications({
          intervalMinutes: currentState.intervalMinutes,
          startHour,
          endHour,
          lastDrinkTimestamp: timestamp,
          maxNotifications: currentState.maxNotifications,
          notificationsSinceLastDrink: 0,
          title,
          body,
        });

        set({
          lastScheduledTime: new Date().toISOString(),
          scheduledCount: count,
        });

        const updatedState = get();
        await persistState(updatedState);
      }
    } catch (error) {
      logError(error, {
        operation: "onWaterDrunk",
        component: "NotificationsStore",
      });
    }
  },

  onNotificationReceived: () => {
    const currentState = get();
    const newCount = currentState.notificationsSinceLastDrink + 1;
    set({ notificationsSinceLastDrink: newCount });

    // Persist async (fire and forget)
    const updatedState = get();
    persistState(updatedState).catch((error) => {
      logError(error, {
        operation: "onNotificationReceived",
        component: "NotificationsStore",
      });
    });
  },

  setMaxNotifications: async (max: MaxNotificationOption) => {
    try {
      set({ maxNotifications: max });

      const currentState = get();
      await persistState(currentState);
    } catch (error) {
      logError(error, {
        operation: "setMaxNotifications",
        component: "NotificationsStore",
        data: { max },
      });
    }
  },

  correctNotificationCount: async () => {
    try {
      const currentState = get();
      if (!currentState.enabled || currentState.scheduledCount === 0) {
        return;
      }

      const scheduled = await getScheduledNotifications();
      const remainingCount = scheduled.length;
      const fired = currentState.scheduledCount - remainingCount;

      if (fired > 0) {
        const corrected =
          currentState.notificationsSinceLastDrink + fired;
        set({
          notificationsSinceLastDrink: corrected,
          scheduledCount: remainingCount,
        });

        const updatedState = get();
        await persistState(updatedState);
      }
    } catch (error) {
      logError(error, {
        operation: "correctNotificationCount",
        component: "NotificationsStore",
      });
    }
  },
}));
