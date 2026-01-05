import { create } from "zustand";
import dayjs from "@/plugins/dayjs";
import { useWaterStore } from "./water";
import { useSetupStore } from "./setup";
import { DEFAULT_DATE_FORMAT } from "@/config/date";
import { trackEngagement, trackGoalAchievement } from "@/utils/analytics";

export type PeriodType = "week" | "month";

export type DailyStats = {
  date: string;
  amount: number;
  percentage: number;
};

export type PeriodStats = {
  average: number;
  total: number;
  daysTracked: number;
  goalMet: number;
  goalMetPercentage: number;
  dailyData: DailyStats[];
};

export type TrendData = {
  direction: "up" | "down" | "stable";
  percentageChange: number;
  description: string;
};

/**
 * Statistics Store
 * 
 * Provides analytics and statistics for water intake tracking.
 * Supports weekly and monthly views with average calculations,
 * goal achievement tracking, streak monitoring, and trend analysis.
 * 
 * Integration points:
 * - Analytics service integration (Google Analytics, Firebase Analytics)
 * - Export functionality for data analysis (PDF, CSV, JSON)
 * - Advanced metrics and insights
 * - Performance monitoring
 */
type StatisticsStore = {
  getWeeklyStats: () => PeriodStats;
  getMonthlyStats: () => PeriodStats;
  getPeriodStats: (period: PeriodType) => PeriodStats;
  getBestDay: (period: PeriodType) => DailyStats | null;
  getCurrentStreak: () => number;
  getTrend: (period: PeriodType) => TrendData;
  getComparisonWithPreviousPeriod: (period: PeriodType) => { current: PeriodStats; previous: PeriodStats };
};

