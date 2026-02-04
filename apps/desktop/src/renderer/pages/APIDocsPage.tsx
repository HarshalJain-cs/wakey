/**
 * API Documentation Page
 * Mobile API reference and developer tools
 */

import { useState } from 'react';
import {
    Code,
    Key,
    Book,
    Copy,
    Check,
    RefreshCw,
    Eye,
    EyeOff,
    Terminal,
    Zap,
    Clock,
    BarChart2,
    Lock,
    Shield,
    ExternalLink,
    ChevronRight,
    Play,
    FileCode,
    Server,
    Database
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface APIKey {
    id: string;
    name: string;
    key: string;
    prefix: string;
    createdAt: string;
    lastUsedAt: string | null;
    permissions: string[];
    rateLimit: number;
    usageCount: number;
    isActive: boolean;
}

interface EndpointDoc {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    description: string;
    category: string;
    params?: { name: string; type: string; required: boolean; description: string }[];
    response?: string;
}

// ============================================
// MOCK DATA
// ============================================

const MOCK_API_KEYS: APIKey[] = [
    {
        id: '1',
        name: 'Mobile App Key',
        key: 'wk_live_a1b2c3d4e5f6g7h8i9j0',
        prefix: 'wk_live_',
        createdAt: '2026-01-15',
        lastUsedAt: '2026-02-03',
        permissions: ['read', 'write'],
        rateLimit: 1000,
        usageCount: 452,
        isActive: true,
    },
    {
        id: '2',
        name: 'Integration Key',
        key: 'wk_test_x9y8z7w6v5u4t3s2r1q0',
        prefix: 'wk_test_',
        createdAt: '2026-02-01',
        lastUsedAt: null,
        permissions: ['read'],
        rateLimit: 100,
        usageCount: 0,
        isActive: true,
    },
];

const API_ENDPOINTS: EndpointDoc[] = [
    // Focus Sessions
    { method: 'GET', path: '/api/v1/sessions', description: 'List all focus sessions', category: 'Sessions' },
    { method: 'POST', path: '/api/v1/sessions/start', description: 'Start a new focus session', category: 'Sessions' },
    { method: 'POST', path: '/api/v1/sessions/{id}/stop', description: 'Stop a focus session', category: 'Sessions' },
    { method: 'GET', path: '/api/v1/sessions/{id}', description: 'Get session details', category: 'Sessions' },

    // Tasks
    { method: 'GET', path: '/api/v1/tasks', description: 'List all tasks', category: 'Tasks' },
    { method: 'POST', path: '/api/v1/tasks', description: 'Create a new task', category: 'Tasks' },
    { method: 'PUT', path: '/api/v1/tasks/{id}', description: 'Update a task', category: 'Tasks' },
    { method: 'DELETE', path: '/api/v1/tasks/{id}', description: 'Delete a task', category: 'Tasks' },

    // Stats
    { method: 'GET', path: '/api/v1/stats/today', description: 'Get today\'s statistics', category: 'Analytics' },
    { method: 'GET', path: '/api/v1/stats/weekly', description: 'Get weekly statistics', category: 'Analytics' },
    { method: 'GET', path: '/api/v1/stats/trends', description: 'Get productivity trends', category: 'Analytics' },

    // Goals
    { method: 'GET', path: '/api/v1/goals', description: 'List all goals', category: 'Goals' },
    { method: 'POST', path: '/api/v1/goals', description: 'Create a new goal', category: 'Goals' },
    { method: 'PUT', path: '/api/v1/goals/{id}/progress', description: 'Update goal progress', category: 'Goals' },

    // User
    { method: 'GET', path: '/api/v1/user/profile', description: 'Get user profile', category: 'User' },
    { method: 'PUT', path: '/api/v1/user/settings', description: 'Update user settings', category: 'User' },
];

// ============================================
// COMPONENTS
// ============================================

function MethodBadge({ method }: { method: EndpointDoc['method'] }) {
    const colors = {
        GET: 'bg-green-500/20 text-green-400',
        POST: 'bg-blue-500/20 text-blue-400',
        PUT: 'bg-amber-500/20 text-amber-400',
        DELETE: 'bg-red-500/20 text-red-400',
    };

    return (
        <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${colors[method]}`}>
            {method}
        </span>
    );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function APIDocsPage() {
    const [apiKeys] = useState<APIKey[]>(MOCK_API_KEYS);
    const [showKey, setShowKey] = useState<string | null>(null);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'keys' | 'docs' | 'usage'>('keys');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const categories = [...new Set(API_ENDPOINTS.map(e => e.category))];
    const filteredEndpoints = selectedCategory
        ? API_ENDPOINTS.filter(e => e.category === selectedCategory)
        : API_ENDPOINTS;

    const copyToClipboard = (key: string, id: string) => {
        navigator.clipboard.writeText(key);
        setCopiedKey(id);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const maskKey = (key: string) => {
        return key.substring(0, 12) + '••••••••••••••••';
    };

    return (
        <div className="min-h-screen bg-dark-900 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
                            <Code className="w-6 h-6 text-white" />
                        </div>
                        API & Developer Tools
                    </h1>
                    <p className="text-dark-400 mt-2">Manage API keys and explore the mobile API</p>
                </div>

                <a
                    href="#"
                    className="flex items-center gap-2 px-4 py-2 bg-dark-800 border border-dark-700 rounded-xl text-dark-300 hover:text-white transition-colors"
                >
                    <Book className="w-4 h-4" />
                    Full Documentation
                    <ExternalLink className="w-4 h-4" />
                </a>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-dark-800 p-1 rounded-xl w-fit">
                {(['keys', 'docs', 'usage'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${activeTab === tab
                                ? 'bg-primary-500 text-white'
                                : 'text-dark-400 hover:text-white'
                            }`}
                    >
                        {tab === 'keys' ? 'API Keys' : tab === 'docs' ? 'Endpoints' : 'Usage'}
                    </button>
                ))}
            </div>

            {/* API Keys Tab */}
            {activeTab === 'keys' && (
                <div className="space-y-6">
                    {/* Create Key Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors"
                        >
                            <Key className="w-4 h-4" />
                            Create API Key
                        </button>
                    </div>

                    {/* Keys List */}
                    <div className="space-y-4">
                        {apiKeys.map(apiKey => (
                            <div key={apiKey.id} className="p-5 bg-dark-800 border border-dark-700 rounded-2xl">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl ${apiKey.isActive ? 'bg-green-500/20' : 'bg-dark-700'}`}>
                                            <Key className={`w-5 h-5 ${apiKey.isActive ? 'text-green-400' : 'text-dark-500'}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">{apiKey.name}</h3>
                                            <p className="text-xs text-dark-400">Created {apiKey.createdAt}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {apiKey.permissions.map(perm => (
                                            <span key={perm} className="px-2 py-0.5 bg-dark-700 text-dark-400 rounded text-xs capitalize">
                                                {perm}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Key Display */}
                                <div className="flex items-center gap-3 p-3 bg-dark-900 rounded-xl mb-4">
                                    <code className="flex-1 text-sm font-mono text-dark-300">
                                        {showKey === apiKey.id ? apiKey.key : maskKey(apiKey.key)}
                                    </code>
                                    <button
                                        onClick={() => setShowKey(showKey === apiKey.id ? null : apiKey.id)}
                                        className="p-1.5 rounded-lg hover:bg-dark-700 transition-colors"
                                    >
                                        {showKey === apiKey.id ? (
                                            <EyeOff className="w-4 h-4 text-dark-400" />
                                        ) : (
                                            <Eye className="w-4 h-4 text-dark-400" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                                        className="p-1.5 rounded-lg hover:bg-dark-700 transition-colors"
                                    >
                                        {copiedKey === apiKey.id ? (
                                            <Check className="w-4 h-4 text-green-400" />
                                        ) : (
                                            <Copy className="w-4 h-4 text-dark-400" />
                                        )}
                                    </button>
                                </div>

                                {/* Key Stats */}
                                <div className="grid grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="text-dark-500">Rate Limit</span>
                                        <div className="text-white font-medium">{apiKey.rateLimit}/hour</div>
                                    </div>
                                    <div>
                                        <span className="text-dark-500">Usage</span>
                                        <div className="text-white font-medium">{apiKey.usageCount} requests</div>
                                    </div>
                                    <div>
                                        <span className="text-dark-500">Last Used</span>
                                        <div className="text-white font-medium">{apiKey.lastUsedAt || 'Never'}</div>
                                    </div>
                                    <div>
                                        <span className="text-dark-500">Status</span>
                                        <div className={`font-medium ${apiKey.isActive ? 'text-green-400' : 'text-red-400'}`}>
                                            {apiKey.isActive ? 'Active' : 'Inactive'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Security Note */}
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
                        <Shield className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-medium text-amber-300">Keep your API keys secure</h4>
                            <p className="text-sm text-amber-300/80">Never share your API keys publicly or commit them to version control.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Docs Tab */}
            {activeTab === 'docs' && (
                <div className="grid grid-cols-4 gap-6">
                    {/* Category Sidebar */}
                    <div className="col-span-1 space-y-2">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`w-full text-left px-4 py-2 rounded-xl transition-colors ${!selectedCategory ? 'bg-primary-500 text-white' : 'text-dark-400 hover:bg-dark-800'
                                }`}
                        >
                            All Endpoints
                        </button>
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`w-full text-left px-4 py-2 rounded-xl transition-colors ${selectedCategory === category ? 'bg-primary-500 text-white' : 'text-dark-400 hover:bg-dark-800'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Endpoints List */}
                    <div className="col-span-3 space-y-3">
                        {filteredEndpoints.map((endpoint, i) => (
                            <div key={i} className="p-4 bg-dark-800 border border-dark-700 rounded-xl hover:border-dark-600 transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <MethodBadge method={endpoint.method} />
                                    <code className="text-sm font-mono text-white">{endpoint.path}</code>
                                    <span className="text-sm text-dark-400 ml-auto">{endpoint.description}</span>
                                    <ChevronRight className="w-4 h-4 text-dark-500" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Usage Tab */}
            {activeTab === 'usage' && (
                <div className="grid grid-cols-3 gap-6">
                    {/* Usage Stats */}
                    <div className="col-span-2 p-6 bg-dark-800 border border-dark-700 rounded-2xl">
                        <h3 className="text-lg font-semibold text-white mb-4">API Usage (Last 7 Days)</h3>
                        <div className="h-64 flex items-end justify-between gap-2">
                            {[120, 245, 189, 312, 278, 421, 356].map((val, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                    <div
                                        className="w-full bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-lg transition-all"
                                        style={{ height: `${(val / 500) * 100}%` }}
                                    />
                                    <span className="text-xs text-dark-500">
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="space-y-4">
                        <div className="p-4 bg-dark-800 border border-dark-700 rounded-2xl">
                            <div className="flex items-center gap-3 mb-2">
                                <Zap className="w-5 h-5 text-primary-400" />
                                <span className="text-dark-400">Total Requests</span>
                            </div>
                            <div className="text-2xl font-bold text-white">1,921</div>
                        </div>

                        <div className="p-4 bg-dark-800 border border-dark-700 rounded-2xl">
                            <div className="flex items-center gap-3 mb-2">
                                <Clock className="w-5 h-5 text-blue-400" />
                                <span className="text-dark-400">Avg Response</span>
                            </div>
                            <div className="text-2xl font-bold text-white">42ms</div>
                        </div>

                        <div className="p-4 bg-dark-800 border border-dark-700 rounded-2xl">
                            <div className="flex items-center gap-3 mb-2">
                                <BarChart2 className="w-5 h-5 text-green-400" />
                                <span className="text-dark-400">Success Rate</span>
                            </div>
                            <div className="text-2xl font-bold text-white">99.8%</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Key Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-dark-800 border border-dark-700 rounded-2xl w-[450px] overflow-hidden">
                        <div className="p-6 border-b border-dark-700">
                            <h2 className="text-xl font-bold text-white">Create API Key</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">Key Name</label>
                                <input
                                    type="text"
                                    placeholder="My API Key"
                                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:border-primary-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">Permissions</label>
                                <div className="flex gap-3">
                                    <label className="flex items-center gap-2 text-dark-400">
                                        <input type="checkbox" defaultChecked className="rounded" /> Read
                                    </label>
                                    <label className="flex items-center gap-2 text-dark-400">
                                        <input type="checkbox" className="rounded" /> Write
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-dark-700 flex justify-end gap-3">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="px-4 py-2 text-dark-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button className="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600">
                                Create Key
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
