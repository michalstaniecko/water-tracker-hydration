import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useWaterStore } from "./water";
import { useStatisticsStore } from "./statistics";
import { useSetupStore } from "./setup";
import { logError, logWarning } from "@/utils/errorLogging";

export type AchievementType =
  | "first_glass"
  | "streak_3"
  | "streak_7"
  | "streak_14"
  | "streak_30"
  | "goal_achieved_week"
  | "goal_achieved_month"
  | "total_10l"
  | "total_50l"
  | "total_100l"
  | "perfect_week";

export type Achievement = {
  id: AchievementType;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  isUnlocked: boolean;
};

export type NotificationType = "achievement" | "reminder" | "milestone";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  achievementId?: AchievementType;
};

type GamificationStore = {
  achievements: Achievement[];
  notifications: Notification[];
  lastChecked: string | null;
  fetchOrInitData: () => Promise<void>;
  checkAndUnlockAchievements: () => Promise<void>;
  getUnlockedAchievements: () => Achievement[];
  getLockedAchievements: () => Achievement[];
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">,
  ) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  getUnreadNotifications: () => Notification[];
  clearNotifications: () => Promise<void>;
  updateStorage: () => Promise<void>;
};

const storageKey = "gamificationData";

const defaultAchievements: Achievement[] = [
  {
    id: "first_glass",
    title: "First Step",
    description: "Log your first glass of water",
    icon: "💧",
    isUnlocked: false,
  },
  {
    id: "streak_3",
    title: "Three Days Strong",
    description: "Maintain a 3-day streak",
    icon: "🔥",
    isUnlocked: false,
  },
  {
    id: "streak_7",
    title: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "⚡",
    isUnlocked: false,
  },
  {
    id: "streak_14",
    title: "Two Weeks Champion",
    description: "Maintain a 14-day streak",
    icon: "🏆",
    isUnlocked: false,
  },
  {
    id: "streak_30",
    title: "Monthly Master",
    description: "Maintain a 30-day streak",
    icon: "👑",
    isUnlocked: false,
  },
  {
    id: "goal_achieved_week",
    title: "Weekly Winner",
    description: "Achieve your goal every day for a week",
    icon: "🎯",
    isUnlocked: false,
  },
  {
    id: "goal_achieved_month",
    title: "Monthly Achiever",
    description: "Achieve your goal 30 days in a month",
    icon: "🌟",
    isUnlocked: false,
  },
  {
    id: "total_10l",
    title: "10 Liters",
    description: "Drink a total of 10 liters",
    icon: "💦",
    isUnlocked: false,
  },
  {
    id: "total_50l",
    title: "50 Liters",
    description: "Drink a total of 50 liters",
    icon: "🌊",
    isUnlocked: false,
  },
  {
    id: "total_100l",
    title: "100 Liters",
    description: "Drink a total of 100 liters",
    icon: "🏅",
    isUnlocked: false,
  },
  {
    id: "perfect_week",
    title: "Perfect Week",
    description: "Achieve 100% of your goal for 7 days straight",
    icon: "✨",
    isUnlocked: false,
  },
];

