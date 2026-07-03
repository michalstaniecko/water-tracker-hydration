import { View, Text, ViewStyle } from "react-native";

type Props = {
  title?: string;
  description?: string;
  backgroundColor?: string;
  titleColor?: string;
  className?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
};

// Callers pass a light-mode Tailwind background class (e.g. "bg-blue-50").
// Map each of the classes actually used across the app to a matching dark
// variant so <Card> stays legible in dark mode without every call site
// needing to know about theming. Tailwind's JIT scanner picks up these
// literal class names because they live in this file's source.
const DARK_BACKGROUND_MAP: Record<string, string> = {
  "bg-blue-50": "dark:bg-blue-950",
  "bg-green-50": "dark:bg-green-950",
  "bg-yellow-50": "dark:bg-yellow-950",
  "bg-purple-50": "dark:bg-purple-950",
  "bg-gray-100": "dark:bg-gray-800",
  "bg-white": "dark:bg-gray-900",
  "bg-blue-900": "dark:bg-blue-950",
};

export function Card({
  title,
  description,
  backgroundColor: customBackgroundColor,
  titleColor: customTitleColor,
  className,
  children,
  style,
}: Props) {
  const backgroundColor = customBackgroundColor || "bg-blue-50";
  const titleColor = customTitleColor || "text-gray-900 dark:text-gray-100";
  // Only map known Tailwind class names; leave raw hex/style values untouched.
  const darkBackgroundColor = backgroundColor.startsWith("bg-")
    ? DARK_BACKGROUND_MAP[backgroundColor]
    : undefined;

  if (!title && !description && !children) {
    return null;
  }

  return (
    <View
      className={`relative p-4 rounded-lg w-full gap-2 shadow-sm ${backgroundColor} ${darkBackgroundColor || ""} ${className}`}
      style={style}
    >
      {!children && (
        <>
          {title && (
            <Text className={`text-lg font-semibold ${titleColor}`}>
              {title}
            </Text>
          )}
          {description && (
            <Text className={"text-gray-700 dark:text-gray-300"}>
              {description}
            </Text>
          )}
        </>
      )}
      {children}
    </View>
  );
}
