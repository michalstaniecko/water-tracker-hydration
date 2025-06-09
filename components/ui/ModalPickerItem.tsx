import { Pressable, Text, View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import colors from "tailwindcss/colors";
import { LayoutChangeEvent } from "react-native";

type Option = {
  label: string;
  value: string;
};

type ItemProps = {
  option: Option;
  onSelect: (value: string) => void;
  selected?: boolean;
  onMeasureHeight?: (height: number) => void;
};

export const ModalPickerItem = ({
  option,
  onSelect,
  selected,
  onMeasureHeight,
}: ItemProps) => {
  const handleLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    onMeasureHeight?.(option.value, height);
  };

  return (
    <Pressable onPress={() => onSelect(option.value)} onLayout={handleLayout}>
      {({ pressed }) => (
        <View
          className={`${pressed ? "bg-gray-200/100" : "bg-gray-200/0"} transition-[background-color] duration-100 flex-row items-center justify-between`}
        >
          <View>
            <Text
              className={`w-full text-lg py-3 rounded  ${selected && "font-semibold"}`}
            >
              {option.label}
            </Text>
          </View>

          <View>
            {selected && (
              <FontAwesome name="check" size={20} color={colors.green[500]} />
            )}
          </View>
        </View>
      )}
    </Pressable>
  );
};
