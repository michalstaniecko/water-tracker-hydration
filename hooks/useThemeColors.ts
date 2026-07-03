import { useColorScheme } from "nativewind";
import { colors } from "@/constants/colors";

/**
 * Hex color values for JS-driven UI that can't consume Tailwind `dark:`
 * variants directly (chart libraries, FontAwesome `color` props, navigation
 * option colors, etc).
 *
 * Values reference the shared palette in `constants/colors.ts` (itself derived
 * from tailwind.config.js) so there is a single source of truth for each hue —
 * only the light/dark *shade selection* lives here. `iconDanger` is the sole
 * literal, since the app palette has no dedicated red scale.
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
  navActive: string;
  navInactive: string;
  navBg: string;
  navBorder: string;
  navText: string;
  trackSuccess: string;
  trackProgress: string;
};

export const LIGHT_COLORS: ThemeColors = {
  chartLine: colors.blue[500],
  chartDataPoint: colors.blue[600],
  chartAxis: colors.gray[300],
  chartText: colors.gray[600],
  chartBg: colors.white,
  chartRules: colors.gray[300],
  chartVerticalLines: colors.gray[200],
  chartReferenceLine: colors.blue[300],
  iconPrimary: colors.blue[500],
  iconMuted: colors.gray[400],
  iconInverse: colors.white,
  iconDanger: "#ef4444",
  sheetBg: colors.white,
  sheetHandle: colors.gray[300],
  navActive: colors.blue[600],
  navInactive: colors.gray[500],
  navBg: colors.white,
  navBorder: colors.gray[200],
  navText: colors.gray[900],
  trackSuccess: colors.green[100],
  trackProgress: colors.blue[100],
};

export const DARK_COLORS: ThemeColors = {
  chartLine: colors.blue[300],
  chartDataPoint: colors.blue[200],
  chartAxis: colors.gray[700],
  chartText: colors.gray[300],
  chartBg: colors.gray[900],
  chartRules: colors.gray[800],
  chartVerticalLines: colors.gray[800],
  chartReferenceLine: colors.blue[400],
  iconPrimary: colors.blue[300],
  iconMuted: colors.gray[500],
  iconInverse: colors.white,
  iconDanger: "#f87171",
  sheetBg: colors.gray[900],
  sheetHandle: colors.gray[700],
  navActive: colors.blue[400],
  navInactive: colors.gray[400],
  navBg: colors.gray[950],
  navBorder: colors.gray[800],
  navText: colors.gray[100],
  trackSuccess: colors.green[900],
  trackProgress: colors.blue[900],
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
