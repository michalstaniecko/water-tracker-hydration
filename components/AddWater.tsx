import { Pressable, Text, View } from "react-native";
import { useWater } from "@/hooks/useWater";
import { useSetupStore } from "@/stores/setup";
import { useTranslation } from "react-i18next";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useCallback, useRef } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PickerWheel from "@/components/ui/PickerWheel";

export default function AddWater() {
  const { t } = useTranslation();
  const { addWater } = useWater();
  const { glassCapacity } = useSetupStore();

  return (
    <>
      <View
        className={
          "flex-row justify-stretch bg-blue-500 border border-blue-500 rounded"
        }
      >
        <Pressable
          onPress={addWater}
          className={
            "flex-1 active:opacity-50 active:bg-blue-400 transition-all"
          }
        >
          <Text
            className={
              " text-white px-3 py-3 text-lg text-center font-semibold"
            }
          >
            {t(`addWaterButton`, { capacity: glassCapacity })}
          </Text>
        </Pressable>
        <CapacityPicker />
      </View>
    </>
  );
}

const data = Array.from({ length: 19 }, (_, i) => ({
  key: `item-${i}`,
  value: `${50 + i * 25}`,
  label: `${50 + i * 25} ml`,
}));

const CapacityPicker = () => {
  const { t } = useTranslation();
  const { bottom } = useSafeAreaInsets();
  const { setGlassCapacity, glassCapacity } = useSetupStore();
  const ref = useRef<BottomSheetModal>(null);

  const handleSelect = (value: string) => {
    setGlassCapacity(value);
  };

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

  const handleOpen = () => {
    ref.current?.present();
  };

  return (
    <>
      <Pressable
        onPress={handleOpen}
        className={
          "border-l border-blue-600 justify-center px-4 active:opacity-50 active:bg-blue-400 transition-all"
        }
      >
        <FontAwesome name={"edit"} size={16} color={"#ffffff"} />
      </Pressable>
      <BottomSheetModal
        backdropComponent={renderBackdrop}
        enablePanDownToClose={true}
        ref={ref}
        index={0}
      >
        <BottomSheetView>
          <PickerWheel
            options={data}
            value={glassCapacity}
            onValueChange={handleSelect}
          />
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
};
