import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated, { CurvedTransition } from "react-native-reanimated";
import CardDayProgress from "@/components/CardDayProgress";
import CardWelcome from "@/components/onboarding/CardWelcome";
import CardSecond from "@/components/onboarding/CardSecond";
import CardThird from "@/components/onboarding/CardThird";
import ErrorBoundary from "@/components/ErrorBoundary";
import WaterInputSection from "@/components/WaterInputSection";
import WaterCircularProgress from "@/components/WaterCircularProgress";

export default function Index() {
  return (
    <ErrorBoundary componentName="Home Screen">
      <ScrollView contentContainerClassName={"p-5"}>
        <View className={"gap-3"}>
          <CardWelcome />
          <CardSecond />
          <Animated.View layout={CurvedTransition}>
            <CardDayProgress />
          </Animated.View>
          <CardThird />
          <Animated.View layout={CurvedTransition}>
            <WaterCircularProgress />
          </Animated.View>
          <Animated.View layout={CurvedTransition}>
            <WaterInputSection />
          </Animated.View>
        </View>
      </ScrollView>
    </ErrorBoundary>
  );
}
