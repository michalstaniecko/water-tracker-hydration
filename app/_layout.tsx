import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import "react-native-reanimated";
import "../global.css";
import { useWaterStore } from "@/stores/water";
import { AppState } from "react-native";
import { useSetupStore } from "@/stores/setup";
import i18n from "@/plugins/i18n";
import { getLocales } from "expo-localization";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useOnboardingStore } from "@/stores/onboarding";
import { useGamificationStore } from "@/stores/gamification";
import { useBackupStore } from "@/stores/backup";
import { useNotificationsStore } from "@/stores/notifications";
import {
  addNotificationResponseListener,
  addNotificationReceivedListener,
  getNotificationContent,
} from "@/services/notificationService";
import { NOTIFICATION_ACTION_OPEN_HOME } from "@/constants/notifications";
import ErrorBoundary from "@/components/ErrorBoundary";
import { logInfo } from "@/utils/errorLogging";
import * as Linking from "expo-linking";
import {
  initializeWidgetData,
  handleWidgetAddWater,
  syncFromWidget,
} from "@/services/widgetService";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const appState = useRef(AppState.currentState);
  const isInitialActivityHoursMount = useRef(true);
  const isNotificationsInitialized = useRef(false);
  const { fetchOrInitData: fetchOrInitWaterData } = useWaterStore();
  const {
    fetchOrInitData: fetchOrInitSetup,
    languageCode,
    day,
  } = useSetupStore();
  const { fetchOrInitData: fetchOrInitOnboarding } = useOnboardingStore();
  const {
    fetchOrInitData: fetchOrInitGamification,
    checkAndUnlockAchievements,
  } = useGamificationStore();
  const { createAutomaticBackup } = useBackupStore();
  const { fetchOrInitData: fetchOrInitNotifications, scheduleReminders } =
    useNotificationsStore();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    const { languageCode: deviceLanguageCode } = getLocales()[0];
    i18n.changeLanguage(
      languageCode ? languageCode : (deviceLanguageCode as string | undefined),
    );
  }, [languageCode]);

  // Handle notification tap - deep linking
  useEffect(() => {
    const subscription = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.action === NOTIFICATION_ACTION_OPEN_HOME) {
        router.push("/(tabs)/");
      }
    });

    return () => subscription.remove();
  }, [router]);

  // Track received notifications in foreground to increment counter
  useEffect(() => {
    const subscription = addNotificationReceivedListener(() => {
      const notificationsState = useNotificationsStore.getState();
      if (notificationsState.enabled) {
        notificationsState.onNotificationReceived();
      }
    });

    return () => subscription.remove();
  }, []);

  // Reschedule notifications when activity hours change (skip initial mount)
  useEffect(() => {
    if (isInitialActivityHoursMount.current) {
      isInitialActivityHoursMount.current = false;
      return;
    }
    const { enabled, permissionStatus } = useNotificationsStore.getState();
    if (enabled && permissionStatus === "granted") {
      const { title, body } = getNotificationContent();
      scheduleReminders(day.startHour, day.endHour, title, body);
    }
  }, [day.startHour, day.endHour, scheduleReminders]);

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
          await syncFromWidget();

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
        const amount = parseInt(queryParams.amount as string, 10);
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

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary componentName="App Root">
      <GestureHandlerRootView>
        <BottomSheetModalProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
