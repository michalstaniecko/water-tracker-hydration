/**
 * Shared data utilities for widget communication
 *
 * Handles data sharing between React Native app and native widgets
 * using App Groups (iOS) and SharedPreferences (Android)
 */

import { Platform } from "react-native";
import { requireOptionalNativeModule } from "expo";
import { logError, logWarning } from "./errorLogging";

const HydrationWidgetModule = requireOptionalNativeModule("HydrationWidget");

// App Group identifier for iOS
export const APP_GROUP_ID = "group.website.ihumbak.hydration.expowidgets";

// SharedPreferences name for Android
export const SHARED_PREFS_NAME = "website.ihumbak.hydration.widget";

/**
 * Widget data structure shared between app and native widgets
 */
export interface WidgetData {
  todayWater: number;
  dailyGoal: number;
  percentage: number;
  streak: number;
  glassCapacity: number;
  lastUpdated: string;
  dateKey: string;
  goalText?: string;
  streakText?: string;
}

/**
 * Default widget data when no data is available
 */
export function getDefaultWidgetData(): WidgetData {
  return {
    todayWater: 0,
    dailyGoal: 2000,
    percentage: 0,
    streak: 0,
    glassCapacity: 250,
    lastUpdated: new Date().toISOString(),
    dateKey: "",
  };
}

/**
 * Write widget data to shared storage
 * Uses native module bridge to write to App Groups (iOS) or SharedPreferences (Android)
 */
export async function writeWidgetData(data: WidgetData): Promise<boolean> {
  try {
    if (!HydrationWidgetModule) {
      logWarning("HydrationWidget native module not available", {
        operation: "writeWidgetData",
        component: "SharedData",
        data: { platform: Platform.OS },
      });
      return false;
    }

    if (Platform.OS === "ios") {
      await HydrationWidgetModule.updateWidgetData({
        todayWater: data.todayWater,
        dailyGoal: data.dailyGoal,
        percentage: data.percentage,
        streak: data.streak,
        glassCapacity: data.glassCapacity,
        lastUpdated: data.lastUpdated,
        dateKey: data.dateKey,
      });
    } else if (Platform.OS === "android") {
      await HydrationWidgetModule.updateWidgetData(
        SHARED_PREFS_NAME,
        JSON.stringify(data)
      );
    }

    return true;
  } catch (error) {
    logError(error, {
      operation: "writeWidgetData",
      component: "SharedData",
      data: { platform: Platform.OS },
    });
    return false;
  }
}

/**
 * Read widget data from shared storage
 * Used to detect changes made from widget (e.g., quick add water button)
 */
export async function readWidgetData(): Promise<WidgetData | null> {
  try {
    if (!HydrationWidgetModule) {
      logWarning("HydrationWidget native module not available", {
        operation: "readWidgetData",
        component: "SharedData",
        data: { platform: Platform.OS },
      });
      return null;
    }

    if (Platform.OS === "ios") {
      const data = await HydrationWidgetModule.readWidgetData();
      if (data) {
        return {
          todayWater: data.todayWater || 0,
          dailyGoal: data.dailyGoal || 2000,
          percentage: data.percentage || 0,
          streak: data.streak || 0,
          glassCapacity: data.glassCapacity || 250,
          lastUpdated: data.lastUpdated || new Date().toISOString(),
          dateKey: data.dateKey || "",
        };
      }
    } else if (Platform.OS === "android") {
      const jsonString = await HydrationWidgetModule.readWidgetData(SHARED_PREFS_NAME);
      if (jsonString) {
        const data = JSON.parse(jsonString);
        return {
          todayWater: data.todayWater || 0,
          dailyGoal: data.dailyGoal || 2000,
          percentage: data.percentage || 0,
          streak: data.streak || 0,
          glassCapacity: data.glassCapacity || 250,
          lastUpdated: data.lastUpdated || new Date().toISOString(),
          dateKey: data.dateKey || "",
        };
      }
    }

    return null;
  } catch (error) {
    logError(error, {
      operation: "readWidgetData",
      component: "SharedData",
      data: { platform: Platform.OS },
    });
    return null;
  }
}

/**
 * Request widget refresh
 * Triggers native widget to reload and display updated data
 */
export async function refreshWidget(): Promise<boolean> {
  try {
    if (!HydrationWidgetModule) {
      logWarning("HydrationWidget native module not available", {
        operation: "refreshWidget",
        component: "SharedData",
        data: { platform: Platform.OS },
      });
      return false;
    }

    if (Platform.OS === "ios") {
      await HydrationWidgetModule.reloadWidget();
    } else if (Platform.OS === "android") {
      await HydrationWidgetModule.refreshWidget();
    }

    return true;
  } catch (error) {
    logError(error, {
      operation: "refreshWidget",
      component: "SharedData",
      data: { platform: Platform.OS },
    });
    return false;
  }
}
