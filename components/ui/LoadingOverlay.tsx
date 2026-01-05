import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Modal,
  Animated,
  StyleSheet,
} from "react-native";

type LoadingOverlayProps = {
  visible: boolean;
  message?: string;
};

export default function LoadingOverlay({
  visible,
  message,
}: LoadingOverlayProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  if (!visible) {
    return null;
  }

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View
        style={[styles.overlay, { opacity: fadeAnim }]}
        className="flex-1 justify-center items-center bg-black/50"
      >
        <View className="bg-white p-6 rounded-xl shadow-lg items-center gap-4 min-w-[200px]">
          <ActivityIndicator size="large" color="#3b82f6" />
          {message && (
            <Text className="text-gray-700 text-base text-center font-medium">
              {message}
            </Text>
          )}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

type SkeletonProps = {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  className?: string;
};

export function Skeleton({
  width = "100%",
  height = 20,
  borderRadius = 8,
  className,
}: SkeletonProps) {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <Animated.View
      className={`bg-gray-300 ${className || ""}`}
      style={{
        width,
        height,
        borderRadius,
        opacity: pulseAnim,
      }}
    />
  );
}

export function StatisticsSkeleton() {
  return (
    <View className="p-5 gap-3">
      {/* Tab selector skeleton */}
      <View className="flex-row gap-2">
        <Skeleton height={48} className="flex-1" />
        <Skeleton height={48} className="flex-1" />
        <Skeleton height={48} className="flex-1" />
      </View>

      {/* Chart skeleton */}
      <View className="bg-white rounded-lg p-4 gap-2">
        <Skeleton width={150} height={24} />
        <Skeleton height={220} borderRadius={12} />
      </View>

      {/* Trend analysis skeleton */}
      <View className="bg-purple-50 rounded-lg p-4 gap-2">
        <Skeleton width={120} height={20} />
        <View className="flex-row items-center gap-2">
          <Skeleton width={32} height={32} borderRadius={16} />
          <View className="flex-1 gap-1">
            <Skeleton width={100} height={18} />
            <Skeleton width="80%" height={14} />
          </View>
        </View>
      </View>

      {/* Progress summary title skeleton */}
      <Skeleton width={180} height={24} />

      {/* Stats cards skeleton */}
      <View className="flex-row gap-3">
        <View className="flex-1">
          <View className="bg-blue-50 p-4 rounded-lg gap-2">
            <Skeleton width={80} height={24} />
            <Skeleton width={60} height={16} />
          </View>
        </View>
        <View className="flex-1">
          <View className="bg-blue-50 p-4 rounded-lg gap-2">
            <Skeleton width={80} height={24} />
            <Skeleton width={60} height={16} />
          </View>
        </View>
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <View className="bg-green-50 p-4 rounded-lg gap-2">
            <Skeleton width={50} height={24} />
            <Skeleton width={80} height={16} />
          </View>
        </View>
        <View className="flex-1">
          <View className="bg-green-50 p-4 rounded-lg gap-2">
            <Skeleton width={60} height={24} />
            <Skeleton width={90} height={16} />
          </View>
        </View>
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <View className="bg-yellow-50 p-4 rounded-lg gap-2">
            <Skeleton width={70} height={24} />
            <Skeleton width={100} height={16} />
          </View>
        </View>
        <View className="flex-1">
          <View className="bg-yellow-50 p-4 rounded-lg gap-2">
            <Skeleton width={80} height={24} />
            <Skeleton width={60} height={16} />
          </View>
        </View>
      </View>
    </View>
  );
}
