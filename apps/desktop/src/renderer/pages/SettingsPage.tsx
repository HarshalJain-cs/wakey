import { useState, useEffect } from 'react';
import {
    Moon, Sun, Bell, BellOff, Eye, EyeOff,
    Key, Save, Trash2, FolderOpen, Database,
    Keyboard, Info, Shield, Zap, AlertTriangle, Plus, X,
    Cloud, LogOut, User, Check, Coffee, Palette, Target,
    Calendar, Lock, BarChart3, Volume2, Mic, Bot, TrendingUp
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
    breakReminders?: boolean;
    breakInterval?: number;
    workHoursStart?: string;
    workHoursEnd?: string;
    weeklyReports?: boolean;
    userFullName?: string;
    userOccupation?: string;
    userTimezone?: string;
    voiceEnabled?: boolean;
    wakeWord?: string;
    traderEnabled?: boolean;
}

// Settings navigation sections
const SETTINGS_SECTIONS = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'tracking', label: 'Activity Tracking', icon: Zap },
    { id: 'breaks', label: 'Breaks', icon: Coffee },
    { id: 'focus', label: 'Focus', icon: Target },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'sounds', label: 'Sounds', icon: Volume2 },
    { id: 'calendar', label: 'Calendars', icon: Calendar },
    { id: 'ai', label: 'AI Configuration', icon: Key },
    { id: 'jarvis', label: 'JARVIS Integration', icon: Bot },
    { id: 'voice', label: 'Voice Commands', icon: Mic },
    { id: 'trader', label: 'Trader Mode', icon: BarChart3 },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'data', label: 'Data & Export', icon: Shield },
    { id: 'keyboard', label: 'Keyboard Shortcuts', icon: Keyboard },
    { id: 'about', label: 'About', icon: Info },
];

