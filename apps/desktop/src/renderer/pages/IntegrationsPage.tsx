import { useState, useEffect } from 'react';
import {
    Plug, Calendar, Mail, Zap, CheckSquare, Key,
    Check, X, RefreshCw, ExternalLink, Copy, Eye, EyeOff,
    Settings, Trash2, Plus, Send, Clock, AlertCircle
} from 'lucide-react';
import {
    googleCalendarService,
    outlookCalendarService,
    zapierService,
    clickupService,
    emailService,
    apiService,
    GoogleCalendarConfig,
    OutlookCalendarConfig,
    ZapierConfig,
    ClickUpConfig,
    EmailConfig,
    ApiConfig,
    ApiKey,
    getAllIntegrations,
} from '../services/integrations';

export default function IntegrationsPage() {
    const [google, setGoogle] = useState<GoogleCalendarConfig>(googleCalendarService.getConfig());
    const [outlook, setOutlook] = useState<OutlookCalendarConfig>(outlookCalendarService.getConfig());
    const [zapier, setZapier] = useState<ZapierConfig>(zapierService.getConfig());
    const [clickup, setClickup] = useState<ClickUpConfig>(clickupService.getConfig());
    const [email, setEmail] = useState<EmailConfig>(emailService.getConfig());
    const [api, setApi] = useState<ApiConfig>(apiService.getConfig());

    const [loading, setLoading] = useState<string | null>(null);
    const [clickupApiKey, setClickupApiKey] = useState('');
    const [emailInput, setEmailInput] = useState('');
    const [newKeyName, setNewKeyName] = useState('');
    const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
    const [expandedCard, setExpandedCard] = useState<string | null>(null);

    useEffect(() => {
        refreshAll();
    }, []);

    const refreshAll = () => {
        setGoogle(googleCalendarService.getConfig());
        setOutlook(outlookCalendarService.getConfig());
        setZapier(zapierService.getConfig());
        setClickup(clickupService.getConfig());
        setEmail(emailService.getConfig());
        setApi(apiService.getConfig());
    };

    // Google Calendar handlers
    const handleGoogleConnect = async () => {
        setLoading('google');
        const result = await googleCalendarService.connect();
        if (result.success) {
            setGoogle(googleCalendarService.getConfig());
        }
        setLoading(null);
    };

    const handleGoogleDisconnect = async () => {
        await googleCalendarService.disconnect();
        setGoogle(googleCalendarService.getConfig());
    };

    // Outlook handlers
    const handleOutlookConnect = async () => {
        setLoading('outlook');
        const result = await outlookCalendarService.connect();
        if (result.success) {
            setOutlook(outlookCalendarService.getConfig());
        }
        setLoading(null);
    };

    const handleOutlookDisconnect = async () => {
        await outlookCalendarService.disconnect();
        setOutlook(outlookCalendarService.getConfig());
    };

    // Zapier handlers
    const handleZapierConnect = async () => {
        setLoading('zapier');
        const result = await zapierService.connect();
        if (result.success) {
            setZapier(zapierService.getConfig());
        }
        setLoading(null);
    };

    const handleZapierDisconnect = async () => {
        await zapierService.disconnect();
        setZapier(zapierService.getConfig());
    };

    const handleZapierTest = async () => {
        setLoading('zapier-test');
        await zapierService.testWebhook();
        setZapier(zapierService.getConfig());
        setLoading(null);
    };

    // ClickUp handlers
    const handleClickUpConnect = async () => {
        if (!clickupApiKey.trim()) return;
        setLoading('clickup');
        const result = await clickupService.connect(clickupApiKey);
        if (result.success) {
            setClickup(clickupService.getConfig());
            setClickupApiKey('');
        }
        setLoading(null);
    };

    const handleClickUpDisconnect = async () => {
        await clickupService.disconnect();
        setClickup(clickupService.getConfig());
    };

    // Email handlers
    const handleEmailConfigure = async () => {
        if (!emailInput.trim()) return;
        setLoading('email');
        const result = await emailService.configure(emailInput);
        if (result.success) {
            setEmail(emailService.getConfig());
            setEmailInput('');
        }
        setLoading(null);
    };

    const handleEmailDisable = async () => {
        await emailService.disable();
        setEmail(emailService.getConfig());
    };

    const handleTestEmail = async () => {
        setLoading('email-test');
        await emailService.sendTestEmail();
        setLoading(null);
    };

    // API handlers
    const handleCreateApiKey = () => {
        if (!newKeyName.trim()) return;
        apiService.createKey(newKeyName, ['read', 'write']);
        setApi(apiService.getConfig());
        setNewKeyName('');
    };

    const handleDeleteApiKey = (keyId: string) => {
        apiService.deleteKey(keyId);
        setApi(apiService.getConfig());
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'Never';
        return new Date(dateStr).toLocaleString();
    };

    const IntegrationCard = ({
        icon: Icon,
        title,
        description,
        connected,
        statusText,
        iconColor,
        children,
        id,
    }: {
        icon: React.ElementType;
        title: string;
        description: string;
        connected: boolean;
        statusText: string;
        iconColor: string;
        children: React.ReactNode;
        id: string;
    }) => (
        <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
            <div
                className="p-4 cursor-pointer hover:bg-dark-750 transition-colors"
                onClick={() => setExpandedCard(expandedCard === id ? null : id)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${iconColor}`}>
                            <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">{title}</h3>
                            <p className="text-sm text-dark-400">{description}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${connected
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-dark-700 text-dark-400'
                            }`}>
                            {connected ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                            {statusText}
                        </div>
                    </div>
                </div>
            </div>
            {expandedCard === id && (
                <div className="p-4 pt-0 border-t border-dark-700 mt-2">
                    {children}
                </div>
            )}
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Plug className="w-7 h-7 text-primary-400" />
                        Integrations
                    </h1>
                    <p className="text-dark-400 mt-1">
                        Connect your favorite tools and services
                    </p>
                </div>
                <button
                    onClick={refreshAll}
                    className="btn-secondary flex items-center gap-2"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Calendar Integrations */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary-400" />
                    Calendar Integrations
                </h2>

                {/* Google Calendar */}
                <IntegrationCard
                    id="google"
                    icon={Calendar}
                    title="Google Calendar"
                    description="Sync events and auto-detect meetings"
                    connected={google.connected}
                    statusText={google.connected ? 'Connected' : 'Not Connected'}
                    iconColor="bg-gradient-to-br from-blue-500 to-blue-600"
                >
                    <div className="space-y-4 pt-4">
                        {google.connected ? (
                            <>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-dark-400">Account</span>
                                    <span className="text-white">{google.email}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-dark-400">Last Sync</span>
                                    <span className="text-white">{formatDate(google.lastSync)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-dark-400 text-sm">Auto-detect Meetings</span>
                                    <button
                                        onClick={() => {
                                            googleCalendarService.updateSettings({
                                                autoDetectMeetings: !google.autoDetectMeetings
                                            });
                                            setGoogle(googleCalendarService.getConfig());
                                        }}
                                        className={`w-10 h-5 rounded-full transition-all ${google.autoDetectMeetings ? 'bg-primary-500' : 'bg-dark-600'
                                            }`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${google.autoDetectMeetings ? 'translate-x-5' : 'translate-x-0.5'
                                            }`} />
                                    </button>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={handleGoogleDisconnect}
                                        className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                                    >
                                        Disconnect
                                    </button>
                                    <button className="flex-1 btn-secondary flex items-center justify-center gap-2">
                                        <RefreshCw className="w-4 h-4" />
                                        Sync Now
                                    </button>
                                </div>
                            </>
                        ) : (
                            <button
                                onClick={handleGoogleConnect}
                                disabled={loading === 'google'}
                                className="w-full btn-primary flex items-center justify-center gap-2"
                            >
                                {loading === 'google' ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        <ExternalLink className="w-4 h-4" />
                                        Connect Google Calendar
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </IntegrationCard>

                {/* Outlook Calendar */}
                <IntegrationCard
                    id="outlook"
                    icon={Calendar}
                    title="Outlook Calendar"
                    description="Sync Microsoft 365 events"
                    connected={outlook.connected}
                    statusText={outlook.connected ? 'Connected' : 'Not Connected'}
                    iconColor="bg-gradient-to-br from-blue-600 to-indigo-600"
                >
                    <div className="space-y-4 pt-4">
                        {outlook.connected ? (
                            <>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-dark-400">Account</span>
                                    <span className="text-white">{outlook.email}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-dark-400">Last Sync</span>
                                    <span className="text-white">{formatDate(outlook.lastSync)}</span>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={handleOutlookDisconnect}
                                        className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                                    >
                                        Disconnect
                                    </button>
                                    <button className="flex-1 btn-secondary flex items-center justify-center gap-2">
                                        <RefreshCw className="w-4 h-4" />
                                        Sync Now
                                    </button>
                                </div>
                            </>
                        ) : (
                            <button
                                onClick={handleOutlookConnect}
                                disabled={loading === 'outlook'}
                                className="w-full btn-primary flex items-center justify-center gap-2"
                            >
                                {loading === 'outlook' ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        <ExternalLink className="w-4 h-4" />
                                        Connect Outlook Calendar
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </IntegrationCard>
            </div>

            {/* Automation & Productivity */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary-400" />
                    Automation & Productivity
                </h2>

                {/* Zapier */}
                <IntegrationCard
                    id="zapier"
                    icon={Zap}
                    title="Zapier"
                    description="Connect to 5,000+ apps"
                    connected={zapier.connected}
                    statusText={zapier.connected ? 'Connected' : 'Not Connected'}
                    iconColor="bg-gradient-to-br from-orange-500 to-orange-600"
                >
                    <div className="space-y-4 pt-4">
                        {zapier.connected ? (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm text-dark-400">Webhook URL</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={zapier.webhookUrl}
                                            readOnly
                                            className="input-field flex-1 text-sm font-mono"
                                        />
                                        <button
                                            onClick={() => copyToClipboard(zapier.webhookUrl)}
                                            className="btn-secondary"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-dark-400">Outgoing Triggers</label>
                                    <div className="space-y-2">
                                        {Object.entries(zapier.outgoingTriggers).map(([key, enabled]) => (
                                            <div key={key} className="flex items-center justify-between p-2 bg-dark-700 rounded-lg">
                                                <span className="text-sm text-white capitalize">
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        zapierService.updateTriggers({
                                                            [key]: !enabled
                                                        } as Record<string, boolean>);
                                                        setZapier(zapierService.getConfig());
                                                    }}
                                                    className={`w-10 h-5 rounded-full transition-all ${enabled ? 'bg-primary-500' : 'bg-dark-600'
                                                        }`}
                                                >
                                                    <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0.5'
                                                        }`} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-dark-400">Last Trigger</span>
                                    <span className="text-white">{formatDate(zapier.lastTrigger)}</span>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={handleZapierDisconnect}
                                        className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                                    >
                                        Disconnect
                                    </button>
                                    <button
                                        onClick={handleZapierTest}
                                        disabled={loading === 'zapier-test'}
                                        className="flex-1 btn-secondary flex items-center justify-center gap-2"
                                    >
                                        {loading === 'zapier-test' ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                        Test Webhook
                                    </button>
                                </div>
                            </>
                        ) : (
                            <button
                                onClick={handleZapierConnect}
                                disabled={loading === 'zapier'}
                                className="w-full btn-primary flex items-center justify-center gap-2"
                            >
                                {loading === 'zapier' ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4" />
                                        Enable Zapier Integration
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </IntegrationCard>

                {/* ClickUp */}
                <IntegrationCard
                    id="clickup"
                    icon={CheckSquare}
                    title="ClickUp"
                    description="Sync tasks and projects"
                    connected={clickup.connected}
                    statusText={clickup.connected ? 'Connected' : 'Not Connected'}
                    iconColor="bg-gradient-to-br from-purple-500 to-pink-500"
                >
                    <div className="space-y-4 pt-4">
                        {clickup.connected ? (
                            <>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-dark-400">Workspace</span>
                                    <span className="text-white">{clickup.workspaceName}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-dark-400">Last Sync</span>
                                    <span className="text-white">{formatDate(clickup.lastSync)}</span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-2 bg-dark-700 rounded-lg">
                                        <span className="text-sm text-white">Sync Tasks</span>
                                        <button
                                            onClick={() => {
                                                clickupService.updateSettings({
                                                    syncTasks: !clickup.syncTasks
                                                });
                                                setClickup(clickupService.getConfig());
                                            }}
                                            className={`w-10 h-5 rounded-full transition-all ${clickup.syncTasks ? 'bg-primary-500' : 'bg-dark-600'
                                                }`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${clickup.syncTasks ? 'translate-x-5' : 'translate-x-0.5'
                                                }`} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between p-2 bg-dark-700 rounded-lg">
                                        <span className="text-sm text-white">Sync Projects</span>
                                        <button
                                            onClick={() => {
                                                clickupService.updateSettings({
                                                    syncProjects: !clickup.syncProjects
                                                });
                                                setClickup(clickupService.getConfig());
                                            }}
                                            className={`w-10 h-5 rounded-full transition-all ${clickup.syncProjects ? 'bg-primary-500' : 'bg-dark-600'
                                                }`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${clickup.syncProjects ? 'translate-x-5' : 'translate-x-0.5'
                                                }`} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={handleClickUpDisconnect}
                                        className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                                    >
                                        Disconnect
                                    </button>
                                    <button className="flex-1 btn-secondary flex items-center justify-center gap-2">
                                        <RefreshCw className="w-4 h-4" />
                                        Sync Now
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm text-dark-400 block mb-2">API Key</label>
                                    <input
                                        type="password"
                                        value={clickupApiKey}
                                        onChange={(e) => setClickupApiKey(e.target.value)}
                                        placeholder="pk_..."
                                        className="input-field w-full"
                                    />
                                    <p className="text-xs text-dark-500 mt-1">
                                        Get your API key from ClickUp Settings → Apps
                                    </p>
                                </div>
                                <button
                                    onClick={handleClickUpConnect}
                                    disabled={loading === 'clickup' || !clickupApiKey.trim()}
                                    className="w-full btn-primary flex items-center justify-center gap-2"
                                >
                                    {loading === 'clickup' ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Connecting...
                                        </>
                                    ) : (
                                        <>
                                            <CheckSquare className="w-4 h-4" />
                                            Connect ClickUp
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </IntegrationCard>
            </div>

            {/* Notifications */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary-400" />
                    Notifications
                </h2>

                {/* Email Notifications */}
                <IntegrationCard
                    id="email"
                    icon={Mail}
                    title="Email Notifications"
                    description="Daily and weekly reports via email"
                    connected={email.configured}
                    statusText={email.configured ? 'Configured' : 'Not Configured'}
                    iconColor="bg-gradient-to-br from-green-500 to-emerald-600"
                >
                    <div className="space-y-4 pt-4">
                        {email.configured ? (
                            <>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-dark-400">Email</span>
                                    <span className="text-white">{email.email}</span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-2 bg-dark-700 rounded-lg">
                                        <div>
                                            <span className="text-sm text-white">Daily Report</span>
                                            <span className="text-xs text-dark-400 ml-2">
                                                at {email.dailyReportTime}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                emailService.updateSettings({
                                                    dailyReport: !email.dailyReport
                                                });
                                                setEmail(emailService.getConfig());
                                            }}
                                            className={`w-10 h-5 rounded-full transition-all ${email.dailyReport ? 'bg-primary-500' : 'bg-dark-600'
                                                }`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${email.dailyReport ? 'translate-x-5' : 'translate-x-0.5'
                                                }`} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between p-2 bg-dark-700 rounded-lg">
                                        <div>
                                            <span className="text-sm text-white">Weekly Report</span>
                                            <span className="text-xs text-dark-400 ml-2">
                                                on {email.weeklyReportDay}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                emailService.updateSettings({
                                                    weeklyReport: !email.weeklyReport
                                                });
                                                setEmail(emailService.getConfig());
                                            }}
                                            className={`w-10 h-5 rounded-full transition-all ${email.weeklyReport ? 'bg-primary-500' : 'bg-dark-600'
                                                }`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${email.weeklyReport ? 'translate-x-5' : 'translate-x-0.5'
                                                }`} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between p-2 bg-dark-700 rounded-lg">
                                        <span className="text-sm text-white">Break Reminders</span>
                                        <button
                                            onClick={() => {
                                                emailService.updateSettings({
                                                    breakReminders: !email.breakReminders
                                                });
                                                setEmail(emailService.getConfig());
                                            }}
                                            className={`w-10 h-5 rounded-full transition-all ${email.breakReminders ? 'bg-primary-500' : 'bg-dark-600'
                                                }`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${email.breakReminders ? 'translate-x-5' : 'translate-x-0.5'
                                                }`} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={handleEmailDisable}
                                        className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                                    >
                                        Disable
                                    </button>
                                    <button
                                        onClick={handleTestEmail}
                                        disabled={loading === 'email-test'}
                                        className="flex-1 btn-secondary flex items-center justify-center gap-2"
                                    >
                                        {loading === 'email-test' ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                        Send Test
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm text-dark-400 block mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={emailInput}
                                        onChange={(e) => setEmailInput(e.target.value)}
                                        placeholder="you@example.com"
                                        className="input-field w-full"
                                    />
                                </div>
                                <button
                                    onClick={handleEmailConfigure}
                                    disabled={loading === 'email' || !emailInput.trim()}
                                    className="w-full btn-primary flex items-center justify-center gap-2"
                                >
                                    {loading === 'email' ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Configuring...
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="w-4 h-4" />
                                            Enable Notifications
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </IntegrationCard>
            </div>

            {/* Developer */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Key className="w-5 h-5 text-primary-400" />
                    Developer
                </h2>

                {/* API Access */}
                <IntegrationCard
                    id="api"
                    icon={Key}
                    title="API Access"
                    description="Manage API keys and access"
                    connected={api.enabled}
                    statusText={api.enabled ? `${api.keys.length} Keys` : 'No Keys'}
                    iconColor="bg-gradient-to-br from-gray-600 to-gray-700"
                >
                    <div className="space-y-4 pt-4">
                        {/* Create New Key */}
                        <div>
                            <label className="text-sm text-dark-400 block mb-2">Create New API Key</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newKeyName}
                                    onChange={(e) => setNewKeyName(e.target.value)}
                                    placeholder="Key name (e.g., Production)"
                                    className="input-field flex-1"
                                />
                                <button
                                    onClick={handleCreateApiKey}
                                    disabled={!newKeyName.trim()}
                                    className="btn-primary"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Existing Keys */}
                        {api.keys.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-sm text-dark-400">Your API Keys</label>
                                {api.keys.map((key) => (
                                    <div key={key.id} className="p-3 bg-dark-700 rounded-lg space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-white">{key.name}</span>
                                            <button
                                                onClick={() => handleDeleteApiKey(key.id)}
                                                className="text-red-400 hover:text-red-300"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type={showKeys[key.id] ? 'text' : 'password'}
                                                value={key.key}
                                                readOnly
                                                className="input-field flex-1 text-sm font-mono"
                                            />
                                            <button
                                                onClick={() => setShowKeys({
                                                    ...showKeys,
                                                    [key.id]: !showKeys[key.id]
                                                })}
                                                className="btn-secondary"
                                            >
                                                {showKeys[key.id] ? (
                                                    <EyeOff className="w-4 h-4" />
                                                ) : (
                                                    <Eye className="w-4 h-4" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => copyToClipboard(key.key)}
                                                className="btn-secondary"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-dark-400">
                                            <span>Created: {formatDate(key.createdAt)}</span>
                                            <span className="flex gap-1">
                                                {key.permissions.map(p => (
                                                    <span key={p} className="px-2 py-0.5 bg-dark-600 rounded">
                                                        {p}
                                                    </span>
                                                ))}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Rate Limit Info */}
                        <div className="flex items-center gap-2 p-3 bg-dark-700/50 rounded-lg text-sm">
                            <AlertCircle className="w-4 h-4 text-primary-400" />
                            <span className="text-dark-400">
                                Rate limit: <span className="text-white">{api.rateLimit} requests/min</span>
                            </span>
                        </div>

                        {/* Documentation Link */}
                        <a
                            href="#"
                            className="flex items-center justify-center gap-2 text-primary-400 hover:text-primary-300 text-sm"
                        >
                            <ExternalLink className="w-4 h-4" />
                            View API Documentation
                        </a>
                    </div>
                </IntegrationCard>
            </div>
        </div>
    );
}
