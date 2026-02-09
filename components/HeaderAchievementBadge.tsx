import { TouchableOpacity, View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useGamificationStore } from "@/stores/gamification";
import { useWaterStore } from "@/stores/water";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function HeaderAchievementBadge() {
  const { t } = useTranslation();
  const router = useRouter();
  const todayWater = useWaterStore((state) => state.getTodayWater());
  const { achievements, fetchOrInitData, checkAndUnlockAchievements } =
    useGamificationStore();
  const unseenAchievementsCount = useGamificationStore(
    (state) => state.unseenAchievementsCount,
  );

  useEffect(() => {
    const init = async () => {
      await fetchOrInitData();
      checkAndUnlockAchievements();
    };
    init();
  }, [fetchOrInitData, checkAndUnlockAchievements]);

  // Re-check achievements when water intake changes
  useEffect(() => {
    if (todayWater) {
      checkAndUnlockAchievements();
    }
  }, [todayWater, checkAndUnlockAchievements]);

  const showUnseenBadge = unseenAchievementsCount > 0;

  const handlePress = () => {
    router.push("/(tabs)/achievements");
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className="mr-4 p-1"
      accessibilityRole="button"
      accessibilityLabel={t("achievementBadgeAccessibilityLabel", {
        achievements: achievements.filter((a) => a.isUnlocked).length,
        unseen: unseenAchievementsCount,
      })}
      accessibilityHint={t("achievementBadgeAccessibilityHint")}
    >
      <FontAwesome name="trophy" size={22} color="#3895d3" />
      {showUnseenBadge && (
        <View className="absolute top-[-2px] right-[-6px] bg-pink-600 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
          <Text className="text-white text-[11px] font-bold">
            {unseenAchievementsCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
