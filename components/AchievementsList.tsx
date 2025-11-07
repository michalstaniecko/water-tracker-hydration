import { View, Text, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { useGamificationStore } from "@/stores/gamification";
import { Card } from "@/components/ui/Card";
import { useEffect } from "react";

export default function AchievementsList() {
  const { t } = useTranslation();
  const { achievements, fetchOrInitData, checkAndUnlockAchievements } =
    useGamificationStore();

  useEffect(() => {
    fetchOrInitData();
  }, [fetchOrInitData]);

  useEffect(() => {
    checkAndUnlockAchievements();
  }, [checkAndUnlockAchievements]);

  const unlockedAchievements = achievements.filter((a) => a.isUnlocked);
  const lockedAchievements = achievements.filter((a) => !a.isUnlocked);

  return (
    <ScrollView className="flex-1 p-5">
      <View className="gap-3">
        {/* Unlocked Achievements */}
        {unlockedAchievements.length > 0 && (
          <View className="gap-2">
            <Text className="text-xl font-bold text-gray-800">
              {t("gamification:unlockedAchievements")} (
              {unlockedAchievements.length})
            </Text>
            {unlockedAchievements.map((achievement) => (
              <Card
                key={achievement.id}
                className="border-2 border-green-500"
                backgroundColor="bg-green-50"
              >
                <View className="flex-row items-center gap-3">
                  <Text className="text-4xl">{achievement.icon}</Text>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-800">
                      {achievement.title}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {achievement.description}
                    </Text>
                    {achievement.unlockedAt && (
                      <Text className="mt-1 text-xs text-green-600">
                        {t("gamification:unlockedOn")}{" "}
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Locked Achievements */}
        {lockedAchievements.length > 0 && (
          <View className="gap-2 mt-4">
            <Text className="text-xl font-bold text-gray-800">
              {t("gamification:lockedAchievements")} (
              {lockedAchievements.length})
            </Text>
            {lockedAchievements.map((achievement) => (
              <Card
                key={achievement.id}
                className="opacity-60"
                backgroundColor="bg-gray-100"
              >
                <View className="flex-row items-center gap-3">
                  <Text className="text-4xl grayscale">{achievement.icon}</Text>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-600">
                      {achievement.title}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {achievement.description}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {achievements.length === 0 && (
          <Card>
            <Text className="text-center text-gray-500">
              {t("gamification:noAchievements")}
            </Text>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}
