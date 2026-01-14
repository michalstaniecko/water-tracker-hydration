import dayjs from "@/plugins/dayjs";
import { Notification } from "@/stores/gamification";

export type GroupedNotifications = {
  date: string;
  dateLabel: string;
  notifications: Notification[];
};

export function groupNotificationsByDay(
  notifications: Notification[],
  dateFormat: string,
): GroupedNotifications[] {
  const grouped: Record<string, Notification[]> = {};

  notifications.forEach((notification) => {
    const dateKey = dayjs(notification.timestamp).format("YYYY-MM-DD");
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(notification);
  });

  return Object.entries(grouped)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([dateKey, notifs]) => ({
      date: dateKey,
      dateLabel: formatDateLabel(dateKey, dateFormat),
      notifications: notifs.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
    }));
}

function formatDateLabel(dateKey: string, dateFormat: string): string {
  const date = dayjs(dateKey);
  const today = dayjs();
  const yesterday = today.subtract(1, "day");

  if (date.isSame(today, "day")) {
    return "today";
  }
  if (date.isSame(yesterday, "day")) {
    return "yesterday";
  }
  return date.format(dateFormat);
}
