import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import FontAwesome from "@expo/vector-icons/FontAwesome";

interface Props {
  countdown: number | null;
}

export function AdCountdownBanner({ countdown }: Props) {
  const { t } = useTranslation();
  const translateY = useRef(new Animated.Value(-80)).current;
  const visible = countdown !== null;

  useEffect(() => {
    if (visible) {
      translateY.setValue(-80);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }).start();
    }
  }, [visible, translateY]);

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View
        style={{ transform: [{ translateY }] }}
        className="mx-4 mt-14 bg-blue-700 rounded-2xl px-4 py-3 flex-row items-center gap-3 shadow-lg"
      >
        <FontAwesome name="info-circle" size={18} color="#fff" />
        <Text className="text-white text-sm font-medium flex-1">
          {t("adCountdown", { seconds: countdown })}
        </Text>
        <View className="bg-blue-500 rounded-full w-8 h-8 items-center justify-center">
          <Text className="text-white font-bold text-base">{countdown}</Text>
        </View>
      </Animated.View>
    </View>
  );
}
