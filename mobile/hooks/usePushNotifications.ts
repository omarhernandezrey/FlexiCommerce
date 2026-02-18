import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import {
  configureNotifications,
  registerForPushNotifications,
  listenToNotifications,
} from '../lib/notifications';

export const usePushNotifications = (
  onNotification?: (notification: Notifications.Notification) => void
) => {
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const setupNotifications = async () => {
      // Configure notification handler
      await configureNotifications();

      // Register for push notifications
      const token = await registerForPushNotifications();
      console.log('Push notification token:', token);

      // Listen to incoming notifications
      const unsubscribe = listenToNotifications((notification) => {
        console.log('Notification received:', notification);
        if (onNotification) {
          onNotification(notification);
        }
      });

      unsubscribeRef.current = unsubscribe;
    };

    setupNotifications();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [onNotification]);
};
