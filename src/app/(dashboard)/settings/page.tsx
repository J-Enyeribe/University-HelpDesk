'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User } from '@/types/user';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';
import { UserIcon, LockClosedIcon, BellIcon, PaintBrushIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'appearance'>('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const user = session?.user as User;

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    registrationNo: user?.registrationNo || '',
    department: user?.department || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        await update({ ...user, ...updatedUser });
        setSuccess('Profile updated successfully');
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to update profile');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 12) {
      setError('Password must be at least 12 characters');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordForm),
      });

      if (response.ok) {
        setSuccess('Password changed successfully');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to change password');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-navy">Settings</h1>
        <p className="text-text-muted mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-border">
          <nav className="flex gap-1 p-1" aria-label="Settings tabs">
            {[
              { id: 'profile', label: 'Profile', icon: UserIcon },
              { id: 'security', label: 'Security', icon: LockClosedIcon },
              { id: 'notifications', label: 'Notifications', icon: BellIcon },
              { id: 'appearance', label: 'Appearance', icon: PaintBrushIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'bg-navy/10 text-navy'
                    : 'text-text-muted hover:text-text hover:bg-surface-muted'
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 rounded-lg bg-error/10 border border-error/20 text-error" role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 rounded-lg bg-success/10 border border-success/20 text-success" role="alert">
              {success}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate} className="space-y-5">
              <div className="flex items-center gap-6">
                <Avatar src={user?.avatarUrl} name={user?.name} size="xl" />
                <div>
                  <p className="text-sm text-text-muted">Profile Picture</p>
                  <Button variant="secondary" type="button">Change Photo</Button>
                </div>
              </div>

              <Input
                label="Full Name"
                value={profileForm.name}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
              <Input
                label="Email"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
              <Input
                label="Registration Number"
                value={profileForm.registrationNo}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, registrationNo: e.target.value }))}
              />
              <Input
                label="Department"
                value={profileForm.department}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, department: e.target.value }))}
              />

              <div className="flex justify-end pt-4 border-t border-border">
                <Button type="submit" loading={loading}>
                  Save Changes
                </Button>
              </div>
            </form>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div className="p-4 bg-surface-muted rounded-lg">
                <h3 className="font-semibold text-navy mb-2">Change Password</h3>
                <p className="text-sm text-text-muted">Your password must be at least 12 characters long.</p>
              </div>

              <Input
                label="Current Password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                required
              />
              <Input
                label="New Password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                hint="At least 12 characters"
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                required
              />

              <div className="flex justify-end pt-4 border-t border-border">
                <Button type="submit" loading={loading}>
                  Change Password
                </Button>
              </div>
            </form>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="p-4 bg-surface-muted rounded-lg">
                <h3 className="font-semibold text-navy mb-2">Email Notifications</h3>
                <p className="text-sm text-text-muted">Configure when you receive email notifications.</p>
              </div>

              {[
                { id: 'ticket_created', label: 'Ticket Created', description: 'When you submit a new ticket' },
                { id: 'ticket_assigned', label: 'Ticket Assigned', description: 'When a technician is assigned to your ticket' },
                { id: 'ticket_status_changed', label: 'Status Changed', description: 'When your ticket status changes' },
                { id: 'ticket_comment', label: 'New Comment', description: 'When someone comments on your ticket' },
                { id: 'ticket_reopened', label: 'Ticket Reopened', description: 'When a ticket is reopened' },
              ].map((notification) => (
                <label key={notification.id} className="flex items-center justify-between p-4 bg-surface-muted rounded-lg">
                  <div>
                    <p className="font-medium text-text">{notification.label}</p>
                    <p className="text-sm text-text-muted">{notification.description}</p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-border text-navy focus:ring-navy"
                    defaultChecked
                  />
                </label>
              ))}
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-navy mb-4">Theme</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: 'light', label: 'Light', icon: SunIcon, description: 'Always use light mode' },
                    { id: 'dark', label: 'Dark', icon: MoonIcon, description: 'Always use dark mode' },
                    { id: 'system', label: 'System', icon: PaintBrushIcon, description: 'Match system preference' },
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      className={cn(
                        'p-4 rounded-xl border-2 transition-all',
                        'border-border hover:border-navy/50'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <theme.icon className="h-6 w-6 text-navy" />
                        <div>
                          <p className="font-medium text-text">{theme.label}</p>
                          <p className="text-sm text-text-muted">{theme.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-navy mb-4">Density</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {['Comfortable', 'Compact', 'Condensed'].map((density) => (
                    <button
                      key={density}
                      className={cn(
                        'p-4 rounded-xl border-2 transition-all',
                        'border-border hover:border-navy/50'
                      )}
                    >
                      <p className="font-medium text-text">{density}</p>
                      <p className="text-sm text-text-muted">Adjust spacing and sizing</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}