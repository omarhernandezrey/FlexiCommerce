import { View, Pressable, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth';
import Text from '../../components/Text';
import Button from '../../components/Button';
import { colors, spacing, borderRadius } from '../../styles/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro?', [
      { text: 'Cancelar', onPress: () => {} },
      {
        text: 'Cerrar Sesión',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
        style: 'destructive',
      },
    ]);
  };

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.lg, backgroundColor: colors.background }}>
        <Ionicons name="lock-closed-outline" size={64} color={colors.gray} />
        <Text style={{ fontSize: 18, fontWeight: '700', marginTop: spacing.lg, textAlign: 'center' }}>
          No iniciaste sesión
        </Text>
        <Button
          onPress={() => router.replace('/(auth)/login')}
          title="Iniciar Sesión"
          size="lg"
          style={{ marginTop: spacing.lg }}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
        {/* Profile Header */}
        <View style={{ backgroundColor: colors.white, padding: spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.primary,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 32, fontWeight: '700', color: colors.white }}>
                {user.firstName?.[0]?.toUpperCase() || 'U'}
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 18, fontWeight: '700' }}>
                {`${user.firstName} ${user.lastName}` || 'Usuario'}
              </Text>
              <Text style={{ fontSize: 14, color: colors.gray, marginTop: spacing.xs }}>
                {user.email}
              </Text>
            </View>
          </View>
        </View>

        {/* Menu Sections */}
        <View style={{ marginTop: spacing.md }}>
          {/* Account Section */}
          <View style={{ backgroundColor: colors.white, marginBottom: spacing.md }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.gray, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm }}>
              CUENTA
            </Text>

            <Pressable
              onPress={() => router.push('/(app)/profile/edit')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <Ionicons name="person-outline" size={24} color={colors.primary} />
                <Text style={{ fontWeight: '600' }}>Editar Perfil</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.gray} />
            </Pressable>

            <Pressable
              onPress={() => router.push('/(app)/profile/addresses')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <Ionicons name="location-outline" size={24} color={colors.primary} />
                <Text style={{ fontWeight: '600' }}>Direcciones</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.gray} />
            </Pressable>

            <Pressable
              onPress={() => router.push('/(app)/orders')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <Ionicons name="receipt-outline" size={24} color={colors.primary} />
                <Text style={{ fontWeight: '600' }}>Mis Pedidos</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.gray} />
            </Pressable>

            <Pressable
              onPress={() => router.push('/(app)/profile/payments')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <Ionicons name="card-outline" size={24} color={colors.primary} />
                <Text style={{ fontWeight: '600' }}>Métodos de Pago</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.gray} />
            </Pressable>
          </View>

          {/* Support Section */}
          <View style={{ backgroundColor: colors.white, marginBottom: spacing.md }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.gray, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm }}>
              SOPORTE
            </Text>

            <Pressable
              onPress={() => Alert.alert('Ayuda', 'Centro de ayuda - Próximamente')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <Ionicons name="help-circle-outline" size={24} color={colors.primary} />
                <Text style={{ fontWeight: '600' }}>Centro de Ayuda</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.gray} />
            </Pressable>

            <Pressable
              onPress={() => Alert.alert('Contacto', 'Contacta con nosotros - Próximamente')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <Ionicons name="mail-outline" size={24} color={colors.primary} />
                <Text style={{ fontWeight: '600' }}>Contacto</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.gray} />
            </Pressable>
          </View>

          {/* App Section */}
          <View style={{ backgroundColor: colors.white, marginBottom: spacing.md }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.gray, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm }}>
              APLICACIÓN
            </Text>

            <Pressable
              onPress={() => Alert.alert('Versión', 'FlexiCommerce v1.0.0')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
                <Text style={{ fontWeight: '600' }}>Versión</Text>
              </View>
              <Text style={{ color: colors.gray }}>1.0.0</Text>
            </Pressable>

            <Pressable
              onPress={() => Alert.alert('Términos', 'Términos y Condiciones - Próximamente')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <Ionicons name="document-text-outline" size={24} color={colors.primary} />
                <Text style={{ fontWeight: '600' }}>Términos y Privacidad</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.gray} />
            </Pressable>
          </View>
        </View>

        {/* Logout Button */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
          <Button
            onPress={handleLogout}
            title="Cerrar Sesión"
            variant="secondary"
            size="lg"
          />
        </View>
      </ScrollView>
    </View>
  );
}
