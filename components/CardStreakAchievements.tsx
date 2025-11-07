import { View, Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { useStatisticsStore } from "@/stores/statistics";
import { useGamificationStore } from "@/stores/gamification";
import { useEffect } from "react";
import { useRouter } from "expo-router";

export default function CardStreakAchievements() {
  const { t } = useTranslation();
  const router = useRouter();
  const currentStreak = useStatisticsStore((state) => state.getCurrentStreak());
  const { achievements, fetchOrInitData, checkAndUnlockAchievements } =
    useGamificationStore();

  useEffect(() => {
    fetchOrInitData();
    checkAndUnlockAchievements();
  }, [fetchOrInitData, checkAndUnlockAchievements]);

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const totalCount = achievements.length;

  const handleNavigateToAchievements = () => {
    router.push("/(tabs)/achievements");
  };

  return (
    <TouchableOpacity onPress={handleNavigateToAchievements}>
      <Card className="p-0" backgroundColor="bg-white">
        <View className="relative z-10">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="flex-row items-center gap-2">
                <Text className="text-2xl">🔥</Text>
                <Text className="text-lg font-semibold text-gray-900">
                  {currentStreak} {currentStreak === 1 ? t("days").slice(0, -1) : t("days")}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-2xl">🏆</Text>
                <Text className="text-lg font-semibold text-gray-900">
                  {unlockedCount} / {totalCount}
                </Text>
              </View>
            </View>
            {unlockedCount > 0 && (
              <View className="flex-row flex-wrap gap-1">
                {achievements
                  .filter((a) => a.isUnlocked)
                  .slice(0, 8)
                  .map((achievement) => (
                    <Text key={achievement.id} className="text-xl">
                      {achievement.icon}
                    </Text>
                  ))}
              </View>
            )}
          </View>
          <Text className="text-gray-700 mt-2">
            {t("gamification:achievements")}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}
