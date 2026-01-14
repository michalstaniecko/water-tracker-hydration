import { useEffect, useState, useCallback } from "react";
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
import { getNotificationContent } from "@/services/notificationService";

/**
 * Validates if a number is a valid ReminderInterval
 */
function isValidReminderInterval(value: number): value is ReminderInterval {
  return REMINDER_INTERVALS.includes(value as ReminderInterval);
}

export default function RemindersSettings() {
  const { t } = useTranslation("setup");

  const notificationsStore = useNotificationsStore();
  const { fetchOrInitData } = notificationsStore;
  const setupStore = useSetupStore();

  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      await fetchOrInitData();
      setIsInitialized(true);
    };
    initialize();
  }, [fetchOrInitData]);

  const handleEnableToggle = useCallback(
    async (value: string) => {
      if (isLoading) return;

      const shouldEnable = value === "on";

      if (shouldEnable) {
        setIsLoading(true);
        try {
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
          const { title, body } = getNotificationContent();
          await notificationsStore.scheduleReminders(
            setupStore.day.startHour,
            setupStore.day.endHour,
            title,
            body,
          );
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(true);
        try {
          await notificationsStore.setEnabled(false);
        } finally {
          setIsLoading(false);
        }
      }
    },
    [
      isLoading,
      notificationsStore,
      setupStore.day.startHour,
      setupStore.day.endHour,
      t,
    ],
  );

  const handleIntervalChange = useCallback(
    async (value: string) => {
      if (isLoading) return;

      const parsedValue = parseInt(value, 10);

      // Validate that parsed value is a valid ReminderInterval
      if (!isValidReminderInterval(parsedValue)) {
        return;
      }

      setIsLoading(true);
      try {
        await notificationsStore.setInterval(parsedValue);

        // Reschedule reminders - scheduleReminders internally checks if enabled and permissions granted
        const { title, body } = getNotificationContent();
        await notificationsStore.scheduleReminders(
          setupStore.day.startHour,
          setupStore.day.endHour,
          title,
          body,
        );
      } finally {
        setIsLoading(false);
      }
    },
    [
      isLoading,
      notificationsStore,
      setupStore.day.startHour,
      setupStore.day.endHour,
    ],
  );

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
      <ScrollView
        contentContainerClassName="gap-5 flex-1 p-5"
        accessible={true}
        accessibilityLabel={t("remindersSettingsScreen")}
      >
        {/* Enable/Disable Reminders */}
        <View
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`${t("enableReminders")}: ${notificationsStore.enabled ? t("on") : t("off")}`}
          accessibilityHint={t("enableRemindersHint")}
          accessibilityState={{ disabled: isLoading }}
        >
          <ModalPicker
            label={t("enableReminders")}
            options={enableOptions}
            onSelect={handleEnableToggle}
            value={notificationsStore.enabled ? "on" : "off"}
          />
        </View>

        {/* Interval Selection */}
        {notificationsStore.enabled && (
          <View
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`${t("reminderInterval")}: ${intervalOptions.find((opt) => opt.value === String(notificationsStore.intervalMinutes))?.label}`}
            accessibilityHint={t("reminderIntervalHint")}
            accessibilityState={{ disabled: isLoading }}
          >
            <ModalPicker
              label={t("reminderInterval")}
              options={intervalOptions}
              onSelect={handleIntervalChange}
              value={String(notificationsStore.intervalMinutes)}
            />
          </View>
        )}

        {/* Activity Hours Info */}
        <View
          className="bg-gray-100 rounded-lg p-4 gap-2"
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel={`${t("activityHours")}: ${setupStore.day.startHour} - ${setupStore.day.endHour}. ${t("activityHoursDescription")}`}
        >
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
          <View
            className="bg-yellow-100 rounded-lg p-4"
            accessible={true}
            accessibilityRole="alert"
            accessibilityLabel={t("permissionDenied")}
          >
            <Text className="text-yellow-800">{t("permissionDenied")}</Text>
          </View>
        )}
      </ScrollView>
    </ErrorBoundary>
  );
}
