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
      <Card backgroundColor="bg-gradient-to-r from-yellow-100 to-orange-100">
        <View className="gap-2">
          <View className="flex-row items-center gap-2">
            <Text className="text-3xl">🔥</Text>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-800">
                {t("currentStreak")}
              </Text>
              <Text className="text-2xl font-bold text-orange-600">
                {currentStreak} {t("days")}
              </Text>
            </View>
          </View>

          <View className="mt-2 pt-2 border-t border-gray-300">
            <View className="flex-row items-center gap-2">
              <Text className="text-2xl">🏆</Text>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-700">
                  {t("gamification:achievements")}
                </Text>
                <Text className="text-lg font-bold text-gray-800">
                  {unlockedCount} / {totalCount}
                </Text>
              </View>
            </View>
          </View>

          {unlockedCount > 0 && (
            <View className="mt-2 flex-row flex-wrap gap-1">
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
      </Card>
    </TouchableOpacity>
  );
}
