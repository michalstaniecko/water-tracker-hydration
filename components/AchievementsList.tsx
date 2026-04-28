import { View, Text, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { useGamificationStore } from "@/stores/gamification";
import { Card } from "@/components/ui/Card";
import { useCallback, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";

export default function AchievementsList() {
  const { t } = useTranslation();
  const {
    achievements,
    fetchOrInitData,
    checkAndUnlockAchievements,
    markAchievementsSeen,
  } = useGamificationStore();

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        await fetchOrInitData();
        markAchievementsSeen();
      };
      init();
    }, [fetchOrInitData, markAchievementsSeen])
  );

  useEffect(() => {
    checkAndUnlockAchievements();
  }, [checkAndUnlockAchievements]);

  const unlockedAchievements = achievements.filter((a) => a.isUnlocked);
  const lockedAchievements = achievements.filter((a) => !a.isUnlocked);
  const total = achievements.length;
  const unlocked = unlockedAchievements.length;

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-5 gap-3">
        {/* Progress summary */}
        {total > 0 && (
          <View className="bg-yellow-50 rounded-lg p-4">
            <Text className="text-lg font-semibold mb-1">
              {t("gamification:progressSummary")}
            </Text>
            <Text className="text-3xl font-bold text-yellow-600">
              {unlocked}/{total}
            </Text>
            <Text className="text-sm text-gray-600 mt-1">
              {t("gamification:achievementsUnlocked")}
            </Text>
            <View className="mt-3 h-2 bg-yellow-200 rounded-full overflow-hidden">
              <View
                className="h-2 bg-yellow-500 rounded-full"
                style={{ width: `${total > 0 ? (unlocked / total) * 100 : 0}%` }}
              />
            </View>
          </View>
        )}

        {/* Unlocked Achievements */}
        {unlockedAchievements.length > 0 && (
          <View className="gap-2">
            <Text className="text-xl font-bold text-gray-800">
              {t("gamification:unlockedAchievements")} ({unlocked})
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
          <View className="gap-2">
            <Text className="text-xl font-bold text-gray-800">
              {t("gamification:lockedAchievements")} ({lockedAchievements.length})
            </Text>
            {lockedAchievements.map((achievement) => (
              <Card
                key={achievement.id}
                className="opacity-50"
                backgroundColor="bg-gray-100"
              >
                <View className="flex-row items-center gap-3">
                  <Text className="text-4xl">{achievement.icon}</Text>
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
