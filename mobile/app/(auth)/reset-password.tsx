import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { TextInputField } from '../../components/TextInput';
import { Button } from '../../components/Button';
import { validateEmail } from '../../lib/validation';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError.message);
      return;
    }

    try {
      setLoading(true);
      // TODO: Implement password reset API call
      setSent(true);
      Alert.alert('Éxito', 'Email de recuperación enviado a ' + email);
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (err) {
      setError('Error al enviar email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Recuperar Contraseña</Text>
          <Text style={styles.subtitle}>Te enviaremos un email para resetear tu contraseña</Text>
        </View>

        <View style={styles.form}>
          <TextInputField
            label="Email"
            placeholder="tu@email.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError('');
            }}
            keyboardType="email-address"
            error={error}
          />

          <Button
            title={sent ? 'Email Enviado' : 'Enviar Email'}
            onPress={handleReset}
            loading={loading}
            disabled={loading || sent}
            size="lg"
          />

          <Button
            title="Volver"
            onPress={() => router.back()}
            variant="ghost"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
});