export const useStatisticsStore = create<StatisticsStore>((set, get) => ({
  getPeriodStats: (period: PeriodType) => {
    const history = useWaterStore.getState().history;
    const minimumWater = parseInt(useSetupStore.getState().minimumWater);
    
    if (!history) {
      return {
        average: 0,
        total: 0,
        daysTracked: 0,
        goalMet: 0,
        goalMetPercentage: 0,
        dailyData: [],
      };
    }

    const days = period === "week" ? 7 : 30;
    const startDate = dayjs().subtract(days - 1, "day");
    const dailyData: DailyStats[] = [];
    let total = 0;
    let daysTracked = 0;
    let goalMet = 0;

    for (let i = 0; i < days; i++) {
      const date = startDate.add(i, "day").format(DEFAULT_DATE_FORMAT);
      const waterStr = history[date]?.water || "0";
      const amount = parseInt(waterStr) || 0;
      const percentage = minimumWater > 0 ? Math.round((amount / minimumWater) * 100) : 0;

      if (amount > 0) {
        daysTracked++;
        total += amount;
        if (amount >= minimumWater) {
          goalMet++;
        }
      }

      dailyData.push({
        date,
        amount,
        percentage,
      });
    }

    const average = daysTracked > 0 ? Math.round(total / daysTracked) : 0;
    const goalMetPercentage = daysTracked > 0 ? Math.round((goalMet / daysTracked) * 100) : 0;

    return {
      average,
      total,
      daysTracked,
      goalMet,
      goalMetPercentage,
      dailyData,
    };
  },

  getWeeklyStats: () => {
    return get().getPeriodStats("week");
  },

  getMonthlyStats: () => {
    return get().getPeriodStats("month");
  },

  getBestDay: (period: PeriodType) => {
    const stats = get().getPeriodStats(period);
    if (stats.dailyData.length === 0) return null;

    const best = stats.dailyData.reduce((max, current) => 
      current.amount > max.amount ? current : max
    );

    return best.amount > 0 ? best : null;
  },

  getCurrentStreak: () => {
    const history = useWaterStore.getState().history;
    const minimumWater = parseInt(useSetupStore.getState().minimumWater);
    
    if (!history) return 0;

    let streak = 0;
    let currentDate = dayjs();
    let checkingToday = true;

    while (true) {
      const dateStr = currentDate.format(DEFAULT_DATE_FORMAT);
      const waterStr = history[dateStr]?.water || "0";
      const amount = parseInt(waterStr) || 0;

      if (amount >= minimumWater) {
        streak++;
        currentDate = currentDate.subtract(1, "day");
        checkingToday = false;
      } else {
        // If today's goal isn't met yet, skip to yesterday and continue counting
        if (checkingToday) {
          currentDate = currentDate.subtract(1, "day");
          checkingToday = false;
          continue;
        }
        // If any previous day didn't meet the goal, break the streak
        break;
      }

      // Prevent infinite loop
      if (streak > 365) break;
    }

    // Track significant streaks
    if (streak > 0 && streak % 7 === 0) {
      trackGoalAchievement('streak_milestone', streak);
    }

    return streak;
  },

  getTrend: (period: PeriodType) => {
    const currentStats = get().getPeriodStats(period);
    const comparison = get().getComparisonWithPreviousPeriod(period);
    
    if (comparison.previous.daysTracked === 0) {
      return {
        direction: 'stable' as const,
        percentageChange: 0,
        description: 'No previous data for comparison',
      };
    }

    const currentAvg = currentStats.average;
    const previousAvg = comparison.previous.average;
    
    const percentageChange = previousAvg > 0 
      ? Math.round(((currentAvg - previousAvg) / previousAvg) * 100)
      : 0;

    let direction: 'up' | 'down' | 'stable';
    if (Math.abs(percentageChange) < 5) {
      direction = 'stable';
    } else if (percentageChange > 0) {
      direction = 'up';
    } else {
      direction = 'down';
    }

    const description = 
      direction === 'up' 
        ? `Average increased by ${percentageChange}%`
        : direction === 'down'
        ? `Average decreased by ${Math.abs(percentageChange)}%`
        : 'Average remained stable';

    // Track trend for analytics
    trackEngagement('trend_viewed', {
      period,
      direction,
      percentageChange,
    });

    return {
      direction,
      percentageChange,
      description,
    };
  },

  getComparisonWithPreviousPeriod: (period: PeriodType) => {
    const history = useWaterStore.getState().history;
    const minimumWater = parseInt(useSetupStore.getState().minimumWater);
    
    if (!history) {
      const emptyStats: PeriodStats = {
        average: 0,
        total: 0,
        daysTracked: 0,
        goalMet: 0,
        goalMetPercentage: 0,
        dailyData: [],
      };
      return { current: emptyStats, previous: emptyStats };
    }

    const days = period === "week" ? 7 : 30;
    
    // Current period stats
    const current = get().getPeriodStats(period);
    
    // Previous period stats
    const previousStartDate = dayjs().subtract(days * 2 - 1, "day");
    const previousDailyData: DailyStats[] = [];
    let previousTotal = 0;
    let previousDaysTracked = 0;
    let previousGoalMet = 0;

    for (let i = 0; i < days; i++) {
      const date = previousStartDate.add(i, "day").format(DEFAULT_DATE_FORMAT);
      const waterStr = history[date]?.water || "0";
      const amount = parseInt(waterStr) || 0;
      const percentage = minimumWater > 0 ? Math.round((amount / minimumWater) * 100) : 0;

      if (amount > 0) {
        previousDaysTracked++;
        previousTotal += amount;
        if (amount >= minimumWater) {
          previousGoalMet++;
        }
      }

      previousDailyData.push({
        date,
        amount,
        percentage,
      });
    }

    const previousAverage = previousDaysTracked > 0 ? Math.round(previousTotal / previousDaysTracked) : 0;
    const previousGoalMetPercentage = previousDaysTracked > 0 ? Math.round((previousGoalMet / previousDaysTracked) * 100) : 0;

    const previous: PeriodStats = {
      average: previousAverage,
      total: previousTotal,
      daysTracked: previousDaysTracked,
      goalMet: previousGoalMet,
      goalMetPercentage: previousGoalMetPercentage,
      dailyData: previousDailyData,
    };

    return { current, previous };
  },
}));
