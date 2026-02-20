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
import { useRouter, Link } from 'expo-router';
import { TextInputField } from '../../components/TextInput';
import { Button } from '../../components/Button';
import { validateEmail, validatePassword } from '../../lib/validation';
import { authService } from '../../lib/services';
import { useAuthStore } from '../../store/auth';

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleValidation = (): boolean => {
    const newErrors: Record<string, string> = {};

    const emailError = validateEmail(email);
    if (emailError) {
      newErrors[emailError.field] = emailError.message;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      newErrors[passwordError.field] = passwordError.message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!handleValidation()) return;

    try {
      setLoading(true);
      const response = await authService.login(email, password);
      setAuth(response.user, response.token);
      router.replace('/(app)' as any);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error de inicio de sesión';
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
          <Text style={styles.title}>FlexiCommerce</Text>
          <Text style={styles.subtitle}>Inicia sesión en tu cuenta</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
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

          {/* Forgot Password Link */}
          <View style={styles.forgotPasswordContainer}>
            <Link href="/(auth)/reset-password" asChild>
              <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
            </Link>
          </View>

          {/* Login Button */}
          <Button
            title="Iniciar Sesión"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            size="lg"
          />

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>¿No tienes cuenta? </Text>
            <Link href="/(auth)/register" asChild>
              <Text style={styles.registerLink}>Regístrate</Text>
            </Link>
          </View>
        </View>

        {/* Social Login (Placeholder) */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>O continúa con</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialContainer}>
          <View style={styles.socialButton}>
            <Text style={styles.socialText}>Google</Text>
          </View>
          <View style={styles.socialButton}>
            <Text style={styles.socialText}>Apple</Text>
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
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
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: -8,
  },
  forgotPassword: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  registerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  registerLink: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    fontSize: 14,
    color: '#9ca3af',
    paddingHorizontal: 12,
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
});
