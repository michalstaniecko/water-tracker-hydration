import { useEffect } from "react";
import { LayoutAnimation, Platform, UIManager } from "react-native";
// IMPORTANT: This MUST be imported from "nativewind", not "react-native".
// Only nativewind's useColorScheme exposes setColorScheme(), which is what
// actually drives the `dark:` variants across the app.
import { useColorScheme } from "nativewind";
import { useThemeStore } from "@/stores/theme";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * Applies the user's theme preference (auto/light/dark) to NativeWind's
 * color scheme so that `dark:` variants react to it.
 *
 * "auto" maps to NativeWind's "system" scheme, which follows the OS setting.
 *
 * Must be called once near the root of the app (see app/_layout.tsx), after
 * the theme store's preference has been loaded from storage, so the correct
 * scheme is applied before the splash screen is hidden (avoids a flash of
 * the wrong theme).
 */
export function useAppliedTheme() {
  const preference = useThemeStore((state) => state.preference);
  const { colorScheme, setColorScheme } = useColorScheme();

  useEffect(() => {
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    } catch {
      // LayoutAnimation is best-effort; ignore failures (e.g. unsupported platform).
    }
    setColorScheme(preference === "auto" ? "system" : preference);
  }, [preference, setColorScheme]);

  return colorScheme;
}
