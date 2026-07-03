import { useColorScheme } from "nativewind";

/**
 * Hex color values for JS-driven UI that can't consume Tailwind `dark:`
 * variants directly (chart libraries, FontAwesome `color` props, etc).
 *
 * Keep these in sync with the palette in tailwind.config.js / constants/colors.ts.
 */
export type ThemeColors = {
  chartLine: string;
  chartDataPoint: string;
  chartAxis: string;
  chartText: string;
  chartBg: string;
  chartRules: string;
  chartVerticalLines: string;
  chartReferenceLine: string;
  iconPrimary: string;
  iconMuted: string;
  iconInverse: string;
  iconDanger: string;
  sheetBg: string;
  sheetHandle: string;
};

export const LIGHT_COLORS: ThemeColors = {
  chartLine: "#2680eb",
  chartDataPoint: "#1868d8",
  chartAxis: "#cdd3dc",
  chartText: "#64707e",
  chartBg: "#ffffff",
  chartRules: "#cdd3dc",
  chartVerticalLines: "#e2e6ec",
  chartReferenceLine: "#7eb8f7",
  iconPrimary: "#2680eb",
  iconMuted: "#a3adb9",
  iconInverse: "#ffffff",
  iconDanger: "#ef4444",
  sheetBg: "#ffffff",
  sheetHandle: "#cdd3dc",
};

export const DARK_COLORS: ThemeColors = {
  chartLine: "#7eb8f7",
  chartDataPoint: "#b0d4fc",
  chartAxis: "#4b5563",
  chartText: "#cdd3dc",
  chartBg: "#1e2530",
  chartRules: "#343c48",
  chartVerticalLines: "#343c48",
  chartReferenceLine: "#4d9bf0",
  iconPrimary: "#7eb8f7",
  iconMuted: "#828d9a",
  iconInverse: "#ffffff",
  iconDanger: "#f87171",
  sheetBg: "#1e2530",
  sheetHandle: "#4b5563",
};

/**
 * Returns the hex color palette matching the currently applied color scheme.
 * Use this wherever a component needs raw hex values instead of Tailwind
 * classes (e.g. react-native-gifted-charts props, FontAwesome `color`).
 */
export function useThemeColors(): ThemeColors {
  const { colorScheme } = useColorScheme();
  return colorScheme === "dark" ? DARK_COLORS : LIGHT_COLORS;
}
