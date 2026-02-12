/**
 * Widget Service
 *
 * Handles data synchronization between the React Native app and native home screen widgets.
 * Provides bidirectional sync: app data -> widget display, widget actions -> app state.
 */

import { useWaterStore } from "@/stores/water";
import { useSetupStore } from "@/stores/setup";
import { useStatisticsStore } from "@/stores/statistics";
import { getToday } from "@/utils/date";
import {
  writeWidgetData,
  readWidgetData,
  refreshWidget,
  WidgetData,
} from "@/utils/sharedData";
import { logError, logInfo } from "@/utils/errorLogging";
import i18n from "@/plugins/i18n";

const DAILY_WATER_LIMIT = 20000;

/**
 * Calculates percentage of daily goal achieved
 */
function calculatePercentage(current: number, goal: number): number {
  if (goal <= 0) return 0;
  const percentage = Math.round((current / goal) * 100);
  return Math.min(percentage, 100);
}

/**
 * Prepares widget data from current app state
 */
function prepareWidgetData(): WidgetData {
  const waterStore = useWaterStore.getState();
  const setupStore = useSetupStore.getState();
  const statisticsStore = useStatisticsStore.getState();

  const todayWater = parseInt(waterStore.getTodayWater(), 10) || 0;
  const dailyGoal = parseInt(setupStore.minimumWater, 10) || 2000;
  const glassCapacity = parseInt(setupStore.glassCapacity, 10) || 250;
  const streak = statisticsStore.getCurrentStreak();

  const t = i18n.t.bind(i18n);
  const goalText = t("widgetGoalOf", { goal: dailyGoal });
  const streakLabel = streak === 1 ? t("dayStreak") : t("daysStreak");
  const streakText = `${streak} ${streakLabel}`;

  return {
    todayWater,
    dailyGoal,
    percentage: calculatePercentage(todayWater, dailyGoal),
    streak,
    glassCapacity,
    lastUpdated: new Date().toISOString(),
    dateKey: getToday(),
    goalText,
    streakText,
  };
}

/**
 * Syncs current app data to the widget
 * Call this after any water or setup changes
 */
export async function syncToWidget(): Promise<void> {
  try {
    const widgetData = prepareWidgetData();
    const success = await writeWidgetData(widgetData);

    if (success) {
      await refreshWidget();
      logInfo("Widget data synced successfully", {
        operation: "syncToWidget",
        component: "WidgetService",
        data: {
          todayWater: widgetData.todayWater,
          percentage: widgetData.percentage,
        },
      });
    }
  } catch (error) {
    logError(error, {
      operation: "syncToWidget",
      component: "WidgetService",
    });
  }
}

/**
 * Reads data from widget and syncs any changes back to app
 * Used to detect widget-initiated water additions
 * Returns true if app state was updated
 */
export async function syncFromWidget(): Promise<boolean> {
  try {
    const widgetData = await readWidgetData();

    if (!widgetData) {
      return false;
    }

    const today = getToday();

    // Check if widget data is for today
    if (widgetData.dateKey !== today) {
      return false;
    }

    // Validate widget data bounds
    if (widgetData.todayWater < 0 || widgetData.todayWater > DAILY_WATER_LIMIT) {
      logError(new Error("Widget data contains invalid water amount"), {
        operation: "syncFromWidget",
        component: "WidgetService",
        data: { todayWater: widgetData.todayWater, limit: DAILY_WATER_LIMIT },
      });
      return false;
    }

    const waterStore = useWaterStore.getState();
    const currentWater = parseInt(waterStore.getTodayWater(), 10) || 0;

    // If widget shows more water than app, user added water from widget
    if (widgetData.todayWater > currentWater) {
      await waterStore.setTodayWater(widgetData.todayWater.toString());
      logInfo("Water updated from widget action", {
        operation: "syncFromWidget",
        component: "WidgetService",
        data: {
          previousWater: currentWater,
          newWater: widgetData.todayWater,
        },
      });
      return true;
    }

    return false;
  } catch (error) {
    logError(error, {
      operation: "syncFromWidget",
      component: "WidgetService",
    });
    return false;
  }
}

/**
 * Handles water addition triggered from widget deep link
 * @param amount - Amount of water to add in ml
 */
export async function handleWidgetAddWater(amount: number): Promise<void> {
  try {
    if (amount <= 0 || amount > 5000) {
      logError(new Error("Invalid water amount from widget"), {
        operation: "handleWidgetAddWater",
        component: "WidgetService",
        data: { amount },
      });
      return;
    }

    const waterStore = useWaterStore.getState();
    const currentWater = parseInt(waterStore.getTodayWater(), 10) || 0;
    const newWater = currentWater + amount;

    if (newWater > DAILY_WATER_LIMIT) {
      logError(new Error("Daily water limit exceeded"), {
        operation: "handleWidgetAddWater",
        component: "WidgetService",
        data: { amount, currentWater, newWater, limit: DAILY_WATER_LIMIT },
      });
      return;
    }

    await waterStore.setTodayWater(newWater.toString());

    logInfo("Water added from widget", {
      operation: "handleWidgetAddWater",
      component: "WidgetService",
      data: { amount, previousWater: currentWater, newWater },
    });

  } catch (error) {
    logError(error, {
      operation: "handleWidgetAddWater",
      component: "WidgetService",
      data: { amount },
    });
  }
}

/**
 * Initializes widget data on app start
 * Should be called after stores are initialized
 */
export async function initializeWidgetData(): Promise<void> {
  try {
    // First sync any widget changes to app
    await syncFromWidget();

    // Then sync current app state to widget
    await syncToWidget();

    logInfo("Widget data initialized", {
      operation: "initializeWidgetData",
      component: "WidgetService",
    });
  } catch (error) {
    logError(error, {
      operation: "initializeWidgetData",
      component: "WidgetService",
    });
  }
}

export default {
  syncToWidget,
  syncFromWidget,
  handleWidgetAddWater,
  initializeWidgetData,
};
