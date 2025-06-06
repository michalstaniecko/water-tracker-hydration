import { Pressable, Text, View } from "react-native";
import { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import colors from "tailwindcss/colors";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Label } from "@/components/ui/Label";

type Option = {
  label: string;
  value: string;
};

export type ModalPickerProps = {
  label: string;
  options: Option[];
  onSelect: (value: string) => void;
  value?: string;
};

export const ModalPicker = ({
  options,
  onSelect,
  label,
  value: initValue,
}: ModalPickerProps) => {
  const { t } = useTranslation();
  const { bottom } = useSafeAreaInsets();
  const ref = useRef<BottomSheetModal>(null);

  const handleSelect = (value: string) => {
    onSelect(value);
  };

  // renders
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior={"close"}
      />
    ),
    [],
  );

  return (
    <>
      <Pressable onPress={() => ref.current?.present()}>
        <Label>{label}</Label>
        <Text className={"leading-[32px] py-0 border-b-2 font-normal"}>
          {options.find((option) => option.value === initValue)?.label}
        </Text>
      </Pressable>
      <BottomSheetModal
        backdropComponent={renderBackdrop}
        enablePanDownToClose={true}
        ref={ref}
      >
        <BottomSheetView
          style={{
            flex: 1,
            paddingBottom: bottom,
          }}
        >
          <View className={"p-5"}>
            <Text className={"uppercase"}>{label}</Text>
            <View className={"mt-3 mb-5"}>
              {options.map((option, index) => (
                <Item
                  key={option.value}
                  option={{ label: option.label, value: option.value }}
                  onSelect={handleSelect}
                  selected={initValue === option.value}
                />
              ))}
            </View>

            <Pressable
              className={"p-3 bg-blue-500 rounded"}
              onPress={() => ref?.current?.close()}
            >
              <Text className={"text-white text-center font-bold text-md"}>
                {t("close")}
              </Text>
            </Pressable>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
};

type ItemProps = {
  option: Option;
  onSelect: (value: string) => void;
  selected?: boolean;
};

const Item = ({ option, onSelect, selected }: ItemProps) => {
  return (
    <Pressable onPress={() => onSelect(option.value)}>
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
