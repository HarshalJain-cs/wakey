import { useState, useEffect } from 'react';
import {
    Moon, Sun, Bell, BellOff, Eye, EyeOff,
    Key, Save, Trash2, FolderOpen, Database,
    Keyboard, Info, Shield, Zap
} from 'lucide-react';

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
    });
    const [apiKey, setApiKey] = useState('');
    const [showApiKey, setShowApiKey] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await window.wakey.getSettings();
            setSettings(data as Settings);
            if ((data as Settings).groqApiKey) {
                setApiKey((data as Settings).groqApiKey || '');
            }
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

    const showSavedIndicator = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
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
