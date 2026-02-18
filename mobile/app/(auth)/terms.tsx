import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Button } from '../../components/Button';
import { useRouter } from 'expo-router';

export default function TermsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Términos y Condiciones</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Aceptación de Términos</Text>
          <Text style={styles.text}>
            Al acceder y usar FlexiCommerce, aceptas estar vinculado por estos términos y condiciones.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Uso de Licencia</Text>
          <Text style={styles.text}>
            Se te otorga una licencia limitada, no exclusiva y no transferible para usar FlexiCommerce
            de acuerdo con estas condiciones.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Disclaimer</Text>
          <Text style={styles.text}>
            El material en FlexiCommerce se proporciona "tal como está". FlexiCommerce no es responsable
            por ningún daño que resulte del uso de este sitio.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Limitaciones</Text>
          <Text style={styles.text}>
            FlexiCommerce no será responsable de ningún daño directo, indirecto, incidental o
            consecuente derivado del uso o imposibilidad de usar el material.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Precisión de Materiales</Text>
          <Text style={styles.text}>
            El material que aparece en FlexiCommerce podría incluir errores técnicos, tipográficos o
            fotográficos. FlexiCommerce no garantiza que ninguno de los materiales en FlexiCommerce
            sean precisos, completos o actuales.
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