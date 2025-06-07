import { Pressable, Text, View } from "react-native";
import { useWater } from "@/hooks/useWater";
import { useSetupStore } from "@/stores/setup";
import { useTranslation } from "react-i18next";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function AddWater() {
  const { t } = useTranslation();
  const { addWater } = useWater();
  const { glassCapacity } = useSetupStore();
  return (
    <View
      className={
        "flex-row justify-stretch bg-blue-500 border border-blue-500 rounded"
      }
    >
      <Pressable
        onPress={addWater}
        className={"flex-1 active:opacity-50 active:bg-blue-400 transition-all"}
      >
        <Text className={" text-white px-3 py-3  text-center font-semibold"}>
          {t(`addWaterButton`, { capacity: glassCapacity })}
        </Text>
      </Pressable>
      <Pressable className={"border-l-2 border-blue-600 justify-center px-3"}>
        <FontAwesome name={"edit"} size={16} color={"#ffffff"} />
      </Pressable>
    </View>
  );
}
