import { useState, useEffect } from 'react';
import {
    Plug, Check, X, RefreshCw, AlertCircle,
    ExternalLink, Settings, ChevronRight
} from 'lucide-react';

interface Integration {
    id: string;
    name: string;
    icon: string;
    connected: boolean;
    lastSync?: string;
    status: 'connected' | 'disconnected' | 'error' | 'syncing';
    category: string;
    error?: string;
}

const INTEGRATIONS: Integration[] = [
    { id: 'google-calendar', name: 'Google Calendar', icon: '📅', connected: true, lastSync: new Date().toISOString(), status: 'connected', category: 'Calendar' },
    { id: 'slack', name: 'Slack', icon: '💬', connected: true, lastSync: new Date().toISOString(), status: 'connected', category: 'Communication' },
    { id: 'notion', name: 'Notion', icon: '📝', connected: false, status: 'disconnected', category: 'Productivity' },
    { id: 'github', name: 'GitHub', icon: '🐙', connected: true, lastSync: new Date().toISOString(), status: 'connected', category: 'Development' },
    { id: 'todoist', name: 'Todoist', icon: '✅', connected: false, status: 'disconnected', category: 'Tasks' },
    { id: 'spotify', name: 'Spotify', icon: '🎵', connected: true, status: 'connected', category: 'Music' },
    { id: 'fitbit', name: 'Fitbit', icon: '⌚', connected: false, status: 'error', error: 'Token expired', category: 'Health' },
    { id: 'linear', name: 'Linear', icon: '📊', connected: false, status: 'disconnected', category: 'Development' },
];

export default function IntegrationStatusWidget() {
    const [integrations, setIntegrations] = useState<Integration[]>(INTEGRATIONS);
    const [filter, setFilter] = useState<'all' | 'connected' | 'issues'>('all');
    const [syncing, setSyncing] = useState<string | null>(null);

    const filteredIntegrations = integrations.filter(i => {
        if (filter === 'connected') return i.connected;
        if (filter === 'issues') return i.status === 'error' || (i.connected && !i.lastSync);
        return true;
    });

    const connectedCount = integrations.filter(i => i.connected).length;
    const issueCount = integrations.filter(i => i.status === 'error').length;

    const formatLastSync = (dateStr?: string) => {
        if (!dateStr) return 'Never';
        const date = new Date(dateStr);
        const diff = Date.now() - date.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
        return date.toLocaleDateString();
    };

    const handleSync = (id: string) => {
        setSyncing(id);
        // Simulate sync
        setTimeout(() => {
            setIntegrations(integrations.map(i =>
                i.id === id ? { ...i, lastSync: new Date().toISOString(), status: 'connected' } : i
            ));
            setSyncing(null);
        }, 1500);
    };

    const getStatusIcon = (integration: Integration) => {
        if (syncing === integration.id) {
            return <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />;
        }
        switch (integration.status) {
            case 'connected':
                return <Check className="w-4 h-4 text-green-400" />;
            case 'error':
                return <AlertCircle className="w-4 h-4 text-red-400" />;
            default:
                return <X className="w-4 h-4 text-dark-500" />;
        }
    };

    return (
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Plug className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-semibold text-white">Integrations</h3>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <span className="text-green-400">{connectedCount} connected</span>
                    {issueCount > 0 && (
                        <span className="text-red-400">{issueCount} issues</span>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-1 mb-4">
                {(['all', 'connected', 'issues'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1 rounded-lg text-xs transition-colors ${filter === f
                                ? 'bg-primary-500 text-white'
                                : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                            }`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Integration List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredIntegrations.map(integration => (
                    <div
                        key={integration.id}
                        className="flex items-center justify-between p-2.5 bg-dark-700/50 rounded-lg hover:bg-dark-700 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-lg">{integration.icon}</span>
                            <div>
                                <h4 className="text-sm font-medium text-white">{integration.name}</h4>
                                <p className="text-xs text-dark-500">
                                    {integration.error || (integration.connected ? `Synced ${formatLastSync(integration.lastSync)}` : 'Not connected')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {integration.connected && (
                                <button
                                    onClick={() => handleSync(integration.id)}
                                    className="p-1.5 opacity-0 group-hover:opacity-100 bg-dark-600 rounded-lg hover:bg-dark-500 transition-all"
                                    disabled={syncing === integration.id}
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 text-dark-300 ${syncing === integration.id ? 'animate-spin' : ''}`} />
                                </button>
                            )}
                            {getStatusIcon(integration)}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-dark-700 flex justify-between items-center">
                <span className="text-xs text-dark-500">{integrations.length} total integrations</span>
                <button className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors">
                    Manage <ChevronRight className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
}
