import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import "../global.css";
import { useWaterStore } from "@/stores/water";
import { useSetupStore } from "@/stores/setup";
import i18n from "@/plugins/i18n";
import { getLocales } from "expo-localization";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useOnboardingStore } from "@/stores/onboarding";
import { useGamificationStore } from "@/stores/gamification";
import { useBackupStore } from "@/stores/backup";
import { useNotificationsStore } from "@/stores/notifications";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useNotificationListeners } from "@/hooks/useNotificationListeners";
import { useActivityHoursRescheduler } from "@/hooks/useActivityHoursRescheduler";
import { useAppLifecycle } from "@/hooks/useAppLifecycle";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
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

  useNotificationListeners();
  useActivityHoursRescheduler(day.startHour, day.endHour, scheduleReminders);
  useAppLifecycle({
    fetchOrInitSetup,
    fetchOrInitWaterData,
    fetchOrInitOnboarding,
    fetchOrInitGamification,
    fetchOrInitNotifications,
    createAutomaticBackup,
    checkAndUnlockAchievements,
  });

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
