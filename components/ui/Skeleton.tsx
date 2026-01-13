import React, { createContext, useContext, useEffect, useRef } from "react";
import { Animated } from "react-native";

// Constants
export const SKELETON_ANIMATION = {
  DURATION: 800,
  MIN_OPACITY: 0.3,
  MAX_OPACITY: 1,
} as const;

export const SKELETON_COLORS = {
  DEFAULT: "bg-gray-300",
  DARK: "dark:bg-gray-600",
} as const;

// Context for shared animation
type SkeletonContextType = {
  pulseAnim: Animated.Value;
};

const SkeletonContext = createContext<SkeletonContextType | null>(null);

type SkeletonProviderProps = {
  children: React.ReactNode;
};

/**
 * Provider that creates a single shared animation for all Skeleton components.
 * This optimizes performance by using one animation loop instead of many.
 */
export function SkeletonProvider({ children }: SkeletonProviderProps) {
  const pulseAnim = useRef(
    new Animated.Value(SKELETON_ANIMATION.MIN_OPACITY),
  ).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: SKELETON_ANIMATION.MAX_OPACITY,
          duration: SKELETON_ANIMATION.DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: SKELETON_ANIMATION.MIN_OPACITY,
          duration: SKELETON_ANIMATION.DURATION,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <SkeletonContext.Provider value={{ pulseAnim }}>
      {children}
    </SkeletonContext.Provider>
  );
}

type SkeletonProps = {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  className?: string;
  testID?: string;
};

/**
 * Skeleton loading placeholder component with pulsing animation.
 * Uses shared animation from SkeletonProvider when available,
 * or creates its own animation loop as fallback.
 */
export function Skeleton({
  width = "100%",
  height = 20,
  borderRadius = 8,
  className,
  testID,
}: SkeletonProps) {
  const context = useContext(SkeletonContext);

  // Fallback animation for when used outside of SkeletonProvider
  const fallbackAnim = useRef(
    new Animated.Value(SKELETON_ANIMATION.MIN_OPACITY),
  ).current;

  useEffect(() => {
    // Only create fallback animation if not using provider
    if (context) return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(fallbackAnim, {
          toValue: SKELETON_ANIMATION.MAX_OPACITY,
          duration: SKELETON_ANIMATION.DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(fallbackAnim, {
          toValue: SKELETON_ANIMATION.MIN_OPACITY,
          duration: SKELETON_ANIMATION.DURATION,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();

    return () => pulse.stop();
  }, [context, fallbackAnim]);

  const pulseAnim = context?.pulseAnim ?? fallbackAnim;

  return (
    <Animated.View
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading content"
      accessibilityLiveRegion="polite"
      testID={testID}
      className={`${SKELETON_COLORS.DEFAULT} ${SKELETON_COLORS.DARK} ${className || ""}`}
      style={{
        width,
        height,
        borderRadius,
        opacity: pulseAnim,
      }}
    />
  );
}

// For backwards compatibility - wrap content that uses Skeleton
export function withSkeletonProvider<P extends object>(
  Component: React.ComponentType<P>,
) {
  return function WrappedComponent(props: P) {
    return (
      <SkeletonProvider>
        <Component {...props} />
      </SkeletonProvider>
    );
  };
}
