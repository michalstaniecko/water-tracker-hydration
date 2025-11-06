import { View } from "react-native";
import AchievementsList from "@/components/AchievementsList";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function AchievementsScreen() {
  return (
    <ErrorBoundary componentName="Achievements Screen">
      <View className="flex-1">
        <AchievementsList />
      </View>
    </ErrorBoundary>
  );
}
