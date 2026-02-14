import React, { useEffect, useRef, useState } from "react";
import { View, Text, ActivityIndicator, Modal, Animated } from "react-native";

// Constants
export const LOADING_OVERLAY_ANIMATION = {
  DURATION: 200,
} as const;

export const LOADING_OVERLAY_COLORS = {
  INDICATOR: "#2680eb", // blue-500
} as const;

type LoadingOverlayProps = {
  visible: boolean;
  message?: string;
  testID?: string;
};

/**
 * Full-screen loading overlay with fade animation.
 * Properly handles animation lifecycle to ensure fade-out completes before unmounting.
 */
export default function LoadingOverlay({
  visible,
  message,
  testID,
}: LoadingOverlayProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  // Track whether the component should render (separate from visible prop)
  const [isRendered, setIsRendered] = useState(visible);

  useEffect(() => {
    if (visible) {
      // When becoming visible, ensure we render first, then animate in
      setIsRendered(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: LOADING_OVERLAY_ANIMATION.DURATION,
        useNativeDriver: true,
      }).start();
    } else {
      // When hiding, animate out first, then unmount
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: LOADING_OVERLAY_ANIMATION.DURATION,
        useNativeDriver: true,
      }).start(({ finished }) => {
        // Only unmount after animation completes
        if (finished) {
          setIsRendered(false);
        }
      });
    }
  }, [visible, fadeAnim]);

  // Don't render anything if not visible and animation has completed
  if (!isRendered) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={isRendered}
      animationType="none"
      testID={testID}
    >
      <Animated.View
        accessible={true}
        accessibilityRole="alert"
        accessibilityLabel={message || "Loading"}
        accessibilityLiveRegion="polite"
        style={{ opacity: fadeAnim }}
        className="flex-1 justify-center items-center bg-black/50"
        testID={testID ? `${testID}-container` : undefined}
      >
        <View className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg items-center gap-4 min-w-[200px]">
          <ActivityIndicator
            size="large"
            color={LOADING_OVERLAY_COLORS.INDICATOR}
            testID={testID ? `${testID}-indicator` : undefined}
          />
          {message && (
            <Text
              className="text-gray-700 dark:text-gray-200 text-base text-center font-medium"
              testID={testID ? `${testID}-message` : undefined}
            >
              {message}
            </Text>
          )}
        </View>
      </Animated.View>
    </Modal>
  );
}
