import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth';
import { useCartStore } from '../../store/cart';
import { useWishlistStore } from '../../store/wishlist';

const PRIMARY = '#2563eb';

interface MenuItemProps {
  icon: string;
  label: string;
  sublabel?: string;
  onPress: () => void;
  iconColor?: string;
  rightElement?: React.ReactNode;
  danger?: boolean;
}

function MenuItem({
  icon,
  label,
  sublabel,
  onPress,
  iconColor = '#2563eb',
  rightElement,
  danger = false,
}: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIconWrapper, { backgroundColor: danger ? '#fef2f2' : '#eff6ff' }]}>
        <Ionicons
          name={icon as any}
          size={20}
          color={danger ? '#ef4444' : iconColor}
        />
      </View>
      <View style={styles.menuLabelWrapper}>
        <Text style={[styles.menuLabel, danger && { color: '#ef4444' }]}>{label}</Text>
        {sublabel && <Text style={styles.menuSublabel}>{sublabel}</Text>}
      </View>
      {rightElement || (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={danger ? '#ef4444' : '#9ca3af'}
        />
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, updateUser } = useAuthStore();
  const { items: cartItems } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editFirstName, setEditFirstName] = useState(user?.firstName || '');
  const [editLastName, setEditLastName] = useState(user?.lastName || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [editErrors, setEditErrors] = useState<{ firstName?: string; lastName?: string }>({});

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(auth)/login' as any);
          },
        },
      ]
    );
  };

  const openEditModal = () => {
    setEditFirstName(user?.firstName || '');
    setEditLastName(user?.lastName || '');
    setEditErrors({});
    setEditModalVisible(true);
  };

  const validateEditFields = (): boolean => {
    const errors: { firstName?: string; lastName?: string } = {};
    if (!editFirstName.trim() || editFirstName.trim().length < 2) {
      errors.firstName = 'El nombre debe tener al menos 2 caracteres';
    }
    if (!editLastName.trim() || editLastName.trim().length < 2) {
      errors.lastName = 'El apellido debe tener al menos 2 caracteres';
    }
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateEditFields()) return;

    try {
      setSavingProfile(true);
      // Actualizar en el store local (sin endpoint de actualización en este momento)
      updateUser({
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
      });
      setEditModalVisible(false);
      Alert.alert('Perfil actualizado', 'Tu información fue guardada correctamente.');
    } catch (err: any) {
      Alert.alert('Error', 'No se pudo actualizar el perfil. Intenta de nuevo.');
    } finally {
      setSavingProfile(false);
    }
  };

  const getInitials = () => {
    const first = (user?.firstName || '').charAt(0).toUpperCase();
    const last = (user?.lastName || '').charAt(0).toUpperCase();
    return `${first}${last}` || 'U';
  };

  const getFullName = () => {
    if (!user) return 'Usuario';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuario';
  };

  const getRoleBadge = () => {
    if (user?.role === 'admin') return { label: 'Administrador', color: '#7c3aed' };
    return { label: 'Cliente', color: '#10b981' };
  };

  const roleBadge = getRoleBadge();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Tarjeta de perfil */}
      <View style={styles.profileCard}>
        {/* Avatar con iniciales */}
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitials}>{getInitials()}</Text>
          </View>
          <TouchableOpacity style={styles.editAvatarBtn} onPress={openEditModal}>
            <Ionicons name="pencil" size={14} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.profileName}>{getFullName()}</Text>
        <Text style={styles.profileEmail}>{user?.email || ''}</Text>

        <View style={[styles.roleBadge, { backgroundColor: roleBadge.color + '20' }]}>
          <View style={[styles.roleDot, { backgroundColor: roleBadge.color }]} />
          <Text style={[styles.roleText, { color: roleBadge.color }]}>
            {roleBadge.label}
          </Text>
        </View>

        {/* Estadísticas */}
        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statItem} onPress={() => router.push('/(app)/orders' as any)}>
            <Ionicons name="receipt-outline" size={22} color={PRIMARY} />
            <Text style={styles.statLabel}>Pedidos</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => router.push('/(app)/wishlist')}
          >
            <Ionicons name="heart-outline" size={22} color="#ef4444" />
            <Text style={styles.statLabel}>
              Favoritos ({wishlistItems.length})
            </Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => router.push('/(app)/cart')}
          >
            <Ionicons name="bag-outline" size={22} color="#f59e0b" />
            <Text style={styles.statLabel}>
              Carrito ({cartItems.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Botón Editar Perfil */}
      <TouchableOpacity style={styles.editProfileButton} onPress={openEditModal}>
        <Ionicons name="create-outline" size={18} color={PRIMARY} />
        <Text style={styles.editProfileText}>Editar Perfil</Text>
      </TouchableOpacity>

      {/* Sección: Mi Cuenta */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Mi Cuenta</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="receipt-outline"
            label="Mis Pedidos"
            sublabel="Ver historial de compras"
            onPress={() => router.push('/(app)/orders' as any)}
            iconColor="#2563eb"
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="heart-outline"
            label="Mis Favoritos"
            sublabel={`${wishlistItems.length} productos guardados`}
            onPress={() => router.push('/(app)/wishlist')}
            iconColor="#ef4444"
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="bag-outline"
            label="Mi Carrito"
            sublabel={`${cartItems.length} artículo${cartItems.length !== 1 ? 's' : ''}`}
            onPress={() => router.push('/(app)/cart')}
            iconColor="#f59e0b"
          />
        </View>
      </View>

      {/* Sección: Configuración */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Configuración</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="notifications-outline"
            label="Notificaciones"
            sublabel="Gestiona tus alertas"
            onPress={() => Alert.alert('Próximamente', 'Esta funcionalidad estará disponible pronto.')}
            iconColor="#8b5cf6"
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="shield-checkmark-outline"
            label="Privacidad y Seguridad"
            onPress={() => Alert.alert('Próximamente', 'Esta funcionalidad estará disponible pronto.')}
            iconColor="#10b981"
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="help-circle-outline"
            label="Ayuda y Soporte"
            onPress={() => Alert.alert('Soporte', 'Para ayuda, contáctanos en soporte@flexicommerce.com')}
            iconColor="#6b7280"
          />
        </View>
      </View>

      {/* Botón Cerrar Sesión */}
      <View style={styles.menuSection}>
        <View style={styles.menuCard}>
          <MenuItem
            icon="log-out-outline"
            label="Cerrar Sesión"
            onPress={handleLogout}
            danger
          />
        </View>
      </View>

      {/* Versión */}
      <Text style={styles.versionText}>FlexiCommerce v1.0.0</Text>

      {/* Modal de Editar Perfil */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            {/* Handle */}
            <View style={styles.modalHandle} />

            <Text style={styles.modalTitle}>Editar Perfil</Text>
            <Text style={styles.modalSubtitle}>Actualiza tu información personal</Text>

            {/* Nombre */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Nombre</Text>
              <TextInput
                style={[styles.fieldInput, editErrors.firstName && styles.fieldInputError]}
                value={editFirstName}
                onChangeText={(t) => {
                  setEditFirstName(t);
                  if (editErrors.firstName) setEditErrors({ ...editErrors, firstName: undefined });
                }}
                placeholder="Tu nombre"
                placeholderTextColor="#9ca3af"
                autoCapitalize="words"
              />
              {editErrors.firstName && (
                <Text style={styles.fieldError}>{editErrors.firstName}</Text>
              )}
            </View>

            {/* Apellido */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Apellido</Text>
              <TextInput
                style={[styles.fieldInput, editErrors.lastName && styles.fieldInputError]}
                value={editLastName}
                onChangeText={(t) => {
                  setEditLastName(t);
                  if (editErrors.lastName) setEditErrors({ ...editErrors, lastName: undefined });
                }}
                placeholder="Tu apellido"
                placeholderTextColor="#9ca3af"
                autoCapitalize="words"
              />
              {editErrors.lastName && (
                <Text style={styles.fieldError}>{editErrors.lastName}</Text>
              )}
            </View>

            {/* Email (solo lectura) */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email</Text>
              <View style={styles.fieldInputReadonly}>
                <Ionicons name="lock-closed-outline" size={16} color="#9ca3af" />
                <Text style={styles.fieldReadonlyText}>{user?.email || ''}</Text>
              </View>
              <Text style={styles.fieldHint}>El email no puede modificarse</Text>
            </View>

            {/* Botones */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditModalVisible(false)}
                disabled={savingProfile}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, savingProfile && { opacity: 0.7 }]}
                onPress={handleSaveProfile}
                disabled={savingProfile}
              >
                {savingProfile ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.saveBtnText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f8',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  // Tarjeta de perfil
  profileCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 2,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 10,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 20,
    gap: 6,
  },
  roleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  // Botón editar perfil
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: PRIMARY,
    backgroundColor: '#eff6ff',
  },
  editProfileText: {
    fontSize: 14,
    color: PRIMARY,
    fontWeight: '600',
  },
  // Menús
  menuSection: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  menuSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingLeft: 4,
  },
  menuCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabelWrapper: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1f2937',
  },
  menuSublabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 1,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginLeft: 66,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#d1d5db',
    marginTop: 24,
    marginBottom: 8,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingTop: 16,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1f2937',
    backgroundColor: '#ffffff',
  },
  fieldInputError: {
    borderColor: '#ef4444',
  },
  fieldError: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  fieldInputReadonly: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f9fafb',
  },
  fieldReadonlyText: {
    fontSize: 15,
    color: '#9ca3af',
    flex: 1,
  },
  fieldHint: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '700',
  },
});
