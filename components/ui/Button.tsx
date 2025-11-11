import { Pressable, Text } from "react-native";

type ButtonProps = {
  text: string;
  onPress?: () => void;
  disabled?: boolean;
};
export default function Button({ text, onPress, disabled }: ButtonProps) {
  const handlePress = () => {
    if (!disabled) {
      onPress?.();
    }
  };
  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      className={
        disabled
          ? "bg-gray-400 p-4 rounded-lg opacity-50"
          : "bg-blue-500  p-4 rounded-lg active:opacity-50 active:bg-blue-400 transition-all"
      }
    >
      <Text className={"text-white text-lg text-center font-bold"}>{text}</Text>
    </Pressable>
  );
}
