import { Text } from "react-native";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  isFocused?: boolean;
};

export const Label = ({ children, isFocused = false }: Props) => {
  return (
    <Text
      className={`text-xs font-semibold uppercase text-gray-700 dark:text-gray-300 ${isFocused && "text-blue-700 dark:text-blue-400"}`}
    >
      {children}
    </Text>
  );
};
