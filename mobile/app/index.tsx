import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/auth';

export default function Index() {
  const [hydrated, setHydrated] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    // Simular hidratación - AsyncStorage carga inmediatamente en Expo Go
    const timer = setTimeout(() => {
      setHydrated(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (!hydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(app)" />;
  }
  return <Redirect href="/(auth)/login" />;
}
