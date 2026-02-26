'use client';

import { useState, useRef } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { IMAGES } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import apiClient from '@/lib/api-client';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { toasts, toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', newPass: '', confirm: '' });
  const [savingPassword, setSavingPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: user ? `${user.firstName} ${user.lastName}`.trim() : 'Juan Pérez',
    email: user?.email || 'juan@example.com',
    phone: '+34 612 345 678',
    address: 'Calle Principal 123',
    city: 'Madrid',
    country: 'España',
    zipCode: '28001',
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size (max 2MB)
    if (!file.type.startsWith('image/')) {
      toast({ message: 'Please select a valid image file', type: 'error' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ message: 'Image must be smaller than 2MB', type: 'error' });
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to backend
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await apiClient.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const avatarUrl = res.data?.avatarUrl || res.data?.url;
      if (avatarUrl) {
        setAvatarPreview(avatarUrl);
        updateUser({ avatarUrl } as Parameters<typeof updateUser>[0]);
      }
      toast({ message: 'Profile photo updated successfully', type: 'success' });
    } catch {
      toast({ message: 'Failed to upload photo. Preview saved locally.', type: 'error' });
    } finally {
      setUploadingAvatar(false);
      // Reset file input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.current || !passwordData.newPass || !passwordData.confirm) {
      toast({ message: 'All password fields are required', type: 'error' });
      return;
    }
    if (passwordData.newPass !== passwordData.confirm) {
      toast({ message: 'New passwords do not match', type: 'error' });
      return;
    }
    if (passwordData.newPass.length < 8) {
      toast({ message: 'New password must be at least 8 characters', type: 'error' });
      return;
    }
    setSavingPassword(true);
    try {
      await apiClient.put('/users/password', {
        currentPassword: passwordData.current,
        newPassword: passwordData.newPass,
      });
      toast({ message: 'Password changed successfully', type: 'success' });
      setShowPasswordForm(false);
      setPasswordData({ current: '', newPass: '', confirm: '' });
    } catch {
      toast({ message: 'Failed to change password. Check your current password.', type: 'error' });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const parts = formData.name.trim().split(' ');
      const firstName = parts[0] || '';
      const lastName = parts.slice(1).join(' ');

      await apiClient.put('/users/profile', {
        firstName,
        lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        zipCode: formData.zipCode,
      });

      updateUser({ firstName, lastName, email: formData.email });
      toast({ message: 'Profile updated successfully', type: 'success' });
      setIsEditing(false);
    } catch {
      toast({ message: 'Error updating profile. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="spacing-section">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-primary">My Profile</h1>
        <p className="text-primary/60 text-sm mt-1">Manage your personal information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar + Stats */}
        <div className="spacing-section">
          {/* Avatar Card */}
          <div className="bg-white rounded-xl border border-primary/10 p-6">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <div className="relative mb-4 w-fit mx-auto">
              <img
                src={avatarPreview || IMAGES.userAvatar}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-primary/10"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 size-8 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary/90 transition-colors disabled:opacity-60"
                title="Change profile photo"
              >
                {uploadingAvatar
                  ? <MaterialIcon name="sync" className="text-sm animate-spin" />
                  : <MaterialIcon name="photo_camera" className="text-sm" />
                }
              </button>
            </div>
            <div className="text-center mb-4">
              <h2 className="text-lg font-extrabold text-primary">{formData.name}</h2>
              <p className="text-sm text-primary/60">{formData.email}</p>
              <span className="inline-block mt-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Premium Member
              </span>
            </div>

            {/* Account Security Progress */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-primary">Account Security</span>
                <span className="text-xs font-bold text-green-600">75%</span>
              </div>
              <div className="w-full bg-primary/10 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-3 pt-4 border-t border-primary/10">
              <div className="flex items-center gap-3">
                <div className="size-9 bg-primary/10 rounded-lg flex items-center justify-center">
                  <MaterialIcon name="shopping_bag" className="text-primary text-base" />
                </div>
                <div>
                  <p className="text-xs text-primary/40 font-medium">Total Purchases</p>
                  <p className="font-extrabold text-primary text-sm">$2,450.00</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-9 bg-primary/10 rounded-lg flex items-center justify-center">
                  <MaterialIcon name="grade" className="text-primary text-base" />
                </div>
                <div>
                  <p className="text-xs text-primary/40 font-medium">Membership</p>
                  <p className="font-extrabold text-primary text-sm">Premium</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-9 bg-primary/10 rounded-lg flex items-center justify-center">
                  <MaterialIcon name="card_giftcard" className="text-primary text-base" />
                </div>
                <div>
                  <p className="text-xs text-primary/40 font-medium">Points Available</p>
                  <p className="font-extrabold text-primary text-sm">2,450 pts</p>
                </div>
              </div>
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full mt-4 border-2 border-primary text-primary font-bold py-2 rounded-lg hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <MaterialIcon name="edit" className="text-base" />
                Edit Profile
              </button>
            )}
          </div>

          {/* Loyalty Tier Card */}
          <div className="bg-primary rounded-xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full translate-x-8 -translate-y-4"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -translate-x-6 translate-y-4"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <MaterialIcon name="workspace_premium" className="text-yellow-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-white/70">Platinum Elite</span>
              </div>
              <p className="text-2xl font-extrabold mb-1">Loyalty Tier</p>
              <p className="text-sm text-white/70 mb-4">You&apos;re in the top 5% of shoppers!</p>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-white/60">Next tier: Diamond</p>
                <div className="w-full bg-white/20 rounded-full h-1.5 mt-2">
                  <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <p className="text-xs text-white/60 mt-1">550 pts to Diamond</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Info / Edit Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Personal Info Card */}
          <div className="bg-white rounded-xl border border-primary/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-extrabold text-primary">
                {isEditing ? 'Edit Information' : 'Personal Information'}
              </h3>
              {isEditing && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-sm text-primary/60 hover:text-primary font-semibold"
                >
                  Cancel
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-primary mb-2">First Name</label>
                    <input
                      type="text"
                      value={formData.name.split(' ')[0] || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, name: `${e.target.value} ${formData.name.split(' ')[1] || ''}`.trim() })
                      }
                      className="w-full h-11 px-4 border border-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-primary mb-2">Last Name</label>
                    <input
                      type="text"
                      value={formData.name.split(' ')[1] || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, name: `${formData.name.split(' ')[0] || ''} ${e.target.value}`.trim() })
                      }
                      className="w-full h-11 px-4 border border-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-primary mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-11 px-4 border border-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-primary mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-11 px-4 border border-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-primary mb-2">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full h-11 px-4 border border-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-primary mb-2">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full h-11 px-4 border border-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-primary mb-2">Country</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full h-11 px-4 border border-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-primary mb-2">ZIP Code</label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      className="w-full h-11 px-4 border border-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 py-2.5 border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary/5 transition-colors text-sm"
                  >
                    Discard Changes
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 px-4 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving && <MaterialIcon name="hourglass_bottom" className="text-base animate-spin" />}
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { label: 'Full Name', value: formData.name },
                  { label: 'Email', value: formData.email },
                  { label: 'Phone', value: formData.phone },
                  { label: 'Address', value: formData.address },
                  { label: 'City', value: formData.city },
                  { label: 'Country', value: formData.country },
                  { label: 'ZIP Code', value: formData.zipCode },
                ].map((field) => (
                  <div key={field.label}>
                    <p className="text-xs text-primary/40 font-medium uppercase tracking-wider mb-1">
                      {field.label}
                    </p>
                    <p className="font-bold text-primary text-sm">{field.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Security & Preferences */}
          <div className="bg-white rounded-xl border border-primary/10 p-6">
            <h3 className="text-lg font-extrabold text-primary mb-6">Security & Preferences</h3>

            <div className="space-y-4">
              {/* Change Password */}
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <MaterialIcon name="lock" className="text-primary text-base" />
                    </div>
                    <div>
                      <p className="font-bold text-primary text-sm">Password</p>
                      <p className="text-xs text-primary/40">Keep your account secure</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setShowPasswordForm(!showPasswordForm); setPasswordData({ current: '', newPass: '', confirm: '' }); }}
                    className="text-sm font-bold text-primary border border-primary rounded-lg px-4 py-2 hover:bg-primary hover:text-white transition-colors"
                  >
                    {showPasswordForm ? 'Cancel' : 'Update Password'}
                  </button>
                </div>

                {showPasswordForm && (
                  <div className="space-y-3 pt-3 border-t border-primary/10">
                    <div>
                      <label className="block text-xs font-bold text-primary mb-1.5">Current Password</label>
                      <input
                        type="password"
                        value={passwordData.current}
                        onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                        className="w-full h-10 px-3 border border-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-primary mb-1.5">New Password</label>
                      <input
                        type="password"
                        value={passwordData.newPass}
                        onChange={(e) => setPasswordData({ ...passwordData, newPass: e.target.value })}
                        className="w-full h-10 px-3 border border-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                        placeholder="Min 8 characters"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-primary mb-1.5">Confirm New Password</label>
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
                        placeholder="Repeat new password"
                      />
                      {passwordData.confirm && passwordData.newPass !== passwordData.confirm && (
                        <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                      )}
                    </div>
                    <button
                      onClick={handleChangePassword}
                      disabled={savingPassword}
                      className="w-full py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {savingPassword && <MaterialIcon name="sync" className="text-base animate-spin" />}
                      {savingPassword ? 'Saving...' : 'Save New Password'}
                    </button>
                  </div>
                )}
              </div>

              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/10">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MaterialIcon name="shield" className="text-primary text-base" />
                  </div>
                  <div>
                    <p className="font-bold text-primary text-sm">Two-Factor Authentication</p>
                    <p className="text-xs text-primary/40">
                      {twoFactor ? 'Enabled — Your account is more secure' : 'Disabled — Enable for extra security'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setTwoFactor(!twoFactor)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    twoFactor ? 'bg-primary' : 'bg-primary/20'
                  }`}
                >
                  <span
                    className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                      twoFactor ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

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
