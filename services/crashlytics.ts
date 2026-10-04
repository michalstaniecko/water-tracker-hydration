/**
 * Firebase Crashlytics Service
 *
 * Provides crash reporting and error tracking with GDPR consent awareness.
 * All data collection respects user consent preferences.
 */

import {
  getCrashlytics,
  log,
  recordError as recordCrashlyticsError,
  setAttribute as setCrashlyticsAttribute,
  setAttributes as setCrashlyticsAttributes,
  setCrashlyticsCollectionEnabled,
  setUserId as setCrashlyticsUserId,
} from "@react-native-firebase/crashlytics";

let isCrashlyticsEnabled = false;

/**
 * Initialize Crashlytics based on user consent
 * @param enabled - Whether user has consented to crash reporting
 */
export async function initializeCrashlytics(enabled: boolean): Promise<void> {
  try {
    isCrashlyticsEnabled = enabled;
    await setCrashlyticsCollectionEnabled(getCrashlytics(), enabled);

    if (__DEV__) {
      console.log(
        `[Crashlytics] Collection ${enabled ? "enabled" : "disabled"}`
      );
    }
  } catch (error) {
    console.error("[Crashlytics] Initialization error:", error);
  }
}

/**
 * Record a non-fatal error to Crashlytics
 * @param error - The error to record
 * @param context - Additional context about the error
 */
export function recordError(
  error: Error,
  context?: Record<string, string>
): void {
  if (!isCrashlyticsEnabled) {
    if (__DEV__) {
      console.log("[Crashlytics] Error skipped (disabled):", error.message);
    }
    return;
  }

  try {
    // Set custom attributes for the error
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        setCrashlyticsAttribute(getCrashlytics(), key, value);
      });
    }

    recordCrashlyticsError(getCrashlytics(), error);

    if (__DEV__) {
      console.log("[Crashlytics] Error recorded:", error.message, context);
    }
  } catch (crashError) {
    console.error("[Crashlytics] Failed to record error:", crashError);
  }
}

/**
 * Log a message as a breadcrumb in Crashlytics
 * @param message - The message to log
 */
export function logMessage(message: string): void {
  if (!isCrashlyticsEnabled) {
    return;
  }

  try {
    log(getCrashlytics(), message);

    if (__DEV__) {
      console.log("[Crashlytics] Message logged:", message);
    }
  } catch (error) {
    console.error("[Crashlytics] Failed to log message:", error);
  }
}

/**
 * Set a custom key-value attribute for crash reports
 * @param key - Attribute name
 * @param value - Attribute value
 */
export function setAttribute(key: string, value: string): void {
  if (!isCrashlyticsEnabled) {
    return;
  }

  try {
    setCrashlyticsAttribute(getCrashlytics(), key, value);
  } catch (error) {
    console.error("[Crashlytics] Failed to set attribute:", error);
  }
}

/**
 * Set multiple custom attributes at once
 * @param attributes - Key-value pairs of attributes
 */
export function setAttributes(attributes: Record<string, string>): void {
  if (!isCrashlyticsEnabled) {
    return;
  }

  try {
    setCrashlyticsAttributes(getCrashlytics(), attributes);
  } catch (error) {
    console.error("[Crashlytics] Failed to set attributes:", error);
  }
}

/**
 * Set the user identifier for crash reports
 * @param userId - User identifier (should be anonymized)
 */
export function setUserId(userId: string): void {
  if (!isCrashlyticsEnabled) {
    return;
  }

  try {
    setCrashlyticsUserId(getCrashlytics(), userId);
  } catch (error) {
    console.error("[Crashlytics] Failed to set user ID:", error);
  }
}
