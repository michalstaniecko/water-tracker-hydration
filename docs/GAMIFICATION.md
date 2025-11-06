# Gamification System

## Overview

The gamification system adds engaging elements to the water tracker app including:
- **Streaks**: Track consecutive days of meeting hydration goals
- **Achievements**: Unlock badges for reaching milestones
- **Notifications**: Get notified about achievements and progress

## Features

### Achievements

The app includes 11 different achievements that users can unlock:

1. **First Step** 💧 - Log your first glass of water
2. **Three Days Strong** 🔥 - Maintain a 3-day streak
3. **Week Warrior** ⚡ - Maintain a 7-day streak
4. **Two Weeks Champion** 🏆 - Maintain a 14-day streak
5. **Monthly Master** 👑 - Maintain a 30-day streak
6. **Weekly Winner** 🎯 - Achieve your goal every day for a week
7. **Monthly Achiever** 🌟 - Achieve your goal 30 days in a month
8. **10 Liters** 💦 - Drink a total of 10 liters
9. **50 Liters** 🌊 - Drink a total of 50 liters
10. **100 Liters** 🏅 - Drink a total of 100 liters
11. **Perfect Week** ✨ - Achieve 100% of your goal for 7 days straight

### Streaks

The app tracks:
- Current streak: Number of consecutive days meeting the daily water goal
- Best day in the current period
- Streak display on the home screen

### Notifications

Users receive notifications for:
- Achievement unlocks
- Milestone achievements
- Reminder notifications (can be extended)

## Implementation

### Store: `stores/gamification.ts`

The gamification store manages:
- Achievement state (locked/unlocked)
- Notification list
- Achievement checking logic
- Persistent storage

Key methods:
- `fetchOrInitData()`: Initialize or load saved data
- `checkAndUnlockAchievements()`: Check all achievement conditions and unlock as needed
- `addNotification()`: Create a new notification
- `markNotificationAsRead()`: Mark notification as read
- `getUnlockedAchievements()`: Get all unlocked achievements
- `getLockedAchievements()`: Get all locked achievements

### Components

1. **AchievementsList** (`components/AchievementsList.tsx`)
   - Displays all achievements (unlocked and locked)
   - Shows unlock date for completed achievements
   - Visual distinction between locked and unlocked

2. **NotificationsList** (`components/NotificationsList.tsx`)
   - Shows all notifications
   - Mark as read functionality
   - Clear all notifications

3. **CardStreakAchievements** (`components/CardStreakAchievements.tsx`)
   - Displays current streak
   - Shows achievement progress
   - Quick preview of unlocked achievement icons
   - Tappable to navigate to full achievements view

### Integration

The system is integrated into the app at multiple touchpoints:

1. **App Initialization** (`app/_layout.tsx`)
   - Loads gamification data on app start
   - Checks achievements when app becomes active

2. **Water Tracking** (`hooks/useWater.ts`)
   - Triggers achievement checks when water is added
   - Ensures real-time achievement unlocking

3. **Home Screen** (`app/(tabs)/index.tsx`)
   - Shows streak and achievement card
   - Motivates users with progress visualization

4. **Achievements Tab** (`app/(tabs)/achievements.tsx`)
   - Dedicated tab for viewing all achievements
   - Full achievement list with descriptions

## Translations

The gamification system supports both English and Polish:
- English: `i18n/en/gamification.json`
- Polish: `i18n/pl/gamification.json`

## Future Enhancements

Potential additions to the gamification system:

1. **Push Notifications**
   - Daily reminders to drink water
   - Streak preservation reminders
   - Achievement celebration notifications

2. **Social Features**
   - Share achievements on social media
   - Compare streaks with friends
   - Leaderboards

3. **More Achievements**
   - Time-based achievements (morning/evening hydration)
   - Consistency achievements
   - Special event achievements

4. **Rewards System**
   - Points for achievements
   - Unlockable themes or avatars
   - Premium features

5. **Analytics**
   - Achievement completion rates
   - Most popular milestones
   - User engagement metrics
