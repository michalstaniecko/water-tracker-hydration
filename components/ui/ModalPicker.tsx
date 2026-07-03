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
import { useThemeColors } from "@/hooks/useThemeColors";

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
  const themeColors = useThemeColors();

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
        <Text
          className={
            "leading-[32px] py-0 border-b-2 border-gray-300 dark:border-gray-600 font-normal text-gray-900 dark:text-gray-100"
          }
        >
          {options.find((option) => option.value === initValue)?.label}
        </Text>
      </Pressable>
      <BottomSheetModal
        backdropComponent={renderBackdrop}
        enablePanDownToClose={true}
        ref={ref}
        backgroundStyle={{ backgroundColor: themeColors.sheetBg }}
        handleIndicatorStyle={{ backgroundColor: themeColors.sheetHandle }}
      >
        <BottomSheetView
          style={{
            paddingBottom: bottom,
          }}
        >
          <View className={"p-5"}>
            <Text className={"uppercase text-gray-900 dark:text-gray-100"}>
              {label}
            </Text>
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
          className={`${pressed ? "bg-gray-200 dark:bg-gray-700" : ""} flex-row items-center justify-between`}
        >
          <Text
            className={`flex-1 text-lg py-3 text-gray-900 dark:text-gray-100 ${selected ? "font-semibold" : ""}`}
            style={{ includeFontPadding: false }}
          >
            {option.label}
          </Text>
          {selected && (
            <FontAwesome name="check" size={20} color={colors.green[500]} />
          )}
        </View>
      )}
    </Pressable>
  );
};
