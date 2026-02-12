import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import * as Linking from "expo-linking";
import { useNotificationsStore } from "@/stores/notifications";
import { useSetupStore } from "@/stores/setup";
import { getNotificationContent } from "@/services/notificationService";
import { logInfo } from "@/utils/errorLogging";
import {
  initializeWidgetData,
  handleWidgetAddWater,
  syncFromWidget,
  syncToWidget,
} from "@/services/widgetService";

interface UseAppLifecycleParams {
  fetchOrInitSetup: () => Promise<void>;
  fetchOrInitWaterData: () => Promise<void>;
  fetchOrInitOnboarding: () => Promise<void>;
  fetchOrInitGamification: () => Promise<void>;
  fetchOrInitNotifications: () => Promise<void>;
  createAutomaticBackup: () => void;
  checkAndUnlockAchievements: () => void;
}

export function useAppLifecycle({
  fetchOrInitSetup,
  fetchOrInitWaterData,
  fetchOrInitOnboarding,
  fetchOrInitGamification,
  fetchOrInitNotifications,
  createAutomaticBackup,
  checkAndUnlockAchievements,
}: UseAppLifecycleParams) {
  const appState = useRef(AppState.currentState);
  const isNotificationsInitialized = useRef(false);
  const isWidgetInitialized = useRef(false);
  const isSyncing = useRef(false);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          fetchOrInitWaterData();
          checkAndUnlockAchievements();
          // Sync any changes made from widget while app was in background
          // Only sync if widget data has been initialized and no sync is already in progress
          if (isWidgetInitialized.current && !isSyncing.current) {
            isSyncing.current = true;
            try {
              await syncFromWidget();
              // Push fresh app data to widget
              await syncToWidget();
            } finally {
              isSyncing.current = false;
            }
          }

          // Correct notification counter and reschedule when app becomes active
          // Use getState() to get fresh values instead of stale closure values
          // Only reschedule if notifications store has been initialized
          if (isNotificationsInitialized.current) {
            const notificationsState = useNotificationsStore.getState();
            const setupState = useSetupStore.getState();
            if (
              notificationsState.enabled &&
              notificationsState.permissionStatus === "granted"
            ) {
              // Correct counter for notifications fired while in background
              await notificationsState.correctNotificationCount();

              const { title, body } = getNotificationContent();
              await notificationsState.scheduleReminders(
                setupState.day.startHour,
                setupState.day.endHour,
                title,
                body,
              );
            }
          }
        }
        appState.current = nextAppState;
      },
    );

    // Handle deep links from widget
    const handleDeepLink = async (event: { url: string }) => {
      logInfo("Received deep link URL", {
        operation: "handleDeepLink",
        component: "RootLayout",
        data: { url: event.url },
      });
      const parsed = Linking.parse(event.url);

      const { queryParams } = parsed;

      if (queryParams?.action === "addwater" && queryParams?.amount) {
        const amount = parseInt(String(queryParams.amount ?? ""), 10);
        logInfo("Adding water from deep link", {
          operation: "handleDeepLink",
          component: "RootLayout",
          data: { amount },
        });
        if (!isNaN(amount) && amount > 0) {
          await handleWidgetAddWater(amount);
          checkAndUnlockAchievements();
          logInfo("Water added successfully from deep link", {
            operation: "handleDeepLink",
            component: "RootLayout",
            data: { amount },
          });
        }
      } else {
        logInfo("No addwater action found in deep link", {
          operation: "handleDeepLink",
          component: "RootLayout",
          data: { queryParams },
        });
      }
    };

    // Listen for deep links while app is running
    const linkingSubscription = Linking.addEventListener("url", handleDeepLink);

    // Initialize app - must wait for stores before handling deep links
    const initializeApp = async () => {
      // Load all stores first
      await Promise.all([
        fetchOrInitSetup(),
        fetchOrInitWaterData(),
        fetchOrInitOnboarding(),
        fetchOrInitGamification(),
      ]);

      // Initialize notifications after other stores
      await fetchOrInitNotifications();
      isNotificationsInitialized.current = true;

      // Create automatic backup on app start (once per day)
      createAutomaticBackup();

      // Initialize widget data after stores are loaded
      await initializeWidgetData();
      isWidgetInitialized.current = true;

      // Handle deep link that opened the app (only after stores are ready)
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        await handleDeepLink({ url: initialUrl });
      }
    };

    initializeApp();

    return () => {
      subscription.remove();
      linkingSubscription.remove();
    };
  }, []);
}
