import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useConsentStore } from "@/stores/consent";

export default function SettingsMenu() {
  const router = useRouter();
  const { t } = useTranslation(["setup", "consent"]);
  const { privacyOptionsRequired, showPrivacyOptions } = useConsentStore();

  const menuItems = [
    {
      id: "general",
      title: t("general"),
      icon: "sliders",
      onPress: () => router.push("/(tabs)/setup/general"),
    },
    {
      id: "reminders",
      title: t("reminders"),
      icon: "bell",
      onPress: () => router.push("/(tabs)/setup/reminders"),
    },
    {
      id: "quick-actions",
      title: t("quickActions"),
      icon: "bolt",
      onPress: () => router.push("/(tabs)/setup/quick-actions"),
    },
    {
      id: "backup",
      title: t("backup"),
      icon: "download",
      onPress: () => router.push("/(tabs)/setup/backup"),
    },
    // Only show for EU users who have given consent
    ...(privacyOptionsRequired
      ? [
          {
            id: "privacy",
            title: t("consent:privacySettings"),
            icon: "shield",
            onPress: showPrivacyOptions,
          },
        ]
      : []),
  ];

  return (
    <ErrorBoundary componentName="Settings Menu">
      <View className="flex-1 bg-white  p-5">
        <View className="gap-3">
          {menuItems.map((item) => (
            <Pressable
              key={item.id}
              onPress={item.onPress}
              className="bg-gray-50  p-4 rounded-lg flex-row items-center justify-between active:opacity-70"
              accessibilityRole="button"
              accessibilityLabel={item.title}
            >
              <View className="flex-row items-center gap-3">
                <FontAwesome
                  name={item.icon as any}
                  size={24}
                  color="#2680eb"
                />
                <Text className="text-lg font-semibold text-gray-900 ">
                  {item.title}
                </Text>
              </View>
              <FontAwesome name="chevron-right" size={16} color="#a3adb9" />
            </Pressable>
          ))}
        </View>
      </View>
    </ErrorBoundary>
  );
}
