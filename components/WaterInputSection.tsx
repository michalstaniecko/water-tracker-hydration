import { View, Text, Pressable } from "react-native";
import { useSetupStore } from "@/stores/setup";
import { useWaterStore } from "@/stores/water";
import { useGamificationStore } from "@/stores/gamification";
import { useWater, rescheduleNotificationsAfterDrink } from "@/hooks/useWater";
import { useTranslation } from "react-i18next";
import { useHaptics } from "@/hooks/useHaptics";
import { logError } from "@/utils/errorLogging";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useMemo, useState } from "react";
import PickerWheel from "@/components/ui/PickerWheel";
import Modal, { ModalHeader } from "@/components/ui/Modal";
import { GLASS_CAPACITY_OPTIONS, MAX_DAILY_WATER } from "@/constants/app";

export default function WaterInputSection() {
  const { t } = useTranslation();
  const { quickActions, glassCapacity, setGlassCapacity } = useSetupStore();
  const waterStore = useWaterStore();
  const { water, addWater, removeWater } = useWater();
  const gamificationStore = useGamificationStore();
  const { impactMedium, impactLight } = useHaptics();
  const [pickerVisible, setPickerVisible] = useState(false);

  const enabledActions = useMemo(
    () => quickActions.filter((action) => action.enabled),
    [quickActions],
  );

  const handleQuickAction = async (amount: number) => {
    try {
      impactMedium();
      const currentWater = waterStore.getTodayWater();
      const newCurrentWater = Math.min(
        Number(currentWater) + amount,
        MAX_DAILY_WATER,
      );
      await waterStore.setTodayWater(newCurrentWater.toString());
      gamificationStore.checkAndUnlockAchievements().catch(() => {});
      await rescheduleNotificationsAfterDrink();
    } catch (error) {
      logError(error, {
        operation: "handleQuickAction",
        component: "WaterInputSection",
      });
    }
  };

  const handleAddWater = () => {
    impactMedium();
    addWater();
  };

  const handleRemoveWater = () => {
    if (Number(water) > 0) {
      impactLight();
      removeWater();
    }
  };

  const isDisabled = Number(water) <= 0;

  const handleCapacitySelect = (value: string) => {
    setGlassCapacity(value);
  };

  return (
    <View className="gap-3">
      {enabledActions.length > 0 && (
        <View className="bg-white rounded-lg p-4 border border-gray-200">
          <Text className="text-sm text-gray-600 mb-3 font-medium">
            {t("quickActions")}
          </Text>
          <View className="flex-row gap-2">
            {enabledActions.map((action) => (
              <Pressable
                key={action.id}
                onPress={() => handleQuickAction(action.amount)}
                className="flex-1 bg-blue-500 rounded-lg p-3 active:opacity-70 active:bg-blue-600"
                accessibilityRole="button"
                accessibilityLabel={t("quickActionAccessibilityLabel", {
                  amount: action.amount,
                  label: t(action.labelKey),
                })}
                accessibilityHint={t("quickActionAccessibilityHint", {
                  amount: action.amount,
                })}
              >
                <View className="items-center">
                  <FontAwesome name="plus-circle" size={20} color="#ffffff" />
                  <Text className="text-white font-bold text-base mt-1">
                    {action.amount}ml
                  </Text>
                  <Text className="text-blue-100 text-xs">
                    {t(action.labelKey)}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      <View className="flex-row gap-2">
        <Pressable
          onPress={handleRemoveWater}
          className={`border border-blue-500 rounded justify-center px-4 ${isDisabled ? "opacity-30" : "active:opacity-50"}`}
          accessibilityRole="button"
          accessibilityLabel={t("removeWaterButton", {
            capacity: glassCapacity,
          })}
        >
          <FontAwesome name="minus" size={16} color="#1868d8" />
        </Pressable>

        <Pressable
          onPress={handleAddWater}
          className="flex-1 bg-blue-500 rounded active:opacity-50 active:bg-blue-400"
        >
          <Text className="text-white px-3 py-3 text-lg text-center font-semibold">
            {t("addWaterButton", { capacity: glassCapacity })}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setPickerVisible(true)}
          className="bg-blue-500 rounded justify-center px-4 active:opacity-50 active:bg-blue-400"
          accessibilityRole="button"
          accessibilityLabel={t("setup:glassCapacityInMl")}
        >
          <FontAwesome name="edit" size={16} color="#ffffff" />
        </Pressable>
      </View>

      <Modal
        visible={pickerVisible}
        onDismiss={setPickerVisible}
        closeText={t("close")}
      >
        <ModalHeader title={t("setup:glassCapacityInMl")} />
        <PickerWheel
          options={GLASS_CAPACITY_OPTIONS}
          value={glassCapacity}
          onValueChange={handleCapacitySelect}
        />
      </Modal>
    </View>
  );
}
