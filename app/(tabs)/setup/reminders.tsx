import { useEffect, useState, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  Alert,
  Linking,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useNotificationsStore } from "@/stores/notifications";
import { useSetupStore } from "@/stores/setup";
import { ModalPicker } from "@/components/ui/ModalPicker";
import ErrorBoundary from "@/components/ErrorBoundary";
import {
  REMINDER_INTERVALS,
  ReminderInterval,
  MAX_NOTIFICATION_OPTIONS,
  MaxNotificationOption,
} from "@/constants/notifications";
import { getNotificationContent } from "@/services/notificationService";

/**
 * Validates if a number is a valid ReminderInterval
 */
function isValidReminderInterval(value: number): value is ReminderInterval {
  return REMINDER_INTERVALS.includes(value as ReminderInterval);
}

function isValidMaxNotification(value: number): value is MaxNotificationOption {
  return MAX_NOTIFICATION_OPTIONS.includes(value as MaxNotificationOption);
}

export default function RemindersSettings() {
  const { t } = useTranslation("setup");

  // Destructure specific state and actions to avoid useCallback recreation on every state change
  const {
    enabled,
    intervalMinutes,
    permissionStatus,
    maxNotifications,
    fetchOrInitData,
    requestPermissions,
    setEnabled,
    setInterval,
    scheduleReminders,
    setMaxNotifications,
  } = useNotificationsStore();
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
          const status = await requestPermissions();

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

          await setEnabled(true);

          // Schedule notifications
          const { title, body } = getNotificationContent();
          await scheduleReminders(
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
          await setEnabled(false);
        } finally {
          setIsLoading(false);
        }
      }
    },
    [
      isLoading,
      requestPermissions,
      setEnabled,
      scheduleReminders,
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
        await setInterval(parsedValue);

        // Reschedule reminders - scheduleReminders internally checks if enabled and permissions granted
        const { title, body } = getNotificationContent();
        await scheduleReminders(
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
      setInterval,
      scheduleReminders,
      setupStore.day.startHour,
      setupStore.day.endHour,
    ],
  );

  const handleMaxNotificationsChange = useCallback(
    async (value: string) => {
      if (isLoading) return;

      const parsedValue = parseInt(value, 10);

      if (!isValidMaxNotification(parsedValue)) {
        return;
      }

      setIsLoading(true);
      try {
        await setMaxNotifications(parsedValue);

        // Reschedule reminders with new limit
        const { title, body } = getNotificationContent();
        await scheduleReminders(
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
      setMaxNotifications,
      scheduleReminders,
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

  const maxNotificationOptions = MAX_NOTIFICATION_OPTIONS.map((option) => ({
    label: option === 0 ? t("unlimited") : String(option),
    value: String(option),
  }));

  const enableOptions = [
    { label: t("on"), value: "on" },
    { label: t("off"), value: "off" },
  ];

  if (!isInitialized) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
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
          accessibilityLabel={`${t("enableReminders")}: ${enabled ? t("on") : t("off")}`}
          accessibilityHint={t("enableRemindersHint")}
          accessibilityState={{ disabled: isLoading }}
        >
          <ModalPicker
            label={t("enableReminders")}
            options={enableOptions}
            onSelect={handleEnableToggle}
            value={enabled ? "on" : "off"}
          />
        </View>

        {/* Interval Selection */}
        {enabled && (
          <View
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`${t("reminderInterval")}: ${intervalOptions.find((opt) => opt.value === String(intervalMinutes))?.label}`}
            accessibilityHint={t("reminderIntervalHint")}
            accessibilityState={{ disabled: isLoading }}
          >
            <ModalPicker
              label={t("reminderInterval")}
              options={intervalOptions}
              onSelect={handleIntervalChange}
              value={String(intervalMinutes)}
            />
          </View>
        )}

        {/* Max Notifications Selection */}
        {enabled && (
          <View
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`${t("maxNotifications")}: ${maxNotifications === 0 ? t("unlimited") : maxNotifications}`}
            accessibilityHint={t("maxNotificationsHint")}
            accessibilityState={{ disabled: isLoading }}
          >
            <ModalPicker
              label={t("maxNotifications")}
              options={maxNotificationOptions}
              onSelect={handleMaxNotificationsChange}
              value={String(maxNotifications)}
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
        {permissionStatus === "denied" && (
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
