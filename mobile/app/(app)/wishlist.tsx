import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function WishlistScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Favoritos</Text>
      <Text style={styles.subtitle}>Funcionalidad en desarrollo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6f7f8',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
});
