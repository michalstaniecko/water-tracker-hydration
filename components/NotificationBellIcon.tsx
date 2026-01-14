import { View, Pressable, Text } from "react-native";
import { useRouter } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useGamificationStore } from "@/stores/gamification";
import { colors } from "@/constants/colors";
import { useTranslation } from "react-i18next";

export default function NotificationBellIcon() {
  const router = useRouter();
  const { t } = useTranslation("gamification");
  const unreadCount = useGamificationStore(
    (state) => state.notifications.filter((n) => !n.read).length,
  );

  const handlePress = () => {
    router.push("/(tabs)/notifications");
  };

  return (
    <Pressable
      onPress={handlePress}
      className="relative p-2 mr-2"
      accessibilityLabel={
        unreadCount > 0
          ? t("notifications") + `, ${unreadCount} ` + t("unread")
          : t("notifications")
      }
      accessibilityRole="button"
    >
      <FontAwesome name="bell" size={24} color={colors.blue[600]} />
      {unreadCount > 0 && (
        <View className="absolute -top-0.5 -right-0.5 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
          <Text className="text-white text-xs font-bold">
            {unreadCount > 99 ? "99+" : unreadCount}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
