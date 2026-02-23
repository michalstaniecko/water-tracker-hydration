/**
 * Firebase Analytics Service
 *
 * Provides Firebase Analytics integration with GDPR consent awareness.
 * All analytics collection respects user consent preferences.
 */

import analytics from "@react-native-firebase/analytics";
import { AnalyticsEvent } from "@/utils/analytics";

let isAnalyticsEnabled = false;

/**
 * Initialize Firebase Analytics based on user consent
 * @param canRequestAds - Whether user has consented to analytics/ads
 */
export async function initializeFirebaseAnalytics(
  canRequestAds: boolean
): Promise<void> {
  try {
    isAnalyticsEnabled = canRequestAds;
    await analytics().setAnalyticsCollectionEnabled(canRequestAds);

    if (__DEV__) {
      console.log(
        `[Firebase Analytics] Collection ${canRequestAds ? "enabled" : "disabled"}`
      );
    }
  } catch (error) {
    console.error("[Firebase Analytics] Initialization error:", error);
  }
}

/**
 * Log an event to Firebase Analytics
 * @param event - The analytics event to log
 */
export async function logFirebaseEvent(event: AnalyticsEvent): Promise<void> {
  if (!isAnalyticsEnabled) {
    if (__DEV__) {
      console.log("[Firebase Analytics] Event skipped (disabled):", event);
    }
    return;
  }

  try {
    const params: Record<string, string | number | undefined> = {
      category: event.category,
      label: event.label,
      value: event.value,
    };

    // Add metadata fields if present
    if (event.metadata) {
      Object.entries(event.metadata).forEach(([key, value]) => {
        if (typeof value === "string" || typeof value === "number") {
          params[key] = value;
        }
      });
    }

    await analytics().logEvent(event.action, params);

    if (__DEV__) {
      console.log("[Firebase Analytics] Event logged:", event.action, params);
    }
  } catch (error) {
    console.error("[Firebase Analytics] Error logging event:", error);
  }
}

/**
 * Log a screen view to Firebase Analytics
 * @param screenName - Name of the screen being viewed
 * @param screenClass - Optional class name of the screen
 */
export async function logScreenView(
  screenName: string,
  screenClass?: string
): Promise<void> {
  if (!isAnalyticsEnabled) {
    return;
  }

  try {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });

    if (__DEV__) {
      console.log("[Firebase Analytics] Screen view:", screenName);
    }
  } catch (error) {
    console.error("[Firebase Analytics] Error logging screen view:", error);
  }
}

/**
 * Set user properties for segmentation
 * @param properties - Key-value pairs of user properties
 */
export async function setUserProperties(
  properties: Record<string, string | null>
): Promise<void> {
  if (!isAnalyticsEnabled) {
    return;
  }

  try {
    for (const [key, value] of Object.entries(properties)) {
      await analytics().setUserProperty(key, value);
    }

    if (__DEV__) {
      console.log("[Firebase Analytics] User properties set:", properties);
    }
  } catch (error) {
    console.error("[Firebase Analytics] Error setting user properties:", error);
  }
}
