/**
 * Notification-related constants for Water Tracker Hydration app.
 * Centralizes configuration for push notification reminders.
 */

// Available reminder intervals in minutes
export const REMINDER_INTERVALS = [60, 120, 180] as const;
export type ReminderInterval = (typeof REMINDER_INTERVALS)[number];

// Maximum notification options — 0 means unlimited and is placed last for UI display order
export const MAX_NOTIFICATION_OPTIONS = [1, 2, 3, 0] as const;
export type MaxNotificationOption = (typeof MAX_NOTIFICATION_OPTIONS)[number];
export const DEFAULT_MAX_NOTIFICATIONS: MaxNotificationOption = 3;

// Default values
export const DEFAULT_REMINDER_INTERVAL: ReminderInterval = 120;
export const DEFAULT_REMINDERS_ENABLED = false;

// Storage key for notifications store
export const NOTIFICATIONS_STORAGE_KEY = "notificationsData";

// Notification channel ID for Android
export const NOTIFICATION_CHANNEL_ID = "water-reminders";
export const NOTIFICATION_CHANNEL_NAME = "Water Reminders";

// Whether notification sound is enabled
export const NOTIFICATION_SOUND_ENABLED = true;

// Deep link action when notification is tapped
export const NOTIFICATION_ACTION_OPEN_HOME = "open_home";
