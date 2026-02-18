import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Stack } from 'expo-router';
import React from 'react';
import { colors } from '../../styles/theme';

const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="products/[id]" options={{ presentation: 'modal' }} />
      <Stack.Screen name="reviews/[id]" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

function SearchStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="search" />
      <Stack.Screen name="products/[id]" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

function WishlistStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="wishlist" />
      <Stack.Screen name="products/[id]" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

function CartStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="cart" />
      <Stack.Screen name="checkout" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

function ProfileStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="profile" />
      <Stack.Screen name="orders" options={{ presentation: 'modal' }} />
      <Stack.Screen name="orders/[id]" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

export default function AppLayout() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
        tabBarStyle: {
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="home"
        component={HomeStack}
        options={{
          title: 'Inicio',
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="search-tab"
        component={SearchStack}
        options={{
          title: 'Buscar',
          tabBarLabel: 'Buscar',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="wishlist-tab"
        component={WishlistStack}
        options={{
          title: 'Favoritos',
          tabBarLabel: 'Favoritos',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="cart-tab"
        component={CartStack}
        options={{
          title: 'Carrito',
          tabBarLabel: 'Carrito',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="bag" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="profile-tab"
        component={ProfileStack}
        options={{
          title: 'Perfil',
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
