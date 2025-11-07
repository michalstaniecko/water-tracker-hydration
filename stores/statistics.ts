import { create } from "zustand";
import dayjs from "@/plugins/dayjs";
import { useWaterStore } from "./water";
import { useSetupStore } from "./setup";
import { DEFAULT_DATE_FORMAT } from "@/config/date";

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

/**
 * Statistics Store
 * 
 * Provides analytics and statistics for water intake tracking.
 * Supports weekly and monthly views with average calculations,
 * goal achievement tracking, and streak monitoring.
 * 
 * Future integration points:
 * - Analytics service integration (e.g., Google Analytics, Firebase Analytics)
 * - Export functionality for data analysis
 * - Advanced metrics and insights
 */
type StatisticsStore = {
  getWeeklyStats: () => PeriodStats;
  getMonthlyStats: () => PeriodStats;
  getPeriodStats: (period: PeriodType) => PeriodStats;
  getBestDay: (period: PeriodType) => DailyStats | null;
  getCurrentStreak: () => number;
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

    return streak;
  },
}));
