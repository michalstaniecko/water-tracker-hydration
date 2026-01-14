/**
 * Notification-related constants for Water Tracker Hydration app.
 * Centralizes configuration for push notification reminders.
 */

// Available reminder intervals in minutes
export const REMINDER_INTERVALS = [60, 120, 180] as const;
export type ReminderInterval = (typeof REMINDER_INTERVALS)[number];

// Default values
export const DEFAULT_REMINDER_INTERVAL: ReminderInterval = 120;
export const DEFAULT_REMINDERS_ENABLED = false;

// Storage key for notifications store
export const NOTIFICATIONS_STORAGE_KEY = "notificationsData";

// Notification channel ID for Android
export const NOTIFICATION_CHANNEL_ID = "water-reminders";
export const NOTIFICATION_CHANNEL_NAME = "Water Reminders";

// Deep link action when notification is tapped
export const NOTIFICATION_ACTION_OPEN_HOME = "open_home";
