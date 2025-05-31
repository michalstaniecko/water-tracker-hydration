import { Text } from "react-native";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  isFocused?: boolean;
};

export const Label = ({ children, isFocused = false }: Props) => {
  return (
    <Text
      className={`text-xs font-semibold uppercase ${isFocused && "text-blue-700"}`}
    >
      {children}
    </Text>
  );
};
