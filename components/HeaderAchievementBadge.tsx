import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useGamificationStore } from "@/stores/gamification";
import { useWaterStore } from "@/stores/water";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { colors } from "@/constants/colors";

export default function HeaderAchievementBadge() {
  const { t } = useTranslation();
  const router = useRouter();
  const waterHistory = useWaterStore((state) => state.history);
  const { achievements, fetchOrInitData, checkAndUnlockAchievements } =
    useGamificationStore();
  const unseenAchievementsCount = useGamificationStore(
    (state) => state.unseenAchievementsCount,
  );

  useEffect(() => {
    fetchOrInitData();
    checkAndUnlockAchievements();
  }, [fetchOrInitData, checkAndUnlockAchievements]);

  // Re-check achievements when water history changes
  useEffect(() => {
    if (waterHistory) {
      checkAndUnlockAchievements();
    }
  }, [waterHistory, checkAndUnlockAchievements]);

  const showUnseenBadge = unseenAchievementsCount > 0;

  const handlePress = () => {
    router.push("/(tabs)/achievements");
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel={t("achievementBadgeAccessibilityLabel", {
        achievements: achievements.filter((a) => a.isUnlocked).length,
        unseen: unseenAchievementsCount,
      })}
      accessibilityHint={t("achievementBadgeAccessibilityHint")}
    >
      <FontAwesome name="trophy" size={22} color={colors.blue[600]} />
      {showUnseenBadge && (
        <View style={[styles.badge, styles.unseenBadge]}>
          <Text style={styles.badgeText}>{unseenAchievementsCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 16,
    padding: 4,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -6,
    backgroundColor: colors.orange[500],
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  unseenBadge: {
    backgroundColor: colors.pink[600],
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "bold",
  },
});
