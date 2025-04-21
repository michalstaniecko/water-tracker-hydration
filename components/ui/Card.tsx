import { View, Text } from "react-native";

type Props = {
  title?: string;
  description?: string;
  backgroundColor?: string;
  titleColor?: string;
  className?: string;
  children?: React.ReactNode;
};

export function Card({
  title,
  description,
  backgroundColor: customBackgroundColor,
  titleColor: customTitleColor,
  className,
  children,
}: Props) {
  const backgroundColor = customBackgroundColor || "bg-blue-50";
  const titleColor = customTitleColor || "text-gray-900";

  if (!title && !description && !children) {
    return null;
  }

  return (
    <View
      className={`relative p-4 rounded-lg w-full gap-2 shadow-sm ${backgroundColor} ${className}`}
    >
      {!children && (
        <>
          {title && (
            <Text className={`text-lg font-semibold ${titleColor}`}>
              {title}
            </Text>
          )}
          {description && (
            <Text className={"text-gray-700"}>{description}</Text>
          )}
        </>
      )}
      {children}
    </View>
  );
}
