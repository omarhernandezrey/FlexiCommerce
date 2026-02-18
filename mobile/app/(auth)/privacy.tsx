import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Button } from '../../components/Button';
import { useRouter } from 'expo-router';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Política de Privacidad</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Información que Recopilamos</Text>
          <Text style={styles.text}>
            Recopilamos información que proporcionas directamente, como tu nombre, email y dirección.
            También recopilamos información sobre cómo usas FlexiCommerce.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Cómo Usamos Tu Información</Text>
          <Text style={styles.text}>
            Usamos tu información para proporcionar, mantener y mejorar nuestros servicios, procesar
            transacciones y comunicarnos contigo.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Protección de Datos</Text>
          <Text style={styles.text}>
            Implementamos medidas de seguridad apropiadas para proteger tu información personal contra
            acceso no autorizado, alteración, divulgación o destrucción.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Intercambio de Información</Text>
          <Text style={styles.text}>
            No vendemos, comercializamos ni transferimos tu información de identificación personal a
            terceros sin tu consentimiento, excepto en los casos requeridos por ley.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Cambios a Esta Política</Text>
          <Text style={styles.text}>
            Nos reservamos el derecho a modificar esta política de privacidad en cualquier momento.
            Los cambios son efectivos cuando se publican en FlexiCommerce.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Contáctanos</Text>
          <Text style={styles.text}>
            Si tienes preguntas sobre esta política de privacidad, por favor contáctanos en
            privacy@flexicommerce.com
          </Text>
        </View>
      </ScrollView>

      <Button
        title="Aceptar"
        onPress={() => router.back()}
        size="lg"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 20,
    paddingBottom: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 22,
  },
});