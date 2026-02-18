import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Skip notification setup in Android Genymotion emulator
const IS_GENYMOTION = Device.modelId === 'genymotion';

/**
 * Configure notification handler
 */
export const configureNotifications = async () => {
  // Set default notification behavior
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
};

/**
 * Register for push notifications and get token
 */
export const registerForPushNotifications = async (): Promise<string | null> => {
  try {
    // Check if device supports notifications
    if (!Device.isDevice) {
      console.log('Push notifications only work on actual devices');
      return null;
    }

    // Skip on Genymotion
    if (IS_GENYMOTION) {
      console.log('Skipping notifications on Genymotion');
      return null;
    }

    // Get current permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // If not already granted, ask for permission
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push notification permissions');
      return null;
    }

    // Get the token for this device
    const token = await Notifications.getExpoPushTokenAsync();
    console.log('Expo push token:', token.data);

    return token.data;
  } catch (err) {
    console.error('Error registering for push notifications:', err);
    return null;
  }
};

/**
 * Send local notification
 */
export const sendLocalNotification = async (
  title: string,
  body: string,
  data?: Record<string, any>
) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
        badge: 1,
      },
      trigger: {
        seconds: 2,
      },
    });
  } catch (err) {
    console.error('Error sending local notification:', err);
  }
};

/**
 * Listen to incoming notifications
 */
export const listenToNotifications = (
  callback: (notification: Notifications.Notification) => void
) => {
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    callback(response.notification);
  });

  return () => {
    subscription.remove();
  };
};

/**
 * Get all scheduled notifications
 */
export const getScheduledNotifications = async () => {
  return await Notifications.getAllScheduledNotificationsAsync();
};

/**
 * Cancel a notification
 */
export const cancelNotification = async (notificationId: string) => {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
};

/**
 * Cancel all notifications
 */
export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};
