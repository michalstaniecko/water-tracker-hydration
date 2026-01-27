import { View, Text, Pressable } from "react-native";
import { useSetupStore } from "@/stores/setup";
import { useWaterStore } from "@/stores/water";
import { useGamificationStore } from "@/stores/gamification";
import { useNotificationsStore } from "@/stores/notifications";
import { useTranslation } from "react-i18next";
import { useHaptics } from "@/hooks/useHaptics";
import { logError } from "@/utils/errorLogging";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useMemo } from "react";

export default function QuickActions() {
  const { t } = useTranslation();
  const { quickActions } = useSetupStore();
  const waterStore = useWaterStore();
  const gamificationStore = useGamificationStore();
  const { impactMedium } = useHaptics();

  const enabledActions = useMemo(
    () => quickActions.filter((action) => action.enabled),
    [quickActions],
  );

  const handleQuickAction = async (amount: number) => {
    try {
      impactMedium();
      const currentWater = waterStore.getTodayWater();
      const newCurrentWater = Number(currentWater) + amount;
      await waterStore.setTodayWater(newCurrentWater.toString());
      gamificationStore.checkAndUnlockAchievements();

      // Reschedule notifications anchored to this drink
      const notificationsState = useNotificationsStore.getState();
      if (
        notificationsState.enabled &&
        notificationsState.permissionStatus === "granted"
      ) {
        const setupState = useSetupStore.getState();
        await notificationsState.onWaterDrunk(
          setupState.day.startHour,
          setupState.day.endHour,
        );
      }
    } catch (error) {
      logError(error, {
        operation: "handleQuickAction",
        component: "QuickActions",
      });
    }
  };

  if (enabledActions.length === 0) {
    return null;
  }

  return (
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
  );
}
