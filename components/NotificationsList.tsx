import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { useGamificationStore } from "@/stores/gamification";
import { Card } from "@/components/ui/Card";
import { useEffect } from "react";
import { Button } from "./ui/Button";

export default function NotificationsList() {
  const { t } = useTranslation();
  const {
    notifications,
    fetchOrInitData,
    markNotificationAsRead,
    clearNotifications,
  } = useGamificationStore();

  useEffect(() => {
    fetchOrInitData();
  }, [fetchOrInitData]);

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    notifications.forEach((notif) => {
      if (!notif.read) {
        markNotificationAsRead(notif.id);
      }
    });
  };

  const handleClearAll = () => {
    clearNotifications();
  };

  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <View className="flex-1 p-5">
      <View className="flex-row gap-2 mb-4">
        {unreadNotifications.length > 0 && (
          <View className="flex-1">
            <Button
              title={t("gamification:markAllAsRead")}
              onPress={handleMarkAllAsRead}
            />
          </View>
        )}
        {notifications.length > 0 && (
          <View className="flex-1">
            <Button
              title={t("gamification:clearAll")}
              onPress={handleClearAll}
            />
          </View>
        )}
      </View>

      <ScrollView className="flex-1">
        <View className="gap-3">
          {notifications.length === 0 && (
            <Card>
              <Text className="text-center text-gray-500">
                {t("gamification:noNotifications")}
              </Text>
            </Card>
          )}

          {notifications
            .slice()
            .reverse()
            .map((notification) => (
              <TouchableOpacity
                key={notification.id}
                onPress={() => handleMarkAsRead(notification.id)}
              >
                <Card
                  className={notification.read ? "opacity-60" : ""}
                  backgroundColor={
                    notification.type === "achievement"
                      ? "bg-yellow-50"
                      : notification.type === "milestone"
                        ? "bg-blue-50"
                        : "bg-white"
                  }
                >
                  <View className="gap-2">
                    <View className="flex-row items-center justify-between">
                      <Text
                        className={`text-lg font-semibold ${
                          notification.read ? "text-gray-500" : "text-gray-800"
                        }`}
                      >
                        {notification.title}
                      </Text>
                      {!notification.read && (
                        <View className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </View>
                    <Text
                      className={`text-sm ${
                        notification.read ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {notification.message}
                    </Text>
                    <Text className="text-xs text-gray-400">
                      {new Date(notification.timestamp).toLocaleString()}
                    </Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
        </View>
      </ScrollView>
    </View>
  );
}
