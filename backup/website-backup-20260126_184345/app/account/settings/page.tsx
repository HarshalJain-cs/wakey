'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Bell,
  Shield,
  Download,
  Trash2,
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle,
  Moon,
  Volume2,
  Globe,
} from 'lucide-react';
import Link from 'next/link';

interface UserSettings {
  displayName: string;
  email: string;
  notifications: {
    email: boolean;
    push: boolean;
    weeklyReport: boolean;
  };
  preferences: {
    darkMode: boolean;
    soundEnabled: boolean;
    timezone: string;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings>({
    displayName: '',
    email: '',
    notifications: {
      email: true,
      push: true,
      weeklyReport: true,
    },
    preferences: {
      darkMode: true,
      soundEnabled: true,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  const supabase = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return createClient();
  }, []);

  useEffect(() => {
    async function fetchSettings() {
      if (!supabase) return;
      setLoading(true);

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        router.push('/login');
        return;
      }

      // Get user profile
      setSettings((prev) => ({
        ...prev,
        email: session.user.email || '',
        displayName: session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || '',
      }));

      // Fetch user settings from API
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setSettings((prev) => ({
              ...prev,
              ...data.settings,
            }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }

      setLoading(false);
    }

    fetchSettings();
  }, [router, supabase]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        throw new Error('Failed to save settings');
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/export');
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wakey-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch('/api/account', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete account');

      await supabase?.auth.signOut();
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
          <p className="text-dark-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Link
            href="/account"
            className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Account Settings</h1>
            <p className="text-dark-400 text-sm">Manage your account preferences</p>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            {error}
          </div>
        )}

        {/* Success Message */}
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Settings saved successfully
          </motion.div>
        )}

        <div className="space-y-6">
          {/* Profile Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-teal-500/20 to-purple-500/20 rounded-xl">
                <User className="w-5 h-5 text-teal-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Profile</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-dark-400 mb-2">Display Name</label>
                <input
                  type="text"
                  value={settings.displayName}
                  onChange={(e) => setSettings({ ...settings, displayName: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-2">Email</label>
                <div className="flex items-center gap-3 px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-dark-400">
                  <Mail className="w-4 h-4" />
                  <span>{settings.email}</span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Notifications Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-teal-500/20 to-purple-500/20 rounded-xl">
                <Bell className="w-5 h-5 text-teal-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Notifications</h2>
            </div>

            <div className="space-y-4">
              {[
                { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
                { key: 'push', label: 'Push Notifications', desc: 'Browser push notifications' },
                { key: 'weeklyReport', label: 'Weekly Reports', desc: 'Get weekly productivity summary' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="text-white">{item.label}</p>
                    <p className="text-xs text-dark-500">{item.desc}</p>
                  </div>
                  <button
                    onClick={() =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          [item.key]: !settings.notifications[item.key as keyof typeof settings.notifications],
                        },
                      })
                    }
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.notifications[item.key as keyof typeof settings.notifications]
                        ? 'bg-teal-500'
                        : 'bg-dark-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                        settings.notifications[item.key as keyof typeof settings.notifications]
                          ? 'translate-x-6'
                          : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Preferences Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-teal-500/20 to-purple-500/20 rounded-xl">
                <Moon className="w-5 h-5 text-teal-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Preferences</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon className="w-4 h-4 text-dark-400" />
                  <div>
                    <p className="text-white">Dark Mode</p>
                    <p className="text-xs text-dark-500">Use dark theme</p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setSettings({
                      ...settings,
                      preferences: { ...settings.preferences, darkMode: !settings.preferences.darkMode },
                    })
                  }
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.preferences.darkMode ? 'bg-teal-500' : 'bg-dark-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                      settings.preferences.darkMode ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-4 h-4 text-dark-400" />
                  <div>
                    <p className="text-white">Sound Effects</p>
                    <p className="text-xs text-dark-500">Enable UI sounds</p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setSettings({
                      ...settings,
                      preferences: { ...settings.preferences, soundEnabled: !settings.preferences.soundEnabled },
                    })
                  }
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.preferences.soundEnabled ? 'bg-teal-500' : 'bg-dark-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                      settings.preferences.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="w-4 h-4 text-dark-400" />
                  <p className="text-white">Timezone</p>
                </div>
                <select
                  value={settings.preferences.timezone}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      preferences: { ...settings.preferences, timezone: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-teal-500 transition-colors"
                >
                  {Intl.supportedValuesOf('timeZone').slice(0, 50).map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.section>

          {/* Data & Privacy Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-teal-500/20 to-purple-500/20 rounded-xl">
                <Shield className="w-5 h-5 text-teal-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Data & Privacy</h2>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleExportData}
                disabled={exporting}
                className="w-full flex items-center justify-between p-4 bg-dark-900/50 hover:bg-dark-700/50 border border-dark-700 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-teal-400" />
                  <div className="text-left">
                    <p className="text-white">Export Data</p>
                    <p className="text-xs text-dark-500">Download all your data as JSON</p>
                  </div>
                </div>
                {exporting && <Loader2 className="w-5 h-5 text-teal-400 animate-spin" />}
              </button>

              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="w-full flex items-center justify-between p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5 text-red-400" />
                  <div className="text-left">
                    <p className="text-red-400">Delete Account</p>
                    <p className="text-xs text-red-400/60">Permanently delete your account and data</p>
                  </div>
                </div>
                {deleting && <Loader2 className="w-5 h-5 text-red-400 animate-spin" />}
              </button>
            </div>
          </motion.section>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-teal-500 to-purple-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
