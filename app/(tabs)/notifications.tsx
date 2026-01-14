import { View, Text, TouchableOpacity, SectionList } from "react-native";
import { useTranslation } from "react-i18next";
import { useGamificationStore, Notification } from "@/stores/gamification";
import { useSetupStore } from "@/stores/setup";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ErrorBoundary from "@/components/ErrorBoundary";
import { groupNotificationsByDay } from "@/utils/notifications";
import { useMemo } from "react";

export default function NotificationsScreen() {
  const { t } = useTranslation("gamification");
  const { dateFormat } = useSetupStore();
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
  } = useGamificationStore();

  const groupedNotifications = useMemo(() => {
    return groupNotificationsByDay(notifications, dateFormat);
  }, [notifications, dateFormat]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const sections = groupedNotifications.map((group) => ({
    title:
      group.dateLabel === "today"
        ? t("today")
        : group.dateLabel === "yesterday"
          ? t("yesterday")
          : group.dateLabel,
    data: group.notifications,
  }));

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      onPress={() => markNotificationAsRead(item.id)}
      activeOpacity={0.7}
    >
      <Card
        className={item.read ? "opacity-60" : ""}
        backgroundColor={
          item.type === "achievement"
            ? "bg-yellow-50"
            : item.type === "milestone"
              ? "bg-blue-50"
              : "bg-white"
        }
      >
        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text
              className={`text-lg font-semibold ${
                item.read ? "text-gray-500" : "text-gray-800"
              }`}
            >
              {t(item.titleKey)}
            </Text>
            {!item.read && (
              <View className="w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </View>
          <Text
            className={`text-sm ${
              item.read ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {t(item.messageKey, item.messageParams)}
          </Text>
          <Text className="text-xs text-gray-400">
            {new Date(item.timestamp).toLocaleTimeString()}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View className="bg-gray-100 py-2 px-4 -mx-4">
      <Text className="text-sm font-semibold text-gray-600 uppercase">
        {section.title}
      </Text>
    </View>
  );

  return (
    <ErrorBoundary componentName="Notifications Screen">
      <View className="flex-1 bg-white">
        <View className="flex-row gap-2 p-4">
          {unreadCount > 0 && (
            <View className="flex-1">
              <Button
                text={t("markAllAsRead")}
                onPress={markAllNotificationsAsRead}
              />
            </View>
          )}
          {notifications.length > 0 && (
            <View className="flex-1">
              <Button text={t("clearAll")} onPress={clearNotifications} />
            </View>
          )}
        </View>

        {notifications.length === 0 ? (
          <View className="flex-1 items-center justify-center p-5">
            <Card>
              <Text className="text-center text-gray-500">
                {t("noNotifications")}
              </Text>
            </Card>
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderItem={renderNotification}
            renderSectionHeader={renderSectionHeader}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
            ItemSeparatorComponent={() => <View className="h-3" />}
            stickySectionHeadersEnabled={true}
          />
        )}
      </View>
    </ErrorBoundary>
  );
}
