import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import "react-native-reanimated";
import "../global.css";
import { useWaterStore } from "@/stores/water";
import { AppState } from "react-native";
import { useSetupStore } from "@/stores/setup";
import i18n from "@/plugins/i18n";
import { getLocales } from "expo-localization";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const appState = useRef(AppState.currentState);
  const { fetchOrInitData: fetchOrInitWaterData } = useWaterStore();
  const { fetchOrInitData: fetchOrInitSetup, languageCode } = useSetupStore();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    const { languageCode: deviceLanguageCode } = getLocales()[0];
    i18n.changeLanguage(
      languageCode ? languageCode : (deviceLanguageCode as string | undefined),
    );
  }, [languageCode]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        fetchOrInitWaterData();
      }
      appState.current = nextAppState;
    });
    fetchOrInitSetup();
    fetchOrInitWaterData();
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
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