export const useGamificationStore = create<GamificationStore>((set, get) => ({
  achievements: defaultAchievements,
  notifications: [],
  lastChecked: null,

  fetchOrInitData: async () => {
    try {
      const data = await AsyncStorage.getItem(storageKey);
      if (data !== null) {
        const parsedData = JSON.parse(data);

        if (typeof parsedData === "object" && parsedData !== null) {
          const mergedAchievements = defaultAchievements.map((defaultAch) => {
            const savedAch = parsedData.achievements?.find(
              (a: Achievement) => a.id === defaultAch.id,
            );
            return savedAch || defaultAch;
          });

          set({
            achievements: mergedAchievements,
            notifications: parsedData.notifications || [],
            lastChecked: parsedData.lastChecked || null,
          });
        } else {
          logWarning("Invalid gamification data structure, reinitializing", {
            operation: "fetchOrInitData",
            component: "GamificationStore",
          });
          throw new Error("Invalid data structure");
        }
      } else {
        set({
          achievements: defaultAchievements,
          notifications: [],
          lastChecked: null,
        });
        await get().updateStorage();
      }
    } catch (error) {
      logError(error, {
        operation: "fetchOrInitData",
        component: "GamificationStore",
      });
      set({
        achievements: defaultAchievements,
        notifications: [],
        lastChecked: null,
      });
    }
  },

  checkAndUnlockAchievements: async () => {
    try {
      const waterHistory = useWaterStore.getState().history;
      const currentStreak = useStatisticsStore.getState().getCurrentStreak();
      const weeklyStats = useStatisticsStore.getState().getWeeklyStats();
      const monthlyStats = useStatisticsStore.getState().getMonthlyStats();
      const minimumWater = parseInt(useSetupStore.getState().minimumWater);
      const todayWater = parseInt(useWaterStore.getState().getTodayWater());

      if (!waterHistory) return;

      const currentAchievements = get().achievements;
      const updatedAchievements = [...currentAchievements];
      const now = new Date().toISOString();

      // Calculate total water consumed
      let totalWater = 0;
      Object.values(waterHistory).forEach((day) => {
        totalWater += parseInt(day.water) || 0;
      });

      // Check each achievement
      const achievementChecks: { [key in AchievementType]: boolean } = {
        first_glass: todayWater > 0 || totalWater > 0,
        streak_3: currentStreak >= 3,
        streak_7: currentStreak >= 7,
        streak_14: currentStreak >= 14,
        streak_30: currentStreak >= 30,
        goal_achieved_week: weeklyStats.goalMet >= 7,
        goal_achieved_month: monthlyStats.goalMet >= 30,
        total_10l: totalWater >= 10000,
        total_50l: totalWater >= 50000,
        total_100l: totalWater >= 100000,
        perfect_week:
          currentStreak >= 7 &&
          weeklyStats.dailyData
            .slice(-7)
            .every((day) => day.amount >= minimumWater),
      };

      // Unlock achievements and create notifications
      let hasChanges = false;
      updatedAchievements.forEach((achievement, index) => {
        if (
          !achievement.isUnlocked &&
          achievementChecks[achievement.id as AchievementType]
        ) {
          updatedAchievements[index] = {
            ...achievement,
            isUnlocked: true,
            unlockedAt: now,
          };
          hasChanges = true;

          // Add notification for unlocked achievement
          get().addNotification({
            type: "achievement",
            title: "Achievement Unlocked!",
            message: `You've unlocked: ${achievement.title}`,
            achievementId: achievement.id as AchievementType,
          });
        }
      });

      if (hasChanges) {
        set({ achievements: updatedAchievements, lastChecked: now });
        await get().updateStorage();
      }
    } catch (error) {
      logError(error, {
        operation: "checkAndUnlockAchievements",
        component: "GamificationStore",
      });
    }
  },

  getUnlockedAchievements: () => {
    return get().achievements.filter((a) => a.isUnlocked);
  },

  getLockedAchievements: () => {
    return get().achievements.filter((a) => !a.isUnlocked);
  },

  addNotification: async (
    notification: Omit<Notification, "id" | "timestamp" | "read">,
  ) => {
    try {
      const newNotification: Notification = {
        ...notification,
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        read: false,
      };

      const notifications = [...get().notifications, newNotification];
      set({ notifications });
      await get().updateStorage();
    } catch (error) {
      logError(error, {
        operation: "addNotification",
        component: "GamificationStore",
      });
    }
  },

  markNotificationAsRead: async (id: string) => {
    try {
      const notifications = get().notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif,
      );
      set({ notifications });
      await get().updateStorage();
    } catch (error) {
      logError(error, {
        operation: "markNotificationAsRead",
        component: "GamificationStore",
      });
    }
  },

  getUnreadNotifications: () => {
    return get().notifications.filter((n) => !n.read);
  },

  clearNotifications: async () => {
    try {
      set({ notifications: [] });
      await get().updateStorage();
    } catch (error) {
      logError(error, {
        operation: "clearNotifications",
        component: "GamificationStore",
      });
    }
  },

  updateStorage: async () => {
    try {
      const state = get();
      const data = {
        achievements: state.achievements,
        notifications: state.notifications,
        lastChecked: state.lastChecked,
      };
      await AsyncStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      logError(error, {
        operation: "updateStorage",
        component: "GamificationStore",
      });
    }
  },
}));
