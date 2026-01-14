/**
 * Notification service for scheduling water drinking reminders
 */

import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import dayjs from "dayjs";
import { logError, logInfo, logWarning } from "@/utils/errorLogging";
import { isValidTimeFormat } from "@/utils/validation";
import {
  NOTIFICATION_CHANNEL_ID,
  NOTIFICATION_CHANNEL_NAME,
} from "@/constants/notifications";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export type PermissionStatus = "granted" | "denied" | "undetermined";

export interface NotificationScheduleParams {
  intervalMinutes: number;
  startHour: string; // "HH:mm" format
  endHour: string; // "HH:mm" format
  title: string;
  body: string;
}

/**
 * Requests notification permissions from the user
 */
export async function requestPermissions(): Promise<PermissionStatus> {
  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    if (existingStatus === "granted") {
      return "granted";
    }

    const { status } = await Notifications.requestPermissionsAsync();

    logInfo("Notification permission request result", {
      operation: "requestPermissions",
      component: "NotificationService",
      data: { status },
    });

    return status as PermissionStatus;
  } catch (error) {
    logError(error, {
      operation: "requestPermissions",
      component: "NotificationService",
    });
    return "denied";
  }
}

/**
 * Gets current notification permission status
 */
export async function getPermissionStatus(): Promise<PermissionStatus> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status as PermissionStatus;
  } catch (error) {
    logError(error, {
      operation: "getPermissionStatus",
      component: "NotificationService",
    });
    return "undetermined";
  }
}

/**
 * Sets up Android notification channel
 */
export async function setupNotificationChannel(): Promise<void> {
  if (Platform.OS === "android") {
    try {
      await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
        name: NOTIFICATION_CHANNEL_NAME,
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#3b82f6",
      });
    } catch (error) {
      logError(error, {
        operation: "setupNotificationChannel",
        component: "NotificationService",
      });
    }
  }
}

/**
 * Calculates the next notification times within activity hours
 */
export function calculateNotificationTimes(
  intervalMinutes: number,
  startHour: string,
  endHour: string
): Date[] {
  if (!isValidTimeFormat(startHour) || !isValidTimeFormat(endHour)) {
    logWarning("Invalid time format for notification scheduling", {
      operation: "calculateNotificationTimes",
      component: "NotificationService",
      data: { startHour, endHour },
    });
    return [];
  }

  const times: Date[] = [];
  const now = dayjs();

  // Parse start and end hours
  const [startH, startM] = startHour.split(":").map(Number);
  const [endH, endM] = endHour.split(":").map(Number);

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  // Calculate notification times for today and tomorrow
  for (let dayOffset = 0; dayOffset < 2; dayOffset++) {
    const baseDate = now.add(dayOffset, "day").startOf("day");

    // Start from activity start time
    let currentMinutes = startMinutes;

    // If today, start from the next interval after now
    if (dayOffset === 0) {
      const nowMinutes = now.hour() * 60 + now.minute();
      if (nowMinutes >= startMinutes) {
        // Find next interval time after now
        const intervalsSinceStart = Math.ceil(
          (nowMinutes - startMinutes) / intervalMinutes
        );
        currentMinutes = startMinutes + intervalsSinceStart * intervalMinutes;
      }
    }

    // Generate times within activity hours
    while (currentMinutes < endMinutes) {
      const hours = Math.floor(currentMinutes / 60);
      const minutes = currentMinutes % 60;
      const notificationTime = baseDate.hour(hours).minute(minutes).toDate();

      // Only add future times
      if (notificationTime > new Date()) {
        times.push(notificationTime);
      }

      currentMinutes += intervalMinutes;
    }
  }

  return times;
}

/**
 * Schedules recurring notifications within activity hours
 */
export async function scheduleNotifications(
  params: NotificationScheduleParams
): Promise<string[]> {
  try {
    // Cancel existing notifications first
    await cancelAllNotifications();

    const times = calculateNotificationTimes(
      params.intervalMinutes,
      params.startHour,
      params.endHour
    );

    const notificationIds: string[] = [];

    for (const time of times) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: params.title,
          body: params.body,
          data: { action: "open_home" },
          sound: true,
          ...(Platform.OS === "android" && {
            channelId: NOTIFICATION_CHANNEL_ID,
          }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: time,
        },
      });

      notificationIds.push(id);
    }

    logInfo("Notifications scheduled", {
      operation: "scheduleNotifications",
      component: "NotificationService",
      data: { count: notificationIds.length, intervalMinutes: params.intervalMinutes },
    });

    return notificationIds;
  } catch (error) {
    logError(error, {
      operation: "scheduleNotifications",
      component: "NotificationService",
    });
    return [];
  }
}

/**
 * Cancels all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    logInfo("All notifications cancelled", {
      operation: "cancelAllNotifications",
      component: "NotificationService",
    });
  } catch (error) {
    logError(error, {
      operation: "cancelAllNotifications",
      component: "NotificationService",
    });
  }
}

/**
 * Gets all scheduled notifications (for debugging)
 */
export async function getScheduledNotifications(): Promise<
  Notifications.NotificationRequest[]
> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    logError(error, {
      operation: "getScheduledNotifications",
      component: "NotificationService",
    });
    return [];
  }
}

/**
 * Adds listener for notification responses (when user taps notification)
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Adds listener for received notifications (when notification arrives)
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationReceivedListener(callback);
}
