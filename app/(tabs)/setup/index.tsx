import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function SettingsMenu() {
  const router = useRouter();
  const { t } = useTranslation("setup");

  const menuItems = [
    {
      id: "general",
      title: t("general"),
      icon: "sliders",
      onPress: () => router.push("/(tabs)/setup/general"),
    },
    {
      id: "backup",
      title: t("backup"),
      icon: "download",
      onPress: () => router.push("/(tabs)/setup/backup"),
    },
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
            >
              <View className="flex-row items-center gap-3">
                <FontAwesome
                  name={item.icon as any}
                  size={24}
                  color="#3b82f6"
                />
                <Text className="text-lg font-semibold text-gray-900 ">
                  {item.title}
                </Text>
              </View>
              <FontAwesome name="chevron-right" size={16} color="#9ca3af" />
            </Pressable>
          ))}
        </View>
      </View>
    </ErrorBoundary>
  );
}
