import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

const PRIMARY_COLOR = '#2563eb';
const GRAY_COLOR = '#d1d5db';
const BORDER_COLOR = '#e5e7eb';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: PRIMARY_COLOR,
        tabBarInactiveTintColor: GRAY_COLOR,
        tabBarStyle: {
          borderTopColor: BORDER_COLOR,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
          backgroundColor: '#ffffff',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: 4,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTintColor: '#000',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarLabel: 'Inicio',
          headerTitle: 'FlexiCommerce',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Buscar',
          tabBarLabel: 'Buscar',
          headerTitle: 'Buscar Productos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Favoritos',
          tabBarLabel: 'Favoritos',
          headerTitle: 'Mis Favoritos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Carrito',
          tabBarLabel: 'Carrito',
          headerTitle: 'Mi Carrito',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bag" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarLabel: 'Perfil',
          headerTitle: 'Mi Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
