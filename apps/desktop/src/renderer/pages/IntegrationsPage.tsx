import { useState, useEffect } from 'react';
import {
    Plug, Calendar, Mail, Zap, CheckSquare, Key,
    Check, X, RefreshCw, ExternalLink, Copy, Eye, EyeOff,
    Trash2, Plus, Send, AlertCircle, Bot, Music, Github, MessageSquare, ListTodo
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
} from '../services/integrations';
import { jarvisService, JarvisConfig } from '../services/jarvis-integration-service';
import { discordService, DiscordConfig } from '../services/discord-integration-service';
import { githubService, GitHubConfig } from '../services/github-integration-service';
import { todoistService, TodoistConfig } from '../services/todoist-integration-service';
import { spotifyService, SpotifyConfig } from '../services/spotify-integration-service';

export default function IntegrationsPage() {
    const [google, setGoogle] = useState<GoogleCalendarConfig>(googleCalendarService.getConfig());
    const [outlook, setOutlook] = useState<OutlookCalendarConfig>(outlookCalendarService.getConfig());
    const [zapier, setZapier] = useState<ZapierConfig>(zapierService.getConfig());
    const [clickup, setClickup] = useState<ClickUpConfig>(clickupService.getConfig());
    const [email, setEmail] = useState<EmailConfig>(emailService.getConfig());
    const [api, setApi] = useState<ApiConfig>(apiService.getConfig());

    // New integration states
    const [jarvis, setJarvis] = useState<JarvisConfig>(jarvisService.getConfig());
    const [discord, setDiscord] = useState<DiscordConfig>(discordService.getConfig());
    const [github, setGithub] = useState<GitHubConfig>(githubService.getConfig());
    const [todoist, setTodoist] = useState<TodoistConfig>(todoistService.getConfig());
    const [spotify, setSpotify] = useState<SpotifyConfig>(spotifyService.getConfig());

    const [loading, setLoading] = useState<string | null>(null);
    const [clickupApiKey, setClickupApiKey] = useState('');
    const [emailInput, setEmailInput] = useState('');
    const [newKeyName, setNewKeyName] = useState('');
    const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
    const [expandedCard, setExpandedCard] = useState<string | null>(null);

    // New integration input states
    const [discordWebhook, setDiscordWebhook] = useState('');
    const [githubToken, setGithubToken] = useState('');
    const [todoistToken, setTodoistToken] = useState('');

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
        setJarvis(jarvisService.getConfig());
        setDiscord(discordService.getConfig());
        setGithub(githubService.getConfig());
        setTodoist(todoistService.getConfig());
        setSpotify(spotifyService.getConfig());
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

            {/* New Integrations */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Plug className="w-5 h-5 text-primary-400" />
                    Knowledge & Communication
                </h2>

                {/* Notion */}
                <IntegrationCard
                    id="notion"
                    icon={CheckSquare}
                    title="Notion"
                    description="Sync tasks and notes with Notion databases"
                    connected={false}
                    statusText="Not Connected"
                    iconColor="bg-gradient-to-br from-gray-700 to-gray-900"
                >
                    <div className="space-y-4 pt-4">
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm text-dark-400 block mb-2">Notion API Key</label>
                                <input
                                    type="password"
                                    placeholder="secret_..."
                                    className="input-field w-full"
                                />
                                <p className="text-xs text-dark-500 mt-1">
                                    Get your integration token from notion.so/my-integrations
                                </p>
                            </div>
                            <button
                                className="w-full btn-primary flex items-center justify-center gap-2"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Connect Notion
                            </button>
                        </div>
                    </div>
                </IntegrationCard>

                {/* Slack */}
                <IntegrationCard
                    id="slack"
                    icon={Zap}
                    title="Slack"
                    description="Update status and receive notifications"
                    connected={false}
                    statusText="Not Connected"
                    iconColor="bg-gradient-to-br from-purple-600 to-pink-600"
                >
                    <div className="space-y-4 pt-4">
                        <button
                            className="w-full btn-primary flex items-center justify-center gap-2"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Connect Slack Workspace
                        </button>
                        <p className="text-xs text-dark-500 text-center">
                            Auto-update your Slack status during focus sessions
                        </p>
                    </div>
                </IntegrationCard>
            </div>

            {/* JARVIS Integration - TOP PRIORITY */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Bot className="w-5 h-5 text-cyan-400" />
                    🤖 JARVIS AI Integration
                    <span className="ml-2 px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">Priority</span>
                </h2>

                <IntegrationCard
                    id="jarvis"
                    icon={Bot}
                    title="JARVIS Bridge"
                    description="Connect to JARVIS master AI system"
                    connected={jarvis.enabled}
                    statusText={jarvis.enabled ? 'Connected' : 'Disconnected'}
                    iconColor="bg-gradient-to-br from-cyan-500 to-blue-600"
                >
                    <div className="space-y-4 pt-4">
                        <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                            <p className="text-sm text-cyan-300">
                                🤖 Connect Wakey to your JARVIS AI assistant for voice commands,
                                cross-app automation, and intelligent insights.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-2 bg-dark-700 rounded-lg">
                                <span className="text-sm text-white">Share Activity Data</span>
                                <button
                                    onClick={() => {
                                        jarvisService.updateConfig({ shareActivityData: !jarvis.shareActivityData });
                                        setJarvis(jarvisService.getConfig());
                                    }}
                                    className={`w-10 h-5 rounded-full transition-all ${jarvis.shareActivityData ? 'bg-primary-500' : 'bg-dark-600'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${jarvis.shareActivityData ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-dark-700 rounded-lg">
                                <span className="text-sm text-white">Enable Voice Commands</span>
                                <button
                                    onClick={() => {
                                        jarvisService.updateConfig({ voiceCommandsEnabled: !jarvis.voiceCommandsEnabled });
                                        setJarvis(jarvisService.getConfig());
                                    }}
                                    className={`w-10 h-5 rounded-full transition-all ${jarvis.voiceCommandsEnabled ? 'bg-primary-500' : 'bg-dark-600'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${jarvis.voiceCommandsEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-dark-700 rounded-lg">
                                <span className="text-sm text-white">Receive JARVIS Commands</span>
                                <button
                                    onClick={() => {
                                        jarvisService.updateConfig({ receiveCommands: !jarvis.receiveCommands });
                                        setJarvis(jarvisService.getConfig());
                                    }}
                                    className={`w-10 h-5 rounded-full transition-all ${jarvis.receiveCommands ? 'bg-primary-500' : 'bg-dark-600'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${jarvis.receiveCommands ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                </button>
                            </div>
                        </div>
                        {jarvis.enabled ? (
                            <button
                                onClick={async () => {
                                    jarvisService.disconnect();
                                    setJarvis(jarvisService.getConfig());
                                }}
                                className="w-full px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                            >
                                Disconnect from JARVIS
                            </button>
                        ) : (
                            <button
                                onClick={async () => {
                                    setLoading('jarvis');
                                    await jarvisService.connect('', '');
                                    setJarvis(jarvisService.getConfig());
                                    setLoading(null);
                                }}
                                disabled={loading === 'jarvis'}
                                className="w-full btn-primary flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600"
                            >
                                {loading === 'jarvis' ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        <Bot className="w-4 h-4" />
                                        Connect to JARVIS
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </IntegrationCard>
            </div>

            {/* Social & Communication */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary-400" />
                    Social & Communication
                </h2>

                {/* Discord */}
                <IntegrationCard
                    id="discord"
                    icon={MessageSquare}
                    title="Discord Webhooks"
                    description="Send notifications and daily summaries to Discord"
                    connected={discord.enabled}
                    statusText={discord.enabled ? 'Connected' : 'Not Connected'}
                    iconColor="bg-gradient-to-br from-indigo-500 to-purple-600"
                >
                    <div className="space-y-4 pt-4">
                        {discord.enabled ? (
                            <>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-2 bg-dark-700 rounded-lg">
                                        <span className="text-sm text-white">Daily Summary</span>
                                        <button
                                            onClick={() => {
                                                discordService.updateConfig({ notifyDailySummary: !discord.notifyDailySummary });
                                                setDiscord(discordService.getConfig());
                                            }}
                                            className={`w-10 h-5 rounded-full transition-all ${discord.notifyDailySummary ? 'bg-primary-500' : 'bg-dark-600'}`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${discord.notifyDailySummary ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between p-2 bg-dark-700 rounded-lg">
                                        <span className="text-sm text-white">Achievements</span>
                                        <button
                                            onClick={() => {
                                                discordService.updateConfig({ notifyAchievements: !discord.notifyAchievements });
                                                setDiscord(discordService.getConfig());
                                            }}
                                            className={`w-10 h-5 rounded-full transition-all ${discord.notifyAchievements ? 'bg-primary-500' : 'bg-dark-600'}`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${discord.notifyAchievements ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            discordService.disconnect();
                                            setDiscord(discordService.getConfig());
                                        }}
                                        className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                                    >
                                        Disconnect
                                    </button>
                                    <button
                                        onClick={async () => {
                                            setLoading('discord-test');
                                            await discordService.testWebhook();
                                            setLoading(null);
                                        }}
                                        disabled={loading === 'discord-test'}
                                        className="flex-1 btn-secondary flex items-center justify-center gap-2"
                                    >
                                        {loading === 'discord-test' ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                        Test
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm text-dark-400 block mb-2">Webhook URL</label>
                                    <input
                                        type="text"
                                        value={discordWebhook}
                                        onChange={(e) => setDiscordWebhook(e.target.value)}
                                        placeholder="https://discord.com/api/webhooks/..."
                                        className="input-field w-full"
                                    />
                                    <p className="text-xs text-dark-500 mt-1">
                                        Create a webhook in Discord server settings → Integrations
                                    </p>
                                </div>
                                <button
                                    onClick={async () => {
                                        if (!discordWebhook.trim()) return;
                                        setLoading('discord');
                                        const result = await discordService.connect(discordWebhook);
                                        if (result.success) {
                                            setDiscordWebhook('');
                                        }
                                        setDiscord(discordService.getConfig());
                                        setLoading(null);
                                    }}
                                    disabled={loading === 'discord' || !discordWebhook.trim()}
                                    className="w-full btn-primary flex items-center justify-center gap-2"
                                >
                                    {loading === 'discord' ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Connecting...
                                        </>
                                    ) : (
                                        <>
                                            <MessageSquare className="w-4 h-4" />
                                            Connect Discord
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </IntegrationCard>
            </div>

            {/* Development & Productivity */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Github className="w-5 h-5 text-primary-400" />
                    Development & Tasks
                </h2>

                {/* GitHub */}
                <IntegrationCard
                    id="github"
                    icon={Github}
                    title="GitHub"
                    description="Track commits and correlate with focus sessions"
                    connected={github.enabled}
                    statusText={github.enabled ? `@${github.username}` : 'Not Connected'}
                    iconColor="bg-gradient-to-br from-gray-700 to-gray-900"
                >
                    <div className="space-y-4 pt-4">
                        {github.enabled ? (
                            <>
                                <div className="flex items-center gap-3 p-3 bg-dark-700 rounded-lg">
                                    {github.avatarUrl && (
                                        <img src={github.avatarUrl} alt="GitHub" className="w-8 h-8 rounded-full" />
                                    )}
                                    <div>
                                        <p className="text-white font-medium">{github.username}</p>
                                        <p className="text-xs text-dark-400">Connected</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-2 bg-dark-700 rounded-lg">
                                        <span className="text-sm text-white">Track Commits</span>
                                        <button
                                            onClick={() => {
                                                githubService.updateConfig({ trackCommits: !github.trackCommits });
                                                setGithub(githubService.getConfig());
                                            }}
                                            className={`w-10 h-5 rounded-full transition-all ${github.trackCommits ? 'bg-primary-500' : 'bg-dark-600'}`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${github.trackCommits ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between p-2 bg-dark-700 rounded-lg">
                                        <span className="text-sm text-white">Correlate with Focus</span>
                                        <button
                                            onClick={() => {
                                                githubService.updateConfig({ correlateWithFocus: !github.correlateWithFocus });
                                                setGithub(githubService.getConfig());
                                            }}
                                            className={`w-10 h-5 rounded-full transition-all ${github.correlateWithFocus ? 'bg-primary-500' : 'bg-dark-600'}`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${github.correlateWithFocus ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        githubService.disconnect();
                                        setGithub(githubService.getConfig());
                                    }}
                                    className="w-full px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                                >
                                    Disconnect
                                </button>
                            </>
                        ) : (
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm text-dark-400 block mb-2">Personal Access Token</label>
                                    <input
                                        type="password"
                                        value={githubToken}
                                        onChange={(e) => setGithubToken(e.target.value)}
                                        placeholder="ghp_..."
                                        className="input-field w-full"
                                    />
                                    <p className="text-xs text-dark-500 mt-1">
                                        Generate at github.com/settings/tokens
                                    </p>
                                </div>
                                <button
                                    onClick={async () => {
                                        if (!githubToken.trim()) return;
                                        setLoading('github');
                                        const result = await githubService.connect(githubToken);
                                        if (result.success) {
                                            setGithubToken('');
                                        }
                                        setGithub(githubService.getConfig());
                                        setLoading(null);
                                    }}
                                    disabled={loading === 'github' || !githubToken.trim()}
                                    className="w-full btn-primary flex items-center justify-center gap-2"
                                >
                                    {loading === 'github' ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Connecting...
                                        </>
                                    ) : (
                                        <>
                                            <Github className="w-4 h-4" />
                                            Connect GitHub
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </IntegrationCard>

                {/* Todoist */}
                <IntegrationCard
                    id="todoist"
                    icon={ListTodo}
                    title="Todoist"
                    description="Sync tasks and auto-complete during focus"
                    connected={todoist.enabled}
                    statusText={todoist.enabled ? 'Connected' : 'Not Connected'}
                    iconColor="bg-gradient-to-br from-red-500 to-orange-500"
                >
                    <div className="space-y-4 pt-4">
                        {todoist.enabled ? (
                            <>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-2 bg-dark-700 rounded-lg">
                                        <span className="text-sm text-white">Sync Tasks</span>
                                        <button
                                            onClick={() => {
                                                todoistService.updateConfig({ syncTasks: !todoist.syncTasks });
                                                setTodoist(todoistService.getConfig());
                                            }}
                                            className={`w-10 h-5 rounded-full transition-all ${todoist.syncTasks ? 'bg-primary-500' : 'bg-dark-600'}`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${todoist.syncTasks ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between p-2 bg-dark-700 rounded-lg">
                                        <span className="text-sm text-white">Auto-Complete in Focus</span>
                                        <button
                                            onClick={() => {
                                                todoistService.updateConfig({ autoComplete: !todoist.autoComplete });
                                                setTodoist(todoistService.getConfig());
                                            }}
                                            className={`w-10 h-5 rounded-full transition-all ${todoist.autoComplete ? 'bg-primary-500' : 'bg-dark-600'}`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${todoist.autoComplete ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        todoistService.disconnect();
                                        setTodoist(todoistService.getConfig());
                                    }}
                                    className="w-full px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                                >
                                    Disconnect
                                </button>
                            </>
                        ) : (
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm text-dark-400 block mb-2">API Token</label>
                                    <input
                                        type="password"
                                        value={todoistToken}
                                        onChange={(e) => setTodoistToken(e.target.value)}
                                        placeholder="Your Todoist API token"
                                        className="input-field w-full"
                                    />
                                    <p className="text-xs text-dark-500 mt-1">
                                        Find at todoist.com/prefs/integrations
                                    </p>
                                </div>
                                <button
                                    onClick={async () => {
                                        if (!todoistToken.trim()) return;
                                        setLoading('todoist');
                                        const result = await todoistService.connect(todoistToken);
                                        if (result.success) {
                                            setTodoistToken('');
                                        }
                                        setTodoist(todoistService.getConfig());
                                        setLoading(null);
                                    }}
                                    disabled={loading === 'todoist' || !todoistToken.trim()}
                                    className="w-full btn-primary flex items-center justify-center gap-2"
                                >
                                    {loading === 'todoist' ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Connecting...
                                        </>
                                    ) : (
                                        <>
                                            <ListTodo className="w-4 h-4" />
                                            Connect Todoist
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </IntegrationCard>
            </div>

            {/* Music & Focus */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Music className="w-5 h-5 text-primary-400" />
                    Music & Focus
                </h2>

                {/* Spotify */}
                <IntegrationCard
                    id="spotify"
                    icon={Music}
                    title="Spotify"
                    description="Control music during focus sessions"
                    connected={spotify.enabled}
                    statusText={spotify.enabled ? spotify.displayName || 'Connected' : 'Not Connected'}
                    iconColor="bg-gradient-to-br from-green-500 to-green-600"
                >
                    <div className="space-y-4 pt-4">
                        {spotify.enabled ? (
                            <>
                                <div className="flex items-center gap-3 p-3 bg-dark-700 rounded-lg">
                                    <Music className="w-8 h-8 text-green-400" />
                                    <div>
                                        <p className="text-white font-medium">{spotify.displayName}</p>
                                        <p className="text-xs text-dark-400">Spotify Connected</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-2 bg-dark-700 rounded-lg">
                                        <span className="text-sm text-white">Auto-Play on Focus</span>
                                        <button
                                            onClick={() => {
                                                spotifyService.updateConfig({ autoPlayOnFocus: !spotify.autoPlayOnFocus });
                                                setSpotify(spotifyService.getConfig());
                                            }}
                                            className={`w-10 h-5 rounded-full transition-all ${spotify.autoPlayOnFocus ? 'bg-primary-500' : 'bg-dark-600'}`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${spotify.autoPlayOnFocus ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between p-2 bg-dark-700 rounded-lg">
                                        <span className="text-sm text-white">Pause on Break</span>
                                        <button
                                            onClick={() => {
                                                spotifyService.updateConfig({ autoPauseOnBreak: !spotify.autoPauseOnBreak });
                                                setSpotify(spotifyService.getConfig());
                                            }}
                                            className={`w-10 h-5 rounded-full transition-all ${spotify.autoPauseOnBreak ? 'bg-primary-500' : 'bg-dark-600'}`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${spotify.autoPauseOnBreak ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        spotifyService.disconnect();
                                        setSpotify(spotifyService.getConfig());
                                    }}
                                    className="w-full px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                                >
                                    Disconnect
                                </button>
                            </>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-sm text-dark-400">
                                    Connect Spotify to automatically play focus music and control playback during sessions.
                                </p>
                                <button
                                    onClick={() => {
                                        // Open Spotify OAuth flow
                                        window.open(spotifyService.getAuthUrl(), '_blank');
                                    }}
                                    className="w-full btn-primary flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600"
                                >
                                    <Music className="w-4 h-4" />
                                    Connect Spotify
                                </button>
                                <p className="text-xs text-dark-500 text-center">
                                    Requires Spotify Premium for playback control
                                </p>
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
                            href="https://wakey.app/developers/api"
                            target="_blank"
                            rel="noopener noreferrer"
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