export default function SettingsPage({ darkMode, onDarkModeToggle }: SettingsPageProps) {
    const [activeSection, setActiveSection] = useState('account');
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
        breakReminders: true,
        breakInterval: 25,
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
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const [wakeWord, setWakeWord] = useState('hey wakey');
    const [traderEnabled, setTraderEnabled] = useState(false);
    const [userProfile, setUserProfile] = useState<{
        fullName: string;
        occupation: string;
        timezone: string;
    }>({ fullName: '', occupation: '', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone });

    useEffect(() => {
        loadSettings();
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
            if (loadedSettings.groqApiKey) setApiKey(loadedSettings.groqApiKey || '');
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
        if (result.success) setAuthUser(null);
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
        label, description, value, onChange, icon: Icon
    }: {
        label: string; description: string; value: boolean; onChange: (v: boolean) => void; icon: React.ElementType;
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
                className={`w-12 h-6 rounded-full transition-all ${value ? 'bg-primary-500' : 'bg-dark-600'}`}
            >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
        </div>
    );

    return (
        <div className="flex gap-6 max-w-6xl mx-auto">
            {/* Sidebar Navigation */}
            <div className="w-56 shrink-0">
                <div className="sticky top-6 space-y-1">
                    <h1 className="text-xl font-bold text-white mb-1">Settings</h1>
                    <p className="text-dark-400 text-sm mb-4">Configure Wakey</p>

                    {SETTINGS_SECTIONS.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveSection(id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${activeSection === id
                                ? 'bg-primary-500/10 text-primary-400'
                                : 'text-dark-400 hover:text-white hover:bg-dark-800'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="text-sm">{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 space-y-4">
                {saved && (
                    <div className="flex items-center gap-2 text-green-400 bg-green-500/20 px-4 py-2 rounded-lg w-fit">
                        <Save className="w-4 h-4" />
                        Settings saved
                    </div>
                )}

                {/* Account Section */}
                {activeSection === 'account' && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Cloud className="w-5 h-5 text-primary-400" />
                            Account & Cloud
                        </h2>

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
                                        <div className="text-sm text-dark-500">Configure Supabase to enable cloud sync</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Profile Details */}
                        <div className="p-4 bg-dark-800 rounded-xl border border-dark-700 space-y-4">
                            <h3 className="font-medium text-white flex items-center gap-2">
                                <User className="w-4 h-4 text-primary-400" />
                                Profile Details
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-dark-400 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={userProfile.fullName}
                                        onChange={(e) => {
                                            setUserProfile(prev => ({ ...prev, fullName: e.target.value }));
                                            updateSetting('userFullName', e.target.value);
                                        }}
                                        placeholder="Enter your name"
                                        className="input-field w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-dark-400 mb-1">Occupation</label>
                                    <input
                                        type="text"
                                        value={userProfile.occupation}
                                        onChange={(e) => {
                                            setUserProfile(prev => ({ ...prev, occupation: e.target.value }));
                                            updateSetting('userOccupation', e.target.value);
                                        }}
                                        placeholder="e.g. Developer, Designer"
                                        className="input-field w-full"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-dark-400 mb-1">Timezone</label>
                                <input
                                    type="text"
                                    value={userProfile.timezone}
                                    readOnly
                                    className="input-field w-full bg-dark-700 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <SettingToggle
                            icon={Shield}
                            label="Require Authentication"
                            description="Require sign-in to use the app"
                            value={requireAuth}
                            onChange={toggleRequireAuth}
                        />

                        <div className="p-4 bg-dark-800 rounded-xl border border-dark-700 space-y-4">
                            <div className="flex items-center gap-2">
                                <Database className="w-5 h-5 text-primary-400" />
                                <span className="font-medium text-white">Supabase Configuration</span>
                            </div>
                            <div>
                                <label className="block text-sm text-dark-300 mb-2">Project URL</label>
                                <input
                                    type="text"
                                    value={supabaseUrl}
                                    onChange={(e) => setSupabaseUrl(e.target.value)}
                                    placeholder="https://your-project.supabase.co"
                                    className="input-field w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-dark-300 mb-2">Anon Key</label>
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
                            <button onClick={saveSupabaseConfig} className="btn-primary w-full flex items-center justify-center gap-2">
                                <Save className="w-4 h-4" />
                                Save Configuration
                            </button>
                        </div>
                    </div>
                )}

                {/* Tracking Section */}
                {activeSection === 'tracking' && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Zap className="w-5 h-5 text-primary-400" />
                            Activity Tracking
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
                )}

                {/* Breaks Section */}
                {activeSection === 'breaks' && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Coffee className="w-5 h-5 text-primary-400" />
                            Break Reminders
                        </h2>

                        <SettingToggle
                            icon={Coffee}
                            label="Break Reminders"
                            description="Get reminded to take breaks during work"
                            value={settings.breakReminders ?? true}
                            onChange={(v) => updateSetting('breakReminders', v)}
                        />

                        <div className="p-4 bg-dark-800 rounded-xl border border-dark-700">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="p-2 bg-dark-700 rounded-lg">
                                    <Coffee className="w-5 h-5 text-primary-400" />
                                </div>
                                <div>
                                    <div className="font-medium text-white">Break Interval</div>
                                    <div className="text-sm text-dark-400">Remind me to take a break every...</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="15"
                                    max="90"
                                    step="5"
                                    value={settings.breakInterval ?? 25}
                                    onChange={(e) => updateSetting('breakInterval', parseInt(e.target.value))}
                                    className="flex-1 accent-primary-500"
                                />
                                <span className="text-white font-medium w-24 text-right">
                                    {settings.breakInterval ?? 25} minutes
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Focus Section */}
                {activeSection === 'focus' && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary-400" />
                            Focus Settings
                        </h2>

                        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
                            <p className="text-dark-400 text-sm mb-4">
                                Add apps that you consider distracting. You'll be alerted when using these during focus time.
                            </p>

                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={newDistraction}
                                    onChange={(e) => setNewDistraction(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addDistraction()}
                                    placeholder="Enter app name (e.g., youtube)"
                                    className="flex-1 px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
                                />
                                <button
                                    onClick={addDistraction}
                                    disabled={!newDistraction.trim()}
                                    className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 disabled:opacity-50 flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add
                                </button>
                            </div>

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

                            <div className="mt-4 pt-4 border-t border-dark-700">
                                <p className="text-xs text-dark-500">
                                    <strong>Default distractions:</strong> YouTube, Netflix, TikTok, Twitter, Facebook, Instagram, Reddit, Discord
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notifications Section */}
                {activeSection === 'notifications' && (
                    <div className="space-y-4">
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
                    </div>
                )}

                {/* Sounds Section */}
                {activeSection === 'sounds' && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Volume2 className="w-5 h-5 text-primary-400" />
                            Sounds
                        </h2>

                        <SettingToggle
                            icon={Volume2}
                            label="Sound Alerts"
                            description="Play sounds for session completions"
                            value={settings.soundEnabled}
                            onChange={(v) => updateSetting('soundEnabled', v)}
                        />

                        <div className="p-4 bg-dark-800 rounded-xl border border-dark-700">
                            <p className="text-dark-400 text-sm">
                                Visit the <a href="#/music" className="text-primary-400 hover:underline">Music page</a> to explore ambient sounds for focus.
                            </p>
                        </div>
                    </div>
                )}

                {/* AI Section */}
                {activeSection === 'ai' && (
                    <div className="space-y-4">
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
                )}

                {/* JARVIS Section */}
                {activeSection === 'jarvis' && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Bot className="w-5 h-5 text-cyan-400" />
                            JARVIS Integration
                        </h2>

                        <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/30">
                            <div className="flex items-center gap-3 mb-3">
                                <Bot className="w-6 h-6 text-cyan-400" />
                                <span className="font-medium text-white">Connect to JARVIS Master AI</span>
                            </div>
                            <p className="text-dark-400 text-sm mb-4">
                                Link Wakey to your JARVIS AI assistant for voice commands, cross-app automation, and intelligent insights.
                            </p>
                        </div>

                        <SettingToggle
                            icon={Zap}
                            label="Share Activity Data"
                            description="Send productivity data to JARVIS for analysis"
                            value={true}
                            onChange={() => { }}
                        />

                        <SettingToggle
                            icon={Zap}
                            label="Share Focus Data"
                            description="Send focus session data to JARVIS"
                            value={true}
                            onChange={() => { }}
                        />

                        <SettingToggle
                            icon={Zap}
                            label="Receive JARVIS Commands"
                            description="Allow JARVIS to control Wakey remotely"
                            value={true}
                            onChange={() => { }}
                        />

                        <div className="p-4 bg-dark-800 rounded-xl border border-dark-700 space-y-4">
                            <div className="flex items-center gap-2">
                                <Database className="w-5 h-5 text-primary-400" />
                                <span className="font-medium text-white">JARVIS Supabase Connection</span>
                            </div>
                            <div>
                                <label className="block text-sm text-dark-300 mb-2">JARVIS Project URL</label>
                                <input
                                    type="text"
                                    placeholder="https://your-jarvis-project.supabase.co"
                                    className="input-field w-full"
                                />
                            </div>
                            <button className="w-full btn-primary bg-gradient-to-r from-cyan-500 to-blue-600">
                                Connect to JARVIS
                            </button>
                        </div>
                    </div>
                )}

                {/* Voice Commands Section */}
                {activeSection === 'voice' && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Mic className="w-5 h-5 text-primary-400" />
                            Voice Commands
                        </h2>

                        <SettingToggle
                            icon={Mic}
                            label="Enable Voice Commands"
                            description="Use voice to control Wakey"
                            value={voiceEnabled}
                            onChange={(v) => {
                                setVoiceEnabled(v);
                                updateSetting('voiceEnabled', v);
                            }}
                        />

                        <div className="p-4 bg-dark-800 rounded-xl border border-dark-700">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="p-2 bg-dark-700 rounded-lg">
                                    <Mic className="w-5 h-5 text-primary-400" />
                                </div>
                                <div>
                                    <div className="font-medium text-white">Wake Word</div>
                                    <div className="text-sm text-dark-400">Say this to activate voice commands</div>
                                </div>
                            </div>
                            <input
                                type="text"
                                value={wakeWord}
                                onChange={(e) => {
                                    setWakeWord(e.target.value);
                                    updateSetting('wakeWord', e.target.value);
                                }}
                                className="input-field w-full"
                            />
                        </div>

                        <div className="bg-dark-800 rounded-xl border border-dark-700 divide-y divide-dark-700">
                            <div className="p-4">
                                <h3 className="font-medium text-white mb-3">Available Commands</h3>
                            </div>
                            {[
                                { command: '"Start focus"', action: 'Begin a focus session' },
                                { command: '"Take a break"', action: 'Start a break timer' },
                                { command: '"Create task: [title]"', action: 'Add a new task' },
                                { command: '"Show my tasks"', action: 'Navigate to tasks' },
                                { command: '"Status"', action: 'Get productivity summary' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4">
                                    <code className="text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">{item.command}</code>
                                    <span className="text-dark-400 text-sm">{item.action}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Appearance Section */}
                {activeSection === 'appearance' && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Palette className="w-5 h-5 text-primary-400" />
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
                )}

                {/* Privacy Section */}
                {activeSection === 'privacy' && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Lock className="w-5 h-5 text-primary-400" />
                            Privacy
                        </h2>

                        <div className="p-4 bg-dark-800 rounded-xl border border-dark-700">
                            <div className="flex items-center gap-3 mb-4">
                                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                                <span className="text-white font-medium">Your Data, Your Control</span>
                            </div>
                            <p className="text-dark-400 text-sm">
                                All your productivity data is stored locally on your device. We never collect or share your personal information without your consent.
                            </p>
                        </div>
                    </div>
                )}

                {/* Reports Section */}
                {activeSection === 'reports' && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-primary-400" />
                            Reports
                        </h2>

                        <SettingToggle
                            icon={BarChart3}
                            label="Weekly Reports"
                            description="Receive weekly productivity summaries"
                            value={settings.weeklyReports ?? false}
                            onChange={(v) => updateSetting('weeklyReports', v)}
                        />
                    </div>
                )}

                {/* Data Section */}
                {activeSection === 'data' && (
                    <div className="space-y-4">
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
                )}

                {/* Keyboard Section */}
                {activeSection === 'keyboard' && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Keyboard className="w-5 h-5 text-primary-400" />
                            Keyboard Shortcuts
                        </h2>

                        <div className="bg-dark-800 rounded-xl border border-dark-700 divide-y divide-dark-700">
                            {[
                                { keys: 'Ctrl + Shift + F', action: 'Start Focus Session' },
                                { keys: 'Ctrl + Shift + T', action: 'Toggle Tracking' },
                                { keys: 'Ctrl + K', action: 'Open Command Palette' },
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
                )}

                {/* About Section */}
                {activeSection === 'about' && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Info className="w-5 h-5 text-primary-400" />
                            About
                        </h2>

                        <div className="p-4 bg-dark-800 rounded-xl border border-dark-700 flex items-center gap-4">
                            <Info className="w-10 h-10 text-primary-400" />
                            <div>
                                <div className="font-bold text-white text-xl">Wakey v0.2.0</div>
                                <div className="text-dark-400">AI-Native Productivity Tracker</div>
                                <div className="text-dark-500 text-sm mt-1">Built with Electron, React, and ❤️</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Calendar Section */}
                {activeSection === 'calendar' && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary-400" />
                            Calendar Integration
                        </h2>

                        <div className="p-4 bg-dark-800 rounded-xl border border-dark-700 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-white">Google Calendar</div>
                                        <div className="text-sm text-dark-400">Sync meetings and events</div>
                                    </div>
                                </div>
                                <button className="px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-colors">
                                    Connect
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-white">Outlook Calendar</div>
                                        <div className="text-sm text-dark-400">Microsoft 365 integration</div>
                                    </div>
                                </div>
                                <button className="px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-colors">
                                    Connect
                                </button>
                            </div>
                        </div>

                        <p className="text-sm text-dark-500">
                            Connected calendars will automatically track meeting time and block focus sessions during events.
                        </p>
                    </div>
                )}

                {/* Trader Mode Section */}
                {activeSection === 'trader' && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-green-400" />
                            Trader Mode
                        </h2>

                        <SettingToggle
                            icon={BarChart3}
                            label="Enable Trader Dashboard"
                            description="Show trading features and market tracking"
                            value={traderEnabled}
                            onChange={(v) => {
                                setTraderEnabled(v);
                                updateSetting('traderEnabled', v);
                            }}
                        />

                        {traderEnabled && (
                            <>
                                <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30">
                                    <div className="flex items-center gap-3 mb-3">
                                        <TrendingUp className="w-6 h-6 text-green-400" />
                                        <span className="font-medium text-white">Trading Integrations</span>
                                    </div>
                                    <p className="text-dark-400 text-sm mb-4">
                                        Connect your trading platforms to track performance and correlate with focus sessions.
                                    </p>
                                    <div className="space-y-2">
                                        <button className="w-full px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors flex items-center justify-between">
                                            <span>Groww</span>
                                            <span className="text-dark-400 text-sm">Coming Soon</span>
                                        </button>
                                        <button className="w-full px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors flex items-center justify-between">
                                            <span>TradingView</span>
                                            <span className="text-dark-400 text-sm">Coming Soon</span>
                                        </button>
                                        <button className="w-full px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors flex items-center justify-between">
                                            <span>Binance</span>
                                            <span className="text-dark-400 text-sm">Coming Soon</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
