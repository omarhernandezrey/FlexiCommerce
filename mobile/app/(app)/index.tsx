import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="rocket" size={48} color="#2563eb" />
        <Text style={styles.title}>FlexiCommerce</Text>
        <Text style={styles.subtitle}>Plataforma de E-commerce</Text>
      </View>

      <View style={styles.content}>
        <Pressable
          style={styles.card}
          onPress={() => router.push('/search')}
        >
          <Ionicons name="search" size={32} color="#2563eb" />
          <Text style={styles.cardTitle}>Ver Productos</Text>
          <Text style={styles.cardDesc}>Explora nuestro catálogo</Text>
        </Pressable>

        <Pressable
          style={styles.card}
          onPress={() => router.push('/cart')}
        >
          <Ionicons name="bag" size={32} color="#2563eb" />
          <Text style={styles.cardTitle}>Mi Carrito</Text>
          <Text style={styles.cardDesc}>Revisa tus compras</Text>
        </Pressable>

        <Pressable
          style={styles.card}
          onPress={() => router.push('/wishlist')}
        >
          <Ionicons name="heart" size={32} color="#2563eb" />
          <Text style={styles.cardTitle}>Favoritos</Text>
          <Text style={styles.cardDesc}>Tus artículos guardados</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>✅ Conectado correctamente</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f8',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
    marginTop: 12,
  },
  cardDesc: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
});
