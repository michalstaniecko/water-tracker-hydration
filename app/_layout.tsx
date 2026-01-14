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
import { addNotificationResponseListener } from "@/services/notificationService";
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
  const {
    fetchOrInitData: fetchOrInitNotifications,
    scheduleReminders,
    enabled: notificationsEnabled,
    permissionStatus,
  } = useNotificationsStore();
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
      if (data?.action === "open_home") {
        router.push("/(tabs)/");
      }
    });

    return () => subscription.remove();
  }, [router]);

  // Reschedule notifications when activity hours change
  useEffect(() => {
    if (notificationsEnabled && permissionStatus === "granted") {
      const title = i18n.t("reminderTitle", { ns: "notifications" });
      const body = i18n.t("reminderBody", { ns: "notifications" });
      scheduleReminders(day.startHour, day.endHour, title, body);
    }
  }, [day.startHour, day.endHour, notificationsEnabled, permissionStatus]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        fetchOrInitWaterData();
        checkAndUnlockAchievements();

        // Reschedule notifications when app becomes active
        if (notificationsEnabled && permissionStatus === "granted") {
          const title = i18n.t("reminderTitle", { ns: "notifications" });
          const body = i18n.t("reminderBody", { ns: "notifications" });
          scheduleReminders(day.startHour, day.endHour, title, body);
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
