import { useState, useEffect } from 'react';
import {
    Cloud, CloudOff, RefreshCw, Settings, CheckCircle,
    AlertCircle, LogIn, LogOut, Key, Mail, Lock
} from 'lucide-react';
import * as syncService from '../services/sync-service';

export default function CloudSyncPage() {
    const [config, setConfig] = useState(syncService.getConfig());
    const [status, setStatus] = useState(syncService.getStatus());
    const [user, setUser] = useState(syncService.getUser());

    // Auth form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showConfig, setShowConfig] = useState(false);

    // Config form state
    const [supabaseUrl, setSupabaseUrl] = useState(config.supabaseUrl);
    const [supabaseKey, setSupabaseKey] = useState(config.supabaseKey);

    useEffect(() => {
        const init = async () => {
            await syncService.initialize();
            refreshState();
        };
        init();

        // Refresh status periodically
        const interval = setInterval(refreshState, 5000);
        return () => clearInterval(interval);
    }, []);

    const refreshState = () => {
        setConfig(syncService.getConfig());
        setStatus(syncService.getStatus());
        setUser(syncService.getUser());
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const success = await syncService.signIn(email, password);
        refreshState();
        setIsLoading(false);

        if (success) {
            setEmail('');
            setPassword('');
        }
    };

    const handleSignOut = async () => {
        await syncService.signOut();
        refreshState();
    };

    const handleSaveConfig = async () => {
        await syncService.updateConfig({
            supabaseUrl,
            supabaseKey,
        });
        refreshState();
        setShowConfig(false);
    };

    const handleSync = async () => {
        await syncService.syncToCloud();
        refreshState();
    };

    const formatTime = (isoString: string | null) => {
        if (!isoString) return 'Never';
        const date = new Date(isoString);
        return date.toLocaleString();
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Cloud Sync</h1>
                    <p className="text-dark-400">Backup and sync your data across devices</p>
                </div>

                <button
                    onClick={() => setShowConfig(!showConfig)}
                    className="flex items-center gap-2 px-4 py-2 bg-dark-700 text-dark-400 hover:text-white rounded-lg"
                >
                    <Settings className="w-4 h-4" />
                    Configure
                </button>
            </div>

            {/* Configuration Panel */}
            {showConfig && (
                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                    <h2 className="text-lg font-semibold text-white mb-4">Supabase Configuration</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-dark-300 mb-2">
                                Supabase URL
                            </label>
                            <input
                                type="url"
                                value={supabaseUrl}
                                onChange={(e) => setSupabaseUrl(e.target.value)}
                                placeholder="https://your-project.supabase.co"
                                className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-dark-300 mb-2">
                                Supabase Anon Key
                            </label>
                            <input
                                type="password"
                                value={supabaseKey}
                                onChange={(e) => setSupabaseKey(e.target.value)}
                                placeholder="eyJ..."
                                className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
                            />
                        </div>

                        <p className="text-xs text-dark-500">
                            Get your Supabase project URL and anon key from{' '}
                            <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">
                                supabase.com
                            </a>
                        </p>

                        <button
                            onClick={handleSaveConfig}
                            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                        >
                            Save Configuration
                        </button>
                    </div>
                </div>
            )}

            {/* Status Card */}
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {status.isAuthenticated ? (
                            <div className="p-3 bg-green-500/20 rounded-full">
                                <Cloud className="w-6 h-6 text-green-400" />
                            </div>
                        ) : (
                            <div className="p-3 bg-dark-700 rounded-full">
                                <CloudOff className="w-6 h-6 text-dark-400" />
                            </div>
                        )}
                        <div>
                            <h3 className="font-semibold text-white">
                                {status.isAuthenticated ? 'Connected' : 'Not Connected'}
                            </h3>
                            <p className="text-sm text-dark-400">
                                {status.isAuthenticated && user
                                    ? `Signed in as ${user.email}`
                                    : 'Sign in to enable cloud sync'}
                            </p>
                        </div>
                    </div>

                    {status.isAuthenticated && (
                        <button
                            onClick={handleSync}
                            disabled={status.isSyncing}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${status.isSyncing ? 'animate-spin' : ''}`} />
                            {status.isSyncing ? 'Syncing...' : 'Sync Now'}
                        </button>
                    )}
                </div>

                {/* Sync Stats */}
                {status.isAuthenticated && (
                    <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-dark-700">
                        <div className="text-center">
                            <div className="text-sm text-dark-400">Last Sync</div>
                            <div className="text-white font-medium">{formatTime(status.lastSyncAt)}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-dark-400">Pending Changes</div>
                            <div className="text-white font-medium">{status.pendingChanges}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-dark-400">Auto-Sync</div>
                            <div className="text-white font-medium">
                                {config.autoSync ? `Every ${config.syncInterval}min` : 'Disabled'}
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {status.error && (
                    <div className="mt-4 p-3 bg-red-500/20 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <span className="text-red-400">{status.error}</span>
                    </div>
                )}
            </div>

            {/* Auth Form */}
            {!status.isAuthenticated && (
                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                    <h2 className="text-lg font-semibold text-white mb-4">Sign In</h2>

                    {!config.supabaseUrl ? (
                        <div className="text-center py-8">
                            <Key className="w-12 h-12 text-dark-500 mx-auto mb-4" />
                            <p className="text-dark-400 mb-4">Configure Supabase first to enable cloud sync</p>
                            <button
                                onClick={() => setShowConfig(true)}
                                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                            >
                                Configure Now
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSignIn} className="space-y-4">
                            <div>
                                <label className="block text-sm text-dark-300 mb-2">
                                    <Mail className="w-4 h-4 inline mr-2" />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
                                    placeholder="your@email.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-dark-300 mb-2">
                                    <Lock className="w-4 h-4 inline mr-2" />
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
                            >
                                <LogIn className="w-4 h-4" />
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </button>
                        </form>
                    )}
                </div>
            )}

            {/* Sign Out */}
            {status.isAuthenticated && (
                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium text-white">Account</h3>
                            <p className="text-sm text-dark-400">{user?.email}</p>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}

            {/* Sync Settings */}
            {status.isAuthenticated && (
                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                    <h2 className="text-lg font-semibold text-white mb-4">Sync Settings</h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                            <div>
                                <div className="font-medium text-white">Auto-Sync</div>
                                <div className="text-sm text-dark-400">Automatically sync data at regular intervals</div>
                            </div>
                            <button
                                onClick={() => syncService.updateConfig({ autoSync: !config.autoSync }).then(refreshState)}
                                className={`w-12 h-6 rounded-full transition-all ${config.autoSync ? 'bg-primary-500' : 'bg-dark-600'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${config.autoSync ? 'translate-x-6' : 'translate-x-0.5'}`} />
                            </button>
                        </div>

                        <div className="p-4 bg-dark-700 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                                <div className="font-medium text-white">Sync Interval</div>
                                <span className="text-primary-400">{config.syncInterval} minutes</span>
                            </div>
                            <input
                                type="range"
                                min="15"
                                max="240"
                                step="15"
                                value={config.syncInterval}
                                onChange={(e) => syncService.updateConfig({ syncInterval: parseInt(e.target.value) }).then(refreshState)}
                                className="w-full accent-primary-500"
                            />
                            <div className="flex justify-between text-xs text-dark-500 mt-2">
                                <span>15 min</span>
                                <span>4 hours</span>
                            </div>
                        </div>
                    </div>

                    {/* Sync Success */}
                    {status.lastSyncAt && !status.error && (
                        <div className="mt-4 p-3 bg-green-500/10 rounded-lg flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <span className="text-green-400">
                                Last synced: {formatTime(status.lastSyncAt)}
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
