import { View, Text } from "react-native";

type Props = {
  title?: string;
  description?: string;
  backgroundColor?: string;
  titleColor?: string;
};

export function Card({
  title,
  description,
  backgroundColor: customBackgroundColor,
  titleColor: customTitleColor,
}: Props) {
  const backgroundColor = customBackgroundColor || "bg-blue-50";
  const titleColor = customTitleColor || "text-gray-900";

  if (!title && !description) {
    return null;
  }

  return (
    <View
      className={`p-4 rounded-lg shadow-sm w-full gap-2 ${backgroundColor}`}
    >
      {title && (
        <Text className={`text-lg font-semibold ${titleColor}`}>{title}</Text>
      )}
      {description && <Text className={"text-gray-700"}>{description}</Text>}
    </View>
  );
}
