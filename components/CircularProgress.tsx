import React from "react";
import { Platform, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  withTiming,
  useDerivedValue,
} from "react-native-reanimated";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  size: number;
  strokeWidth: number;
  progress: number;
  trackColor: string;
  progressColor: string;
  children?: React.ReactNode;
};

export default function CircularProgress({
  size,
  strokeWidth,
  progress,
  trackColor,
  progressColor,
  children,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const animatedProgress = useDerivedValue(() => {
    return withTiming(progress, { duration: 600 });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => {
    const offset =
      circumference - (animatedProgress.value / 100) * circumference;
    return {
      strokeDashoffset: offset,
    };
  });

  return (
    <View style={{ width: size, height: size, alignSelf: "center", marginVertical: 12 }}>
      {/* Shadow layer 1 - tight, dense shadow */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "#fff",
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.35,
              shadowRadius: 6,
            },
            android: {
              elevation: 4,
            },
          }),
        }}
      />
      {/* Shadow layer 2 - stacked for denser Android shadow */}
      {Platform.OS === "android" && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: "#fff",
            elevation: 4,
          }}
        />
      )}
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          rotation={-90}
          origin={`${center}, ${center}`}
        />
      </Svg>
      {children && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {children}
        </View>
      )}
    </View>
  );
}
