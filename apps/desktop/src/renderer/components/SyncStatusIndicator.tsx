/**
 * Sync Status Indicator Component
 * Shows offline/online status and pending sync operations
 */

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Cloud, CloudOff, RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface SyncStatus {
    isOnline: boolean;
    isSyncing: boolean;
    pendingCount: number;
    failedCount: number;
    lastSyncAt: number | null;
}

interface SyncStatusIndicatorProps {
    position?: 'top-right' | 'bottom-right' | 'bottom-left';
    showDetails?: boolean;
}

export default function SyncStatusIndicator({
    position = 'bottom-right',
    showDetails = false
}: SyncStatusIndicatorProps) {
    const [status, setStatus] = useState<SyncStatus>({
        isOnline: navigator.onLine,
        isSyncing: false,
        pendingCount: 0,
        failedCount: 0,
        lastSyncAt: null,
    });
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const handleOnline = () => setStatus(s => ({ ...s, isOnline: true }));
        const handleOffline = () => setStatus(s => ({ ...s, isOnline: false }));

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Subscribe to sync service events
        const handleSyncStatus = (event: CustomEvent<SyncStatus>) => {
            setStatus(event.detail);
        };
        window.addEventListener('wakey-sync-status' as any, handleSyncStatus as EventListener);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('wakey-sync-status' as any, handleSyncStatus as EventListener);
        };
    }, []);

    const formatLastSync = (timestamp: number | null) => {
        if (!timestamp) return 'Never';
        const diff = Date.now() - timestamp;
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return new Date(timestamp).toLocaleDateString();
    };

    const getStatusColor = () => {
        if (!status.isOnline) return 'bg-amber-500/20 border-amber-500/50 text-amber-400';
        if (status.failedCount > 0) return 'bg-red-500/20 border-red-500/50 text-red-400';
        if (status.pendingCount > 0) return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
        return 'bg-green-500/20 border-green-500/50 text-green-400';
    };

    const getStatusIcon = () => {
        if (status.isSyncing) return <Loader2 className="w-4 h-4 animate-spin" />;
        if (!status.isOnline) return <WifiOff className="w-4 h-4" />;
        if (status.failedCount > 0) return <AlertCircle className="w-4 h-4" />;
        if (status.pendingCount > 0) return <RefreshCw className="w-4 h-4" />;
        return <CheckCircle className="w-4 h-4" />;
    };

    const getStatusText = () => {
        if (status.isSyncing) return 'Syncing...';
        if (!status.isOnline) return 'Offline';
        if (status.failedCount > 0) return `${status.failedCount} failed`;
        if (status.pendingCount > 0) return `${status.pendingCount} pending`;
        return 'Synced';
    };

    const positionClasses = {
        'top-right': 'top-14 right-4',
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
    };

    return (
        <div className={`fixed ${positionClasses[position]} z-40`}>
            {/* Collapsed Indicator */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-sm transition-all duration-200 hover:scale-105 ${getStatusColor()}`}
            >
                {getStatusIcon()}
                <span className="text-sm font-medium">{getStatusText()}</span>
                {(status.pendingCount > 0 || status.failedCount > 0) && (
                    <span className="px-1.5 py-0.5 text-xs rounded-full bg-white/10">
                        {status.pendingCount + status.failedCount}
                    </span>
                )}
            </button>

            {/* Expanded Panel */}
            {isExpanded && (
                <div className="absolute bottom-full mb-2 right-0 w-72 bg-dark-800 border border-dark-700 rounded-xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b border-dark-700">
                        <div className="flex items-center gap-3">
                            {status.isOnline ? (
                                <div className="p-2 rounded-lg bg-green-500/20">
                                    <Wifi className="w-5 h-5 text-green-400" />
                                </div>
                            ) : (
                                <div className="p-2 rounded-lg bg-amber-500/20">
                                    <WifiOff className="w-5 h-5 text-amber-400" />
                                </div>
                            )}
                            <div>
                                <div className="font-medium text-white">
                                    {status.isOnline ? 'Online' : 'Offline Mode'}
                                </div>
                                <div className="text-xs text-dark-400">
                                    Last sync: {formatLastSync(status.lastSyncAt)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-dark-400">
                                <Cloud className="w-4 h-4" />
                                <span className="text-sm">Pending changes</span>
                            </div>
                            <span className={`text-sm font-medium ${status.pendingCount > 0 ? 'text-blue-400' : 'text-dark-500'}`}>
                                {status.pendingCount}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-dark-400">
                                <CloudOff className="w-4 h-4" />
                                <span className="text-sm">Failed syncs</span>
                            </div>
                            <span className={`text-sm font-medium ${status.failedCount > 0 ? 'text-red-400' : 'text-dark-500'}`}>
                                {status.failedCount}
                            </span>
                        </div>

                        {/* Progress bar when syncing */}
                        {status.isSyncing && (
                            <div className="pt-2">
                                <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary-500 rounded-full animate-pulse w-2/3" />
                                </div>
                                <p className="text-xs text-dark-400 mt-2">Synchronizing your data...</p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    {!status.isOnline && (
                        <div className="px-4 pb-4">
                            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                                <p className="text-xs text-amber-300">
                                    You're offline. Changes will sync when you're back online.
                                </p>
                            </div>
                        </div>
                    )}

                    {status.failedCount > 0 && status.isOnline && (
                        <div className="px-4 pb-4">
                            <button className="w-full px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-medium transition-colors">
                                Retry Failed Syncs
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
