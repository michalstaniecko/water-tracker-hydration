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
  NOTIFICATION_ACTION_OPEN_HOME,
} from "@/constants/notifications";
import i18n from "@/plugins/i18n";

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
 * Gets the localized notification content (title and body) for reminder notifications.
 * This helper centralizes notification content retrieval to avoid duplication.
 */
export function getNotificationContent(): { title: string; body: string } {
  return {
    title: i18n.t("reminderTitle", { ns: "notifications" }),
    body: i18n.t("reminderBody", { ns: "notifications" }),
  };
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

    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowSound: true,
        allowBadge: false,
      },
    });

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
        description: "Reminders to stay hydrated throughout the day",
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

  // Handle overnight schedule edge case (e.g., endHour < startHour like 22:00 to 06:00)
  if (endMinutes <= startMinutes) {
    logWarning("Overnight schedule detected - end hour is before or equal to start hour. Notifications will not be scheduled for overnight periods.", {
      operation: "calculateNotificationTimes",
      component: "NotificationService",
      data: { startHour, endHour, startMinutes, endMinutes },
    });
    return [];
  }

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

export interface SmartScheduleParams {
  intervalMinutes: number;
  startHour: string; // "HH:mm" format
  endHour: string; // "HH:mm" format
  lastDrinkTimestamp: string | null;
  maxNotifications: number; // 0 = unlimited
  notificationsSinceLastDrink: number;
}

/**
 * Calculates smart notification times anchored to the last drink timestamp.
 * Respects activity hours and max notification limits.
 */
export function calculateSmartNotificationTimes(
  params: SmartScheduleParams
): Date[] {
  const {
    intervalMinutes,
    startHour,
    endHour,
    lastDrinkTimestamp,
    maxNotifications,
    notificationsSinceLastDrink,
  } = params;

  if (!isValidTimeFormat(startHour) || !isValidTimeFormat(endHour)) {
    logWarning("Invalid time format for smart notification scheduling", {
      operation: "calculateSmartNotificationTimes",
      component: "NotificationService",
      data: { startHour, endHour },
    });
    return [];
  }

  const [startH, startM] = startHour.split(":").map(Number);
  const [endH, endM] = endHour.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (endMinutes <= startMinutes) {
    logWarning("Overnight schedule not supported for smart notifications", {
      operation: "calculateSmartNotificationTimes",
      component: "NotificationService",
      data: { startHour, endHour },
    });
    return [];
  }

  // Calculate remaining notifications allowed
  const remaining =
    maxNotifications === 0
      ? Infinity
      : maxNotifications - notificationsSinceLastDrink;

  if (remaining <= 0) {
    return [];
  }

  const now = dayjs();
  const times: Date[] = [];

  // Determine anchor: lastDrinkTimestamp if today, otherwise now
  let anchor: dayjs.Dayjs;
  if (lastDrinkTimestamp) {
    const lastDrink = dayjs(lastDrinkTimestamp);
    if (lastDrink.isSame(now, "day")) {
      anchor = lastDrink;
    } else {
      anchor = now;
    }
  } else {
    anchor = now;
  }

  // Generate times for today and tomorrow
  for (let dayOffset = 0; dayOffset < 2; dayOffset++) {
    const baseDate = now.add(dayOffset, "day").startOf("day");

    if (dayOffset === 0) {
      // Today: schedule from anchor + interval increments
      let step = 1;
      while (times.length < remaining) {
        const candidate = anchor.add(step * intervalMinutes, "minute");

        // Stop if candidate is past today
        if (!candidate.isSame(now, "day")) {
          break;
        }

        const candidateMinutes = candidate.hour() * 60 + candidate.minute();

        // Must be within activity hours and in the future
        if (
          candidateMinutes >= startMinutes &&
          candidateMinutes < endMinutes &&
          candidate.toDate() > new Date()
        ) {
          times.push(candidate.toDate());
        }

        // If candidate is past end hour, stop for today
        if (candidateMinutes >= endMinutes) {
          break;
        }

        step++;
      }
    } else {
      // Tomorrow: start from startHour, continue with interval
      let currentMinutes = startMinutes;

      while (currentMinutes < endMinutes && times.length < remaining) {
        const hours = Math.floor(currentMinutes / 60);
        const minutes = currentMinutes % 60;
        const notificationTime = baseDate
          .hour(hours)
          .minute(minutes)
          .toDate();

        if (notificationTime > new Date()) {
          times.push(notificationTime);
        }

        currentMinutes += intervalMinutes;
      }
    }
  }

  return times;
}

/**
 * Schedules smart notifications using the hybrid algorithm.
 * Returns the count of scheduled notifications.
 */
export async function scheduleSmartNotifications(
  params: SmartScheduleParams & { title: string; body: string }
): Promise<{ ids: string[]; count: number }> {
  try {
    await cancelAllNotifications();

    const times = calculateSmartNotificationTimes(params);
    const notificationIds: string[] = [];

    for (const time of times) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: params.title,
          body: params.body,
          data: { action: NOTIFICATION_ACTION_OPEN_HOME },
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

    logInfo("Smart notifications scheduled", {
      operation: "scheduleSmartNotifications",
      component: "NotificationService",
      data: {
        count: notificationIds.length,
        intervalMinutes: params.intervalMinutes,
        maxNotifications: params.maxNotifications,
      },
    });

    return { ids: notificationIds, count: notificationIds.length };
  } catch (error) {
    logError(error, {
      operation: "scheduleSmartNotifications",
      component: "NotificationService",
    });
    return { ids: [], count: 0 };
  }
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
          data: { action: NOTIFICATION_ACTION_OPEN_HOME },
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
