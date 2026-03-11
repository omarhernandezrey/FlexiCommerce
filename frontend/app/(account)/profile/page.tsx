'use client';

import { useState, useEffect, useCallback } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { formatCOP } from '@/lib/format';
import apiClient from '@/lib/api-client';
import Link from 'next/link';
import { AvatarCropModal } from '@/components/ui/AvatarCropModal';

interface UserStats {
  totalOrders: number;
  deliveredOrders: number;
  totalSpent: number;
  reviewCount: number;
  points: number;
  loyaltyLevel: string;
  loyaltyNext: string | null;
  loyaltyProgress: number;
  loyaltyNextThreshold: number;
}

const LOYALTY_COLORS: Record<string, { bg: string; text: string; badge: string }> = {
  Bronce:  { bg: 'bg-amber-700',   text: 'text-amber-700',  badge: 'bg-amber-100 text-amber-800' },
  Plata:   { bg: 'bg-slate-500',   text: 'text-slate-500',  badge: 'bg-slate-100 text-slate-700' },
  Oro:     { bg: 'bg-yellow-500',  text: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-800' },
  Platino: { bg: 'bg-indigo-600',  text: 'text-indigo-600', badge: 'bg-indigo-100 text-indigo-800' },
  Diamante:{ bg: 'bg-cyan-500',    text: 'text-cyan-600',   badge: 'bg-cyan-100 text-cyan-800' },
};

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { toasts, toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', newPass: '', confirm: '' });
  const [savingPassword, setSavingPassword] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
  });

  // Cargar perfil completo (incluye phone) y estadísticas
  const loadProfileData = useCallback(async () => {
    try {
      const [profileRes, statsRes] = await Promise.all([
        apiClient.get('/api/users/me'),
        apiClient.get('/api/users/me/stats'),
      ]);

      const profileData = profileRes.data?.data ?? profileRes.data;
      setFormData({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
      });
      // Sincronizar avatar desde DB al store (por si el store quedó desactualizado)
      if (profileData.avatar !== undefined) {
        updateUser({ avatar: profileData.avatar });
      }

      const statsData = statsRes.data?.data ?? statsRes.data;
      setStats(statsData);
    } catch {
      // Si falla, usar datos del store
      setFormData({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: '',
      });
    } finally {
      setLoadingStats(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const handleAvatarSave = async (croppedDataUrl: string) => {
    try {
      await apiClient.post('/api/users/me/avatar', { avatar: croppedDataUrl });
      updateUser({ avatar: croppedDataUrl });
      toast({ message: 'Foto de perfil actualizada correctamente', type: 'success' });
      setShowCropModal(false);
    } catch {
      toast({ message: 'Error al guardar la foto. Inténtalo de nuevo.', type: 'error' });
      throw new Error('upload failed');
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.current || !passwordData.newPass || !passwordData.confirm) {
      toast({ message: 'Todos los campos de contraseña son obligatorios', type: 'error' });
      return;
    }
    if (passwordData.newPass !== passwordData.confirm) {
      toast({ message: 'Las contraseñas nuevas no coinciden', type: 'error' });
      return;
    }
    if (passwordData.newPass.length < 8) {
      toast({ message: 'La contraseña nueva debe tener al menos 8 caracteres', type: 'error' });
      return;
    }
    setSavingPassword(true);
    try {
      await apiClient.put('/api/users/me/password', {
        currentPassword: passwordData.current,
        newPassword: passwordData.newPass,
      });
      toast({ message: 'Contraseña cambiada exitosamente', type: 'success' });
      setShowPasswordForm(false);
      setPasswordData({ current: '', newPass: '', confirm: '' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast({ message: msg || 'Error al cambiar la contraseña. Verifica tu contraseña actual.', type: 'error' });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSave = async () => {
    if (!formData.firstName.trim()) {
      toast({ message: 'El nombre es obligatorio', type: 'error' });
      return;
    }
    setSaving(true);
    try {
      await apiClient.put('/api/users/me', {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      });
      updateUser({ firstName: formData.firstName.trim(), lastName: formData.lastName.trim(), email: formData.email.trim() });
      toast({ message: 'Perfil actualizado exitosamente', type: 'success' });
      setIsEditing(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast({ message: msg || 'Error al actualizar el perfil. Por favor intenta de nuevo.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const loyaltyColors = LOYALTY_COLORS[stats?.loyaltyLevel || 'Bronce'] || LOYALTY_COLORS.Bronce;

  // Security score: based on profile completeness
  const securityScore = (() => {
    let score = 0;
    if (formData.email) score += 30;
    if (formData.firstName) score += 20;
    if (formData.lastName) score += 20;
    if (formData.phone) score += 30;
    return score;
  })();

  const securityColor = securityScore >= 80 ? 'bg-green-500' : securityScore >= 50 ? 'bg-yellow-400' : 'bg-red-400';
  const securityLabel = securityScore >= 80 ? 'Alta' : securityScore >= 50 ? 'Media' : 'Baja';

  const fullName = `${formData.firstName} ${formData.lastName}`.trim() || 'Usuario';
  const roleBadge = user?.role === 'ADMIN' ? 'Administrador' : stats?.loyaltyLevel ? stats.loyaltyLevel : 'Cliente';

  return (
    <div className="spacing-section">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-extrabold text-primary">Mi Perfil</h1>
        <p className="text-primary/60 text-sm mt-1">Administra tu información personal y preferencias de seguridad</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda */}
        <div className="space-y-4">
          {/* Tarjeta de Avatar */}
          <div className="bg-white rounded-xl border border-primary/10 p-6">
            <div className="relative mb-4 w-fit mx-auto">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-4 border-primary/10"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary/10 border-4 border-primary/10 flex items-center justify-center">
                  <span className="text-3xl font-extrabold text-primary">
                    {fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <button
                onClick={() => setShowCropModal(true)}
                className="absolute bottom-0 right-0 size-8 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary/90 transition-colors shadow-md"
                title="Cambiar foto de perfil"
              >
                <MaterialIcon name="photo_camera" className="text-sm" />
              </button>
            </div>

            <div className="text-center mb-4">
              <h2 className="text-lg font-extrabold text-primary">{fullName}</h2>
              <p className="text-sm text-primary/60">{formData.email}</p>
              <span className={`inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${loyaltyColors.badge}`}>
                {roleBadge}
              </span>
            </div>

            {/* Seguridad */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-primary">Seguridad de la Cuenta</span>
                <span className={`text-xs font-bold ${securityScore >= 80 ? 'text-green-600' : securityScore >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                  {securityLabel} ({securityScore}%)
                </span>
              </div>
              <div className="w-full bg-primary/10 rounded-full h-2">
                <div className={`${securityColor} h-2 rounded-full transition-all`} style={{ width: `${securityScore}%` }} />
              </div>
              {securityScore < 100 && (
                <p className="text-[10px] text-primary/40 mt-1">
                  {!formData.phone ? 'Agrega tu teléfono para mejorar la seguridad' :
                   !formData.lastName ? 'Completa tu apellido para mejorar la seguridad' : ''}
                </p>
              )}
            </div>

            {/* Estadísticas */}
            <div className="space-y-3 pt-4 border-t border-primary/10">
              {loadingStats ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="size-9 bg-primary/10 rounded-lg" />
                      <div className="space-y-1 flex-1">
                        <div className="h-2 bg-primary/10 rounded w-24" />
                        <div className="h-3 bg-primary/10 rounded w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="size-9 bg-primary/10 rounded-lg flex items-center justify-center">
                      <MaterialIcon name="shopping_bag" className="text-primary text-base" />
                    </div>
                    <div>
                      <p className="text-xs text-primary/40 font-medium">Total Gastado</p>
                      <p className="font-extrabold text-primary text-sm">{formatCOP(stats?.totalSpent ?? 0)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="size-9 bg-primary/10 rounded-lg flex items-center justify-center">
                      <MaterialIcon name="receipt_long" className="text-primary text-base" />
                    </div>
                    <div>
                      <p className="text-xs text-primary/40 font-medium">Pedidos Realizados</p>
                      <p className="font-extrabold text-primary text-sm">{stats?.totalOrders ?? 0} pedidos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="size-9 bg-primary/10 rounded-lg flex items-center justify-center">
                      <MaterialIcon name="card_giftcard" className="text-primary text-base" />
                    </div>
                    <div>
                      <p className="text-xs text-primary/40 font-medium">Puntos Disponibles</p>
                      <p className="font-extrabold text-primary text-sm">{(stats?.points ?? 0).toLocaleString('es-CO')} pts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="size-9 bg-primary/10 rounded-lg flex items-center justify-center">
                      <MaterialIcon name="star" className="text-primary text-base" />
                    </div>
                    <div>
                      <p className="text-xs text-primary/40 font-medium">Reseñas Escritas</p>
                      <p className="font-extrabold text-primary text-sm">{stats?.reviewCount ?? 0} reseñas</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full mt-4 border-2 border-primary text-primary font-bold py-2 rounded-lg hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <MaterialIcon name="edit" className="text-base" />
                Editar Perfil
              </button>
            )}
          </div>

          {/* Tarjeta de Nivel de Lealtad */}
          {!loadingStats && (
            <div className={`${loyaltyColors.bg} rounded-xl p-6 text-white relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full translate-x-8 -translate-y-4" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -translate-x-6 translate-y-4" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <MaterialIcon name="workspace_premium" className="text-yellow-300" />
                  <span className="text-xs font-bold uppercase tracking-widest text-white/70">Nivel de Lealtad</span>
                </div>
                <p className="text-2xl font-extrabold mb-1">{stats?.loyaltyLevel ?? 'Bronce'}</p>
                {stats?.loyaltyNext ? (
                  <>
                    <p className="text-sm text-white/70 mb-4">
                      {formatCOP((stats.loyaltyNextThreshold - stats.totalSpent))} para {stats.loyaltyNext}
                    </p>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-xs text-white/60">Progreso hacia {stats.loyaltyNext}</p>
                      <div className="w-full bg-white/20 rounded-full h-1.5 mt-2">
                        <div className="bg-yellow-300 h-1.5 rounded-full" style={{ width: `${stats.loyaltyProgress}%` }} />
                      </div>
                      <p className="text-xs text-white/60 mt-1">{stats.loyaltyProgress}% completado</p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-white/70">¡Nivel máximo alcanzado! Eres nuestro cliente élite.</p>
                )}
              </div>
            </div>
          )}

          {/* Accesos Rápidos */}
          <div className="bg-white rounded-xl border border-primary/10 p-4">
            <p className="text-xs font-bold text-primary/40 uppercase tracking-wider mb-3">Accesos Rápidos</p>
            <div className="space-y-1">
              {[
                { href: '/orders', icon: 'receipt_long', label: 'Mis Pedidos', count: stats?.totalOrders },
                { href: '/addresses', icon: 'location_on', label: 'Mis Direcciones' },
                { href: '/wishlist', icon: 'favorite', label: 'Lista de Deseos' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-primary/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <MaterialIcon name={item.icon} className="text-primary/50 text-base group-hover:text-primary transition-colors" />
                    <span className="text-sm font-semibold text-primary">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.count !== undefined && (
                      <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{item.count}</span>
                    )}
                    <MaterialIcon name="chevron_right" className="text-primary/30 text-base" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="lg:col-span-2 space-y-4">
          {/* Información Personal */}
          <div className="bg-white rounded-xl border border-primary/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-extrabold text-primary">
                {isEditing ? 'Editar Información Personal' : 'Información Personal'}
              </h3>
              {isEditing && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-sm text-primary/60 hover:text-primary font-semibold"
                >
                  Cancelar
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-primary mb-2">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full h-11 px-4 border border-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-primary mb-2">Apellido</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full h-11 px-4 border border-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                      placeholder="Tu apellido"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-primary mb-2">
                    Correo Electrónico <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-11 px-4 border border-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-primary mb-2">
                    Teléfono
                    <span className="ml-2 text-xs font-normal text-primary/40">(Mejora la seguridad de tu cuenta)</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-11 px-4 border border-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    placeholder="+57 300 000 0000"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 py-2.5 border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary/5 transition-colors text-sm"
                  >
                    Descartar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 px-4 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {saving && <MaterialIcon name="sync" className="text-base animate-spin" />}
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { label: 'Nombre', value: formData.firstName || '—', icon: 'person' },
                  { label: 'Apellido', value: formData.lastName || '—', icon: 'person_outline' },
                  { label: 'Correo Electrónico', value: formData.email || '—', icon: 'email' },
                  { label: 'Teléfono', value: formData.phone || '—', icon: 'phone' },
                  { label: 'Rol', value: user?.role === 'ADMIN' ? 'Administrador' : 'Cliente', icon: 'badge' },
                  { label: 'Miembro desde', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long' }) : '—', icon: 'calendar_month' },
                ].map((field) => (
                  <div key={field.label} className="flex items-start gap-3">
                    <div className="size-8 bg-primary/5 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <MaterialIcon name={field.icon} className="text-primary/50 text-sm" />
                    </div>
                    <div>
                      <p className="text-xs text-primary/40 font-medium uppercase tracking-wider mb-0.5">
                        {field.label}
                      </p>
                      <p className="font-bold text-primary text-sm">{field.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Seguridad y Contraseña */}
          <div className="bg-white rounded-xl border border-primary/10 p-6">
            <h3 className="text-lg font-extrabold text-primary mb-6">Seguridad de la Cuenta</h3>

            <div className="space-y-4">
              {/* Cambiar Contraseña */}
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <MaterialIcon name="lock" className="text-primary text-base" />
                    </div>
                    <div>
                      <p className="font-bold text-primary text-sm">Contraseña</p>
                      <p className="text-xs text-primary/40">Cambia tu contraseña de acceso</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowPasswordForm(!showPasswordForm);
                      setPasswordData({ current: '', newPass: '', confirm: '' });
                    }}
                    className="text-sm font-bold text-primary border border-primary rounded-lg px-4 py-2 hover:bg-primary hover:text-white transition-colors"
                  >
                    {showPasswordForm ? 'Cancelar' : 'Cambiar'}
                  </button>
                </div>

                {showPasswordForm && (
                  <div className="space-y-3 pt-3 border-t border-primary/10">
                    <div>
                      <label className="block text-xs font-bold text-primary mb-1.5">Contraseña Actual</label>
                      <input
                        type="password"
                        value={passwordData.current}
                        onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                        className="w-full h-10 px-3 border border-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                        placeholder="Ingresa tu contraseña actual"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-primary mb-1.5">Nueva Contraseña</label>
                      <input
                        type="password"
                        value={passwordData.newPass}
                        onChange={(e) => setPasswordData({ ...passwordData, newPass: e.target.value })}
                        className="w-full h-10 px-3 border border-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                        placeholder="Mínimo 8 caracteres"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-primary mb-1.5">Confirmar Nueva Contraseña</label>
                      <input
                        type="password"
                        value={passwordData.confirm}
                        onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleChangePassword()}
                        className={`w-full h-10 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm ${
                          passwordData.confirm && passwordData.newPass !== passwordData.confirm
                            ? 'border-red-300 bg-red-50'
                            : 'border-primary/10'
                        }`}
                        placeholder="Repite la nueva contraseña"
                      />
                      {passwordData.confirm && passwordData.newPass !== passwordData.confirm && (
                        <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
                      )}
                    </div>
                    <button
                      onClick={handleChangePassword}
                      disabled={savingPassword}
                      className="w-full py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {savingPassword && <MaterialIcon name="sync" className="text-base animate-spin" />}
                      {savingPassword ? 'Guardando...' : 'Guardar Nueva Contraseña'}
                    </button>
                  </div>
                )}
              </div>

              {/* Sesiones activas - informativo */}
              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/10">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MaterialIcon name="devices" className="text-primary text-base" />
                  </div>
                  <div>
                    <p className="font-bold text-primary text-sm">Sesión Activa</p>
                    <p className="text-xs text-primary/40">Este dispositivo está autenticado</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                  <span className="size-2 bg-green-500 rounded-full" />
                  Activa
                </span>
              </div>

              {/* Zona de Peligro */}
              <div className="p-4 rounded-xl border border-red-100 bg-red-50">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <MaterialIcon name="warning" className="text-red-500 text-base" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-red-700 text-sm">Zona de Peligro</p>
                    <p className="text-xs text-red-500">Las acciones aquí son irreversibles</p>
                  </div>
                  <button className="text-xs font-bold text-red-600 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-100 transition-colors">
                    Eliminar Cuenta
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Preferencias de Notificación */}
          <div className="bg-white rounded-xl border border-primary/10 p-6">
            <h3 className="text-lg font-extrabold text-primary mb-6">Preferencias de Notificación</h3>
            <div className="space-y-3">
              {[
                { label: 'Actualizaciones de pedidos', desc: 'Confirmaciones y cambios de estado', defaultOn: true },
                { label: 'Ofertas y promociones', desc: 'Descuentos exclusivos para ti', defaultOn: true },
                { label: 'Alertas de stock', desc: 'Cuando productos vuelvan a estar disponibles', defaultOn: false },
                { label: 'Boletín semanal', desc: 'Novedades y tendencias de la tienda', defaultOn: false },
              ].map((pref) => (
                <NotifToggle key={pref.label} {...pref} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de recorte de avatar */}
      {showCropModal && (
        <AvatarCropModal
          currentAvatar={user?.avatar}
          onClose={() => setShowCropModal(false)}
          onSave={handleAvatarSave}
        />
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2 pointer-events-auto ${
              t.type === 'success' ? 'bg-emerald-600 text-white' :
              t.type === 'error' ? 'bg-red-600 text-white' :
              'bg-primary text-white'
            }`}
          >
            <MaterialIcon
              name={t.type === 'success' ? 'check_circle' : t.type === 'error' ? 'error' : 'info'}
              className="text-base shrink-0"
            />
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente interno para toggle de notificación
function NotifToggle({ label, desc, defaultOn }: { label: string; desc: string; defaultOn: boolean }) {
  const [enabled, setEnabled] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-primary/5 transition-colors">
      <div>
        <p className="font-semibold text-primary text-sm">{label}</p>
        <p className="text-xs text-primary/40">{desc}</p>
      </div>
      <button
        onClick={() => setEnabled(!enabled)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${enabled ? 'bg-primary' : 'bg-primary/20'}`}
      >
        <span className={`inline-block size-4 transform rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}
