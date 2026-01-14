import { useState, useEffect } from 'react';
import {
    Moon, Sun, Bell, BellOff, Eye, EyeOff,
    Key, Save, Trash2, FolderOpen, Database,
    Keyboard, Info, Shield, Zap, AlertTriangle, Plus, X,
    Cloud, LogOut, User, Check
} from 'lucide-react';
import * as supabaseAuth from '../services/supabase-auth';

interface SettingsPageProps {
    darkMode: boolean;
    onDarkModeToggle: () => void;
}

interface Settings {
    autoStartTracking: boolean;
    startMinimized: boolean;
    darkMode: boolean;
    trackUrls: boolean;
    idleThreshold: number;
    groqApiKey?: string;
    notificationsEnabled: boolean;
    soundEnabled: boolean;
    dailyFocusGoal: number;
    customDistractions?: string[];
}

export default function SettingsPage({ darkMode, onDarkModeToggle }: SettingsPageProps) {
    const [settings, setSettings] = useState<Settings>({
        autoStartTracking: false,
        startMinimized: false,
        darkMode: true,
        trackUrls: true,
        idleThreshold: 5,
        notificationsEnabled: true,
        soundEnabled: true,
        dailyFocusGoal: 240,
        customDistractions: [],
    });
    const [apiKey, setApiKey] = useState('');
    const [showApiKey, setShowApiKey] = useState(false);
    const [saved, setSaved] = useState(false);
    const [newDistraction, setNewDistraction] = useState('');
    const [supabaseUrl, setSupabaseUrl] = useState('');
    const [supabaseKey, setSupabaseKey] = useState('');
    const [showSupabaseKey, setShowSupabaseKey] = useState(false);
    const [authUser, setAuthUser] = useState<{ email: string } | null>(null);
    const [requireAuth, setRequireAuth] = useState(true);

    useEffect(() => {
        loadSettings();

        // Subscribe to auth state changes
        const unsubscribe = supabaseAuth.subscribe((state) => {
            if (state.user) {
                setAuthUser({ email: state.user.email || '' });
            } else {
                setAuthUser(null);
            }
        });

        return () => unsubscribe();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await window.wakey.getSettings();
            const loadedSettings = data as unknown as Settings;
            setSettings(prev => ({ ...prev, ...loadedSettings }));
            if (loadedSettings.groqApiKey) {
                setApiKey(loadedSettings.groqApiKey || '');
            }
            // Load Supabase config
            setSupabaseUrl((data.supabaseUrl as string) || '');
            setSupabaseKey((data.supabaseAnonKey as string) || '');
            setRequireAuth(data.requireAuth !== false);
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    };

    const updateSetting = async (key: keyof Settings, value: unknown) => {
        try {
            await window.wakey.setSetting(key, value);
            setSettings(prev => ({ ...prev, [key]: value }));
            showSavedIndicator();
        } catch (error) {
            console.error('Failed to update setting:', error);
        }
    };

    const saveApiKey = async () => {
        await updateSetting('groqApiKey', apiKey);
    };

    const saveSupabaseConfig = async () => {
        try {
            await window.wakey.setSetting('supabaseUrl', supabaseUrl);
            await window.wakey.setSetting('supabaseAnonKey', supabaseKey);
            showSavedIndicator();
            // Reinitialize Supabase with new credentials
            if (supabaseUrl && supabaseKey) {
                await supabaseAuth.initSupabase();
            }
        } catch (error) {
            console.error('Failed to save Supabase config:', error);
        }
    };

    const toggleRequireAuth = async () => {
        const newValue = !requireAuth;
        setRequireAuth(newValue);
        await window.wakey.setSetting('requireAuth', newValue);
        showSavedIndicator();
    };

    const handleSignOut = async () => {
        const result = await supabaseAuth.signOut();
        if (result.success) {
            setAuthUser(null);
        }
    };

    const showSavedIndicator = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const addDistraction = async () => {
        if (!newDistraction.trim()) return;
        const updated = [...(settings.customDistractions || []), newDistraction.trim().toLowerCase()];
        await updateSetting('customDistractions', updated);
        setNewDistraction('');
    };

    const removeDistraction = async (app: string) => {
        const updated = (settings.customDistractions || []).filter(d => d !== app);
        await updateSetting('customDistractions', updated);
    };

    const SettingToggle = ({
        label,
        description,
        value,
        onChange,
        icon: Icon
    }: {
        label: string;
        description: string;
        value: boolean;
        onChange: (v: boolean) => void;
        icon: React.ElementType;
    }) => (
        <div className="flex items-center justify-between p-4 bg-dark-800 rounded-xl border border-dark-700">
            <div className="flex items-center gap-4">
                <div className="p-2 bg-dark-700 rounded-lg">
                    <Icon className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                    <div className="font-medium text-white">{label}</div>
                    <div className="text-sm text-dark-400">{description}</div>
                </div>
            </div>
            <button
                onClick={() => onChange(!value)}
                className={`w-12 h-6 rounded-full transition-all ${value ? 'bg-primary-500' : 'bg-dark-600'
                    }`}
            >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
            </button>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Settings</h1>
                    <p className="text-dark-400">Configure your Wakey experience</p>
                </div>

                {saved && (
                    <div className="flex items-center gap-2 text-green-400 bg-green-500/20 px-4 py-2 rounded-lg">
                        <Save className="w-4 h-4" />
                        Settings saved
                    </div>
                )}
            </div>

            {/* Account & Cloud */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-primary-400" />
                    Account & Cloud
                </h2>

                {/* User Profile */}
                {authUser ? (
                    <div className="p-4 bg-dark-800 rounded-xl border border-dark-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center">
                                    <User className="w-6 h-6 text-primary-400" />
                                </div>
                                <div>
                                    <div className="font-medium text-white">{authUser.email}</div>
                                    <div className="text-sm text-green-400 flex items-center gap-1">
                                        <Check className="w-3 h-3" />
                                        Signed in
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white rounded-lg transition-colors flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 bg-dark-800 rounded-xl border border-dark-700">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-dark-700 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-dark-500" />
                            </div>
                            <div>
                                <div className="font-medium text-dark-400">Not signed in</div>
                                <div className="text-sm text-dark-500">Configure Supabase below to enable cloud sync</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Require Auth Toggle */}
                <SettingToggle
                    icon={Shield}
                    label="Require Authentication"
                    description="Require sign-in to use the app (disable for offline use)"
                    value={requireAuth}
                    onChange={toggleRequireAuth}
                />

                {/* Supabase Configuration */}
                <div className="p-4 bg-dark-800 rounded-xl border border-dark-700 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Database className="w-5 h-5 text-primary-400" />
                        <span className="font-medium text-white">Supabase Configuration</span>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">
                            Project URL
                        </label>
                        <input
                            type="text"
                            value={supabaseUrl}
                            onChange={(e) => setSupabaseUrl(e.target.value)}
                            placeholder="https://your-project.supabase.co"
                            className="input-field w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">
                            Anon Key
                        </label>
                        <div className="relative">
                            <input
                                type={showSupabaseKey ? 'text' : 'password'}
                                value={supabaseKey}
                                onChange={(e) => setSupabaseKey(e.target.value)}
                                placeholder="eyJ..."
                                className="input-field w-full pr-10"
                            />
                            <button
                                onClick={() => setShowSupabaseKey(!showSupabaseKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white"
                            >
                                {showSupabaseKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={saveSupabaseConfig}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        Save Configuration
                    </button>

                    <p className="text-xs text-dark-500">
                        Get your Supabase credentials from{' '}
                        <a href="https://supabase.com" target="_blank" className="text-primary-400 hover:underline">
                            supabase.com
                        </a>
                        {' '}→ Project Settings → API
                    </p>
                </div>
            </div>

            {/* Appearance */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Sun className="w-5 h-5 text-primary-400" />
                    Appearance
                </h2>

                <SettingToggle
                    icon={darkMode ? Moon : Sun}
                    label="Dark Mode"
                    description="Use dark theme for the interface"
                    value={darkMode}
                    onChange={onDarkModeToggle}
                />
            </div>

            {/* Tracking */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary-400" />
                    Tracking
                </h2>

                <SettingToggle
                    icon={Zap}
                    label="Auto-start Tracking"
                    description="Start tracking when Wakey launches"
                    value={settings.autoStartTracking}
                    onChange={(v) => updateSetting('autoStartTracking', v)}
                />

                <SettingToggle
                    icon={Eye}
                    label="Track URLs"
                    description="Capture browser URLs for detailed insights"
                    value={settings.trackUrls}
                    onChange={(v) => updateSetting('trackUrls', v)}
                />

                <div className="p-4 bg-dark-800 rounded-xl border border-dark-700">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-2 bg-dark-700 rounded-lg">
                            <Database className="w-5 h-5 text-primary-400" />
                        </div>
                        <div>
                            <div className="font-medium text-white">Daily Focus Goal</div>
                            <div className="text-sm text-dark-400">Set your target focus time per day</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min="60"
                            max="480"
                            step="30"
                            value={settings.dailyFocusGoal}
                            onChange={(e) => updateSetting('dailyFocusGoal', parseInt(e.target.value))}
                            className="flex-1 accent-primary-500"
                        />
                        <span className="text-white font-medium w-20 text-right">
                            {Math.floor(settings.dailyFocusGoal / 60)}h {settings.dailyFocusGoal % 60}m
                        </span>
                    </div>
                </div>
            </div>

            {/* Distraction Management */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    Distraction Apps
                </h2>

                <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
                    <p className="text-dark-400 text-sm mb-4">
                        Add apps that you consider distracting. You'll be alerted when using these during focus time.
                    </p>

                    {/* Add new distraction */}
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={newDistraction}
                            onChange={(e) => setNewDistraction(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addDistraction()}
                            placeholder="Enter app name (e.g., youtube, twitter)"
                            className="flex-1 px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
                        />
                        <button
                            onClick={addDistraction}
                            disabled={!newDistraction.trim()}
                            className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add
                        </button>
                    </div>

                    {/* Distraction list */}
                    <div className="space-y-2">
                        {(settings.customDistractions || []).length === 0 ? (
                            <p className="text-dark-500 text-sm text-center py-4">
                                No custom distraction apps added yet
                            </p>
                        ) : (
                            (settings.customDistractions || []).map((app) => (
                                <div key={app} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                                    <span className="text-white">{app}</span>
                                    <button
                                        onClick={() => removeDistraction(app)}
                                        className="p-1 text-dark-400 hover:text-red-400 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Default distractions info */}
                    <div className="mt-4 pt-4 border-t border-dark-700">
                        <p className="text-xs text-dark-500">
                            <strong>Default distractions:</strong> YouTube, Netflix, TikTok, Twitter, Facebook, Instagram, Reddit, Discord, Telegram, WhatsApp
                        </p>
                    </div>
                </div>
            </div>

            {/* Notifications */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary-400" />
                    Notifications
                </h2>

                <SettingToggle
                    icon={settings.notificationsEnabled ? Bell : BellOff}
                    label="Desktop Notifications"
                    description="Show notifications for focus sessions and breaks"
                    value={settings.notificationsEnabled}
                    onChange={(v) => updateSetting('notificationsEnabled', v)}
                />

                <SettingToggle
                    icon={settings.soundEnabled ? Bell : BellOff}
                    label="Sound Alerts"
                    description="Play sounds for session completions"
                    value={settings.soundEnabled}
                    onChange={(v) => updateSetting('soundEnabled', v)}
                />
            </div>

            {/* AI Configuration */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Key className="w-5 h-5 text-primary-400" />
                    AI Configuration
                </h2>

                <div className="p-4 bg-dark-800 rounded-xl border border-dark-700 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-2">
                            Groq API Key
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type={showApiKey ? 'text' : 'password'}
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="gsk_..."
                                    className="input-field w-full pr-10"
                                />
                                <button
                                    onClick={() => setShowApiKey(!showApiKey)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white"
                                >
                                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <button onClick={saveApiKey} className="btn-primary">
                                <Save className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-xs text-dark-500 mt-2">
                            Get your free API key from <a href="https://console.groq.com" target="_blank" className="text-primary-400 hover:underline">console.groq.com</a>
                        </p>
                    </div>
                </div>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Keyboard className="w-5 h-5 text-primary-400" />
                    Keyboard Shortcuts
                </h2>

                <div className="bg-dark-800 rounded-xl border border-dark-700 divide-y divide-dark-700">
                    {[
                        { keys: 'Ctrl + Shift + F', action: 'Start Focus Session' },
                        { keys: 'Ctrl + Shift + T', action: 'Toggle Tracking' },
                    ].map((shortcut, i) => (
                        <div key={i} className="flex items-center justify-between p-4">
                            <span className="text-dark-300">{shortcut.action}</span>
                            <kbd className="px-3 py-1 bg-dark-700 rounded text-sm text-white font-mono">
                                {shortcut.keys}
                            </kbd>
                        </div>
                    ))}
                </div>
            </div>

            {/* Data Management */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary-400" />
                    Data & Privacy
                </h2>

                <div className="bg-dark-800 rounded-xl border border-dark-700 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium text-white">Export Data</div>
                            <div className="text-sm text-dark-400">Download all your data as JSON</div>
                        </div>
                        <button className="btn-secondary flex items-center gap-2">
                            <FolderOpen className="w-4 h-4" />
                            Export
                        </button>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-dark-700">
                        <div>
                            <div className="font-medium text-red-400">Delete All Data</div>
                            <div className="text-sm text-dark-400">Permanently delete all tracked data</div>
                        </div>
                        <button className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2">
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>
                    </div>
                </div>
            </div>

            {/* About */}
            <div className="p-4 bg-dark-800 rounded-xl border border-dark-700 flex items-center gap-4">
                <Info className="w-6 h-6 text-primary-400" />
                <div>
                    <div className="font-medium text-white">Wakey v0.1.0</div>
                    <div className="text-sm text-dark-400">AI-Native Productivity Tracker</div>
                </div>
            </div>
        </div>
    );
}
