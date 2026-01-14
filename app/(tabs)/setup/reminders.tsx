import { useEffect, useState } from "react";
import { ScrollView, View, Text, Alert, Linking, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { useNotificationsStore } from "@/stores/notifications";
import { useSetupStore } from "@/stores/setup";
import { ModalPicker } from "@/components/ui/ModalPicker";
import ErrorBoundary from "@/components/ErrorBoundary";
import {
  REMINDER_INTERVALS,
  ReminderInterval,
} from "@/constants/notifications";

export default function RemindersSettings() {
  const { t } = useTranslation("setup");
  const { t: tNotifications } = useTranslation("notifications");

  const notificationsStore = useNotificationsStore();
  const { fetchOrInitData } = notificationsStore;
  const setupStore = useSetupStore();

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      await fetchOrInitData();
      setIsInitialized(true);
    };
    initialize();
  }, [fetchOrInitData]);

  const handleEnableToggle = async (value: string) => {
    const shouldEnable = value === "on";

    if (shouldEnable) {
      // Request permissions if not granted
      const status = await notificationsStore.requestPermissions();

      if (status !== "granted") {
        // Show alert to open settings
        Alert.alert(t("permissionRequired"), t("permissionDeniedMessage"), [
          { text: t("cancel"), style: "cancel" },
          {
            text: t("openSettings"),
            onPress: () => {
              if (Platform.OS === "ios") {
                Linking.openURL("app-settings:");
              } else {
                Linking.openSettings();
              }
            },
          },
        ]);
        return;
      }

      await notificationsStore.setEnabled(true);

      // Schedule notifications
      await notificationsStore.scheduleReminders(
        setupStore.day.startHour,
        setupStore.day.endHour,
        tNotifications("reminderTitle"),
        tNotifications("reminderBody"),
      );
    } else {
      await notificationsStore.setEnabled(false);
    }
  };

  const handleIntervalChange = async (value: string) => {
    const interval = parseInt(value, 10) as ReminderInterval;
    await notificationsStore.setInterval(interval);

    // Reschedule if enabled
    if (
      notificationsStore.enabled &&
      notificationsStore.permissionStatus === "granted"
    ) {
      await notificationsStore.scheduleReminders(
        setupStore.day.startHour,
        setupStore.day.endHour,
        tNotifications("reminderTitle"),
        tNotifications("reminderBody"),
      );
    }
  };

  const intervalOptions = REMINDER_INTERVALS.map((interval) => {
    const hours = interval / 60;
    const labelKey = hours === 1 ? "every1Hour" : `every${hours}Hours`;
    return {
      label: t(labelKey),
      value: String(interval),
    };
  });

  const enableOptions = [
    { label: t("on"), value: "on" },
    { label: t("off"), value: "off" },
  ];

  if (!isInitialized) {
    return null;
  }

  return (
    <ErrorBoundary componentName="Reminders Settings">
      <ScrollView contentContainerClassName="gap-5 flex-1 p-5">
        {/* Enable/Disable Reminders */}
        <View>
          <ModalPicker
            label={t("enableReminders")}
            options={enableOptions}
            onSelect={handleEnableToggle}
            value={notificationsStore.enabled ? "on" : "off"}
          />
        </View>

        {/* Interval Selection */}
        {notificationsStore.enabled && (
          <View>
            <ModalPicker
              label={t("reminderInterval")}
              options={intervalOptions}
              onSelect={handleIntervalChange}
              value={String(notificationsStore.intervalMinutes)}
            />
          </View>
        )}

        {/* Activity Hours Info */}
        <View className="bg-gray-100 rounded-lg p-4 gap-2">
          <Text className="text-gray-600 font-medium">
            {t("activityHours")}
          </Text>
          <Text className="text-gray-800">
            {setupStore.day.startHour} - {setupStore.day.endHour}
          </Text>
          <Text className="text-gray-500 text-sm">
            {t("activityHoursDescription")}
          </Text>
        </View>

        {/* Permission Status Warning */}
        {notificationsStore.permissionStatus === "denied" && (
          <View className="bg-yellow-100 rounded-lg p-4">
            <Text className="text-yellow-800">{t("permissionDenied")}</Text>
          </View>
        )}
      </ScrollView>
    </ErrorBoundary>
  );
}
