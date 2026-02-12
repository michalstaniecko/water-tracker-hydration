import { useEffect, useRef } from "react";
import { useNotificationsStore } from "@/stores/notifications";
import { getNotificationContent } from "@/services/notificationService";

export function useActivityHoursRescheduler(
  startHour: string,
  endHour: string,
  scheduleReminders: (
    startHour: string,
    endHour: string,
    title: string,
    body: string,
  ) => void,
) {
  const isInitialMount = useRef(true);

  // Reschedule notifications when activity hours change (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const { enabled, permissionStatus } = useNotificationsStore.getState();
    if (enabled && permissionStatus === "granted") {
      const { title, body } = getNotificationContent();
      scheduleReminders(startHour, endHour, title, body);
    }
  }, [startHour, endHour, scheduleReminders]);
}
