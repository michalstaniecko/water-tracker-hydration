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

type NotificationsState = {
  enabled: boolean;
  intervalMinutes: ReminderInterval;
  permissionStatus: PermissionStatus;
  lastScheduledTime: string | null;
};

type NotificationsActions = {
  fetchOrInitData: () => Promise<void>;
  setEnabled: (enabled: boolean) => Promise<void>;
  setInterval: (intervalMinutes: ReminderInterval) => Promise<void>;
  requestPermissions: () => Promise<PermissionStatus>;
  checkPermissions: () => Promise<PermissionStatus>;
  scheduleReminders: (
    startHour: string,
    endHour: string,
    title: string,
    body: string
  ) => Promise<void>;
  cancelReminders: () => Promise<void>;
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
