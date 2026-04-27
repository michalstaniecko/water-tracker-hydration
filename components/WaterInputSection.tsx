import { View, Text, Pressable } from "react-native";
import { useSetupStore } from "@/stores/setup";
import { useWaterStore } from "@/stores/water";
import { useGamificationStore } from "@/stores/gamification";
import { rescheduleNotificationsAfterDrink } from "@/hooks/useWater";
import { useTranslation } from "react-i18next";
import { useHaptics } from "@/hooks/useHaptics";
import { logError } from "@/utils/errorLogging";
import { useWaterInterstitial } from "@/hooks/useWaterInterstitial";
import { AdCountdownBanner } from "@/components/ads/AdCountdownBanner";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useMemo, useState } from "react";
import PickerWheel from "@/components/ui/PickerWheel";
import Modal, { ModalHeader } from "@/components/ui/Modal";
import { GLASS_CAPACITY_OPTIONS, MAX_DAILY_WATER } from "@/constants/app";

type ModalMode = "add" | "remove" | null;

export default function WaterInputSection() {
  const { t } = useTranslation();
  const { quickActions, glassCapacity } = useSetupStore();
  const waterStore = useWaterStore();
  const gamificationStore = useGamificationStore();
  const { impactMedium, impactLight } = useHaptics();
  const { trackWaterAdd, countdown } = useWaterInterstitial();
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedAmount, setSelectedAmount] = useState(glassCapacity);

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
      trackWaterAdd().catch(() => {});
      await rescheduleNotificationsAfterDrink();
    } catch (error) {
      logError(error, {
        operation: "handleQuickAction",
        component: "WaterInputSection",
      });
    }
  };

  const openModal = (mode: "add" | "remove") => {
    setSelectedAmount(glassCapacity);
    setModalMode(mode);
  };

  const handleConfirm = async () => {
    const amount = Number(selectedAmount);
    if (modalMode === "add") {
      try {
        impactMedium();
        const currentWater = Number(waterStore.getTodayWater());
        const newWater = Math.min(currentWater + amount, MAX_DAILY_WATER);
        await waterStore.setTodayWater(newWater.toString());
        gamificationStore.checkAndUnlockAchievements().catch(() => {});
        trackWaterAdd().catch(() => {});
        await rescheduleNotificationsAfterDrink();
      } catch (error) {
        logError(error, {
          operation: "handleConfirmAdd",
          component: "WaterInputSection",
        });
      }
    } else if (modalMode === "remove") {
      impactLight();
      const currentWater = Number(waterStore.getTodayWater());
      const newWater = Math.max(currentWater - amount, 0);
      await waterStore.setTodayWater(newWater.toString());
    }
    setModalMode(null);
  };

  const modalTitle =
    modalMode === "add" ? t("selectAmountToAdd") : t("selectAmountToRemove");

  const confirmText =
    modalMode === "add"
      ? t("addAmount", { amount: selectedAmount })
      : t("removeAmount", { amount: selectedAmount });

  return (
    <View className="gap-3">
      <AdCountdownBanner countdown={countdown} />
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
          onPress={() => openModal("remove")}
          className="flex-1 flex-row items-center justify-center gap-2 border border-blue-500 rounded py-3 active:opacity-50"
          accessibilityRole="button"
          accessibilityLabel={t("removeWater")}
        >
          <FontAwesome name="minus" size={14} color="#1868d8" />
          <Text className="text-blue-600 text-base font-semibold">
            {t("removeWater")}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => openModal("add")}
          className="flex-1 flex-row items-center justify-center gap-2 bg-blue-500 rounded py-3 active:opacity-50 active:bg-blue-400"
          accessibilityRole="button"
          accessibilityLabel={t("addWater")}
        >
          <FontAwesome name="plus" size={14} color="#ffffff" />
          <Text className="text-white text-base font-semibold">
            {t("addWater")}
          </Text>
        </Pressable>
      </View>

      <Modal
        visible={modalMode !== null}
        onDismiss={() => setModalMode(null)}
        onConfirm={handleConfirm}
        confirmText={confirmText}
      >
        <ModalHeader title={modalTitle} />
        <PickerWheel
          options={GLASS_CAPACITY_OPTIONS}
          value={selectedAmount}
          onValueChange={setSelectedAmount}
        />
      </Modal>
    </View>
  );
}
