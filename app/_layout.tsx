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
  getNotificationContent,
} from "@/services/notificationService";
import { NOTIFICATION_ACTION_OPEN_HOME } from "@/constants/notifications";
import ErrorBoundary from "@/components/ErrorBoundary";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const appState = useRef(AppState.currentState);
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

  // Reschedule notifications when activity hours change
  useEffect(() => {
    const { enabled, permissionStatus } = useNotificationsStore.getState();
    if (enabled && permissionStatus === "granted") {
      const { title, body } = getNotificationContent();
      scheduleReminders(day.startHour, day.endHour, title, body);
    }
  }, [day.startHour, day.endHour, scheduleReminders]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        fetchOrInitWaterData();
        checkAndUnlockAchievements();

        // Reschedule notifications when app becomes active
        // Use getState() to get fresh values instead of stale closure values
        const notificationsState = useNotificationsStore.getState();
        const setupState = useSetupStore.getState();
        if (
          notificationsState.enabled &&
          notificationsState.permissionStatus === "granted"
        ) {
          const { title, body } = getNotificationContent();
          notificationsState.scheduleReminders(
            setupState.day.startHour,
            setupState.day.endHour,
            title,
            body,
          );
        }
      }
      appState.current = nextAppState;
    });
    fetchOrInitSetup();
    fetchOrInitWaterData();
    fetchOrInitOnboarding();
    fetchOrInitGamification();
    fetchOrInitNotifications();

    // Create automatic backup on app start (once per day)
    createAutomaticBackup();

    return () => {
      subscription.remove();
    };
  }, [
    fetchOrInitSetup,
    fetchOrInitWaterData,
    fetchOrInitOnboarding,
    fetchOrInitGamification,
    fetchOrInitNotifications,
    checkAndUnlockAchievements,
    createAutomaticBackup,
  ]);

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
