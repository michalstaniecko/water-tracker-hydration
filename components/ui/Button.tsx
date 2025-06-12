import { Pressable, Text, View } from "react-native";

type ButtonProps = {
  text: string;
  onPress?: () => void;
};
export default function Button({ text, onPress }: ButtonProps) {
  const handlePress = () => {
    onPress?.();
  };
  return (
    <Pressable
      onPress={handlePress}
      className={
        "bg-blue-500  p-4 rounded-lg active:opacity-50 active:bg-blue-400 transition-all"
      }
    >
      <Text className={"text-white text-lg text-center font-bold"}>{text}</Text>
    </Pressable>
  );
}
