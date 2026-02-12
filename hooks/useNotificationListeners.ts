import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useNotificationsStore } from "@/stores/notifications";
import {
  addNotificationResponseListener,
  addNotificationReceivedListener,
} from "@/services/notificationService";
import { NOTIFICATION_ACTION_OPEN_HOME } from "@/constants/notifications";

export function useNotificationListeners() {
  const router = useRouter();

  // Handle notification tap - deep linking
  useEffect(() => {
    const subscription = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.action === NOTIFICATION_ACTION_OPEN_HOME) {
        router.push("/(tabs)/");
      }
    });

    return () => subscription.remove();
  }, [router]);

  // Track received notifications in foreground to increment counter
  useEffect(() => {
    const subscription = addNotificationReceivedListener(() => {
      const notificationsState = useNotificationsStore.getState();
      if (notificationsState.enabled) {
        notificationsState.onNotificationReceived();
      }
    });

    return () => subscription.remove();
  }, []);
}
