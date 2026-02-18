import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/auth';
import { usePushNotifications } from '../hooks/usePushNotifications';

export default function RootLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isReady, setIsReady] = useState(false);

  // Initialize push notifications
  usePushNotifications((notification) => {
    console.log('Notification received in root:', notification);
  });

  useEffect(() => {
    // Simulate app initialization check
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return null; // Splash screen will be shown
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {isAuthenticated ? (
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      )}
    </Stack>
  );
}
