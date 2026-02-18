import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { TextInputField } from '../../components/TextInput';
import { Button } from '../../components/Button';
import { PasswordStrength } from '../../components/PasswordStrength';
import {
  validateEmail,
  validatePassword,
  validateName,
  validateConfirmPassword,
} from '../../lib/validation';
import { authService } from '../../lib/services';
import { useAuthStore } from '../../store/auth';

export default function RegisterScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleValidation = (): boolean => {
    const newErrors: Record<string, string> = {};

    const firstNameError = validateName(firstName, 'Nombre');
    if (firstNameError) {
      newErrors[firstNameError.field] = firstNameError.message;
    }

    const lastNameError = validateName(lastName, 'Apellido');
    if (lastNameError) {
      newErrors[lastNameError.field] = lastNameError.message;
    }

    const emailError = validateEmail(email);
    if (emailError) {
      newErrors[emailError.field] = emailError.message;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      newErrors[passwordError.field] = passwordError.message;
    }

    const confirmError = validateConfirmPassword(password, confirmPassword);
    if (confirmError) {
      newErrors[confirmError.field] = confirmError.message;
    }

    if (!agreedToTerms) {
      newErrors.terms = 'Debes aceptar los términos y condiciones';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!handleValidation()) return;

    try {
      setLoading(true);
      const response = await authService.register(email, password, firstName, lastName);
      setAuth(response.user, response.token);
      router.replace('/(app)');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error en el registro';
      Alert.alert('Error', message);
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Únete a FlexiCommerce hoy</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.row}>
            <View style={styles.column}>
              <TextInputField
                label="Nombre"
                placeholder="Juan"
                value={firstName}
                onChangeText={(text) => {
                  setFirstName(text);
                  if (errors.name) {
                    setErrors({ ...errors, name: '' });
                  }
                }}
                error={errors.firstName}
              />
            </View>
            <View style={styles.column}>
              <TextInputField
                label="Apellido"
                placeholder="García"
                value={lastName}
                onChangeText={(text) => {
                  setLastName(text);
                  if (errors.name) {
                    setErrors({ ...errors, name: '' });
                  }
                }}
                error={errors.lastName}
              />
            </View>
          </View>

          <TextInputField
            label="Email"
            placeholder="tu@email.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) {
                setErrors({ ...errors, email: '' });
              }
            }}
            keyboardType="email-address"
            error={errors.email}
          />

          <TextInputField
            label="Contraseña"
            placeholder="••••••••"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) {
                setErrors({ ...errors, password: '' });
              }
            }}
            secureTextEntry
            error={errors.password}
          />

          {password && <PasswordStrength password={password} />}

          <TextInputField
            label="Confirmar Contraseña"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword) {
                setErrors({ ...errors, confirmPassword: '' });
              }
            }}
            secureTextEntry
            error={errors.confirmPassword}
          />

          {/* Terms and Conditions */}
          <View style={styles.termsContainer}>
            <Pressable
              onPress={() => setAgreedToTerms(!agreedToTerms)}
              style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}
            >
              {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
            </Pressable>
            <View style={styles.termsText}>
              <Text style={styles.termsLabel}>Acepto los </Text>
              <Link href="/(auth)/terms" asChild>
                <Text style={styles.termsLink}>Términos y Condiciones</Text>
              </Link>
              <Text style={styles.termsLabel}> y </Text>
              <Link href="/(auth)/privacy" asChild>
                <Text style={styles.termsLink}>Política de Privacidad</Text>
              </Link>
            </View>
          </View>
          {errors.terms && <Text style={styles.error}>{errors.terms}</Text>}

          {/* Register Button */}
          <Button
            title="Crear Cuenta"
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            size="lg"
          />

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
            <Link href="/(auth)/login" asChild>
              <Text style={styles.loginLink}>Inicia sesión</Text>
            </Link>
          </View>
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
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 4,
    marginTop: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  termsText: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  termsLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  termsLink: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: '600',
  },
  error: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: -8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginText: {
    fontSize: 14,
    color: '#6b7280',
  },
  loginLink: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: 'bold',
  },
});
