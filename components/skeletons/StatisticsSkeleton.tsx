import React from "react";
import { View } from "react-native";
import { Skeleton, SkeletonProvider } from "@/components/ui/Skeleton";

/**
 * Skeleton loading state for the Statistics screen.
 * Uses SkeletonProvider for optimized shared animation across all skeleton elements.
 */
export function StatisticsSkeleton() {
  return (
    <SkeletonProvider>
      <View
        className="p-5 gap-3"
        accessible={true}
        accessibilityRole="progressbar"
        accessibilityLabel="Loading statistics"
        accessibilityLiveRegion="polite"
        testID="statistics-skeleton"
      >
        {/* Tab selector skeleton */}
        <View className="flex-row gap-2" testID="statistics-skeleton-tabs">
          <Skeleton height={48} className="flex-1" testID="skeleton-tab-1" />
          <Skeleton height={48} className="flex-1" testID="skeleton-tab-2" />
          <Skeleton height={48} className="flex-1" testID="skeleton-tab-3" />
        </View>

        {/* Chart skeleton */}
        <View
          className="bg-white dark:bg-gray-800 rounded-lg p-4 gap-2"
          testID="statistics-skeleton-chart"
        >
          <Skeleton width={150} height={24} testID="skeleton-chart-title" />
          <Skeleton height={220} borderRadius={12} testID="skeleton-chart" />
        </View>

        {/* Trend analysis skeleton */}
        <View
          className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 gap-2"
          testID="statistics-skeleton-trend"
        >
          <Skeleton width={120} height={20} testID="skeleton-trend-title" />
          <View className="flex-row items-center gap-2">
            <Skeleton
              width={32}
              height={32}
              borderRadius={16}
              testID="skeleton-trend-icon"
            />
            <View className="flex-1 gap-1">
              <Skeleton width={100} height={18} testID="skeleton-trend-label" />
              <Skeleton
                width="80%"
                height={14}
                testID="skeleton-trend-description"
              />
            </View>
          </View>
        </View>

        {/* Progress summary title skeleton */}
        <Skeleton width={180} height={24} testID="skeleton-summary-title" />

        {/* Stats cards skeleton - Row 1 */}
        <View
          className="flex-row gap-3"
          testID="statistics-skeleton-stats-row-1"
        >
          <View className="flex-1">
            <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg gap-2">
              <Skeleton width={80} height={24} testID="skeleton-stat-1-value" />
              <Skeleton width={60} height={16} testID="skeleton-stat-1-label" />
            </View>
          </View>
          <View className="flex-1">
            <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg gap-2">
              <Skeleton width={80} height={24} testID="skeleton-stat-2-value" />
              <Skeleton width={60} height={16} testID="skeleton-stat-2-label" />
            </View>
          </View>
        </View>

        {/* Stats cards skeleton - Row 2 */}
        <View
          className="flex-row gap-3"
          testID="statistics-skeleton-stats-row-2"
        >
          <View className="flex-1">
            <View className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg gap-2">
              <Skeleton width={50} height={24} testID="skeleton-stat-3-value" />
              <Skeleton width={80} height={16} testID="skeleton-stat-3-label" />
            </View>
          </View>
          <View className="flex-1">
            <View className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg gap-2">
              <Skeleton width={60} height={24} testID="skeleton-stat-4-value" />
              <Skeleton width={90} height={16} testID="skeleton-stat-4-label" />
            </View>
          </View>
        </View>

        {/* Stats cards skeleton - Row 3 */}
        <View
          className="flex-row gap-3"
          testID="statistics-skeleton-stats-row-3"
        >
          <View className="flex-1">
            <View className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg gap-2">
              <Skeleton width={70} height={24} testID="skeleton-stat-5-value" />
              <Skeleton
                width={100}
                height={16}
                testID="skeleton-stat-5-label"
              />
            </View>
          </View>
          <View className="flex-1">
            <View className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg gap-2">
              <Skeleton width={80} height={24} testID="skeleton-stat-6-value" />
              <Skeleton width={60} height={16} testID="skeleton-stat-6-label" />
            </View>
          </View>
        </View>
      </View>
    </SkeletonProvider>
  );
}

export default StatisticsSkeleton;
