// Integration Services for Wakey
// Manages connections to external services: Google Calendar, Outlook, Zapier, ClickUp, Email

// ============================================
// TYPES & INTERFACES
// ============================================

export interface GoogleCalendarConfig {
    connected: boolean;
    email?: string;
    accessToken?: string;
    syncEnabled: boolean;
    syncFrequency: number; // minutes
    lastSync?: string;
    autoDetectMeetings: boolean;
}

export interface OutlookCalendarConfig {
    connected: boolean;
    email?: string;
    accessToken?: string;
    syncEnabled: boolean;
    syncFrequency: number;
    lastSync?: string;
}

export interface ZapierConfig {
    connected: boolean;
    webhookUrl: string;
    outgoingTriggers: {
        focusSessionComplete: boolean;
        taskComplete: boolean;
        dailySummary: boolean;
        goalAchieved: boolean;
    };
    lastTrigger?: string;
}

export interface ClickUpConfig {
    connected: boolean;
    apiKey?: string;
    workspaceId?: string;
    workspaceName?: string;
    syncTasks: boolean;
    syncProjects: boolean;
    lastSync?: string;
}

export interface EmailConfig {
    configured: boolean;
    email: string;
    dailyReport: boolean;
    dailyReportTime: string;
    weeklyReport: boolean;
    weeklyReportDay: 'sunday' | 'monday' | 'friday';
    focusAlerts: boolean;
    breakReminders: boolean;
}

export interface ApiKey {
    id: string;
    name: string;
    key: string;
    createdAt: string;
    lastUsed?: string;
    permissions: ('read' | 'write')[];
}

export interface ApiConfig {
    keys: ApiKey[];
    enabled: boolean;
    rateLimit: number; // requests per minute
}

export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    isAllDay: boolean;
    category: 'meeting' | 'focus' | 'break' | 'event';
    source: 'google' | 'outlook';
    attendees?: string[];
}

export interface IntegrationsState {
    google: GoogleCalendarConfig;
    outlook: OutlookCalendarConfig;
    zapier: ZapierConfig;
    clickup: ClickUpConfig;
    email: EmailConfig;
    api: ApiConfig;
}

// ============================================
// DEFAULT STATE
// ============================================

const defaultState: IntegrationsState = {
    google: {
        connected: false,
        syncEnabled: true,
        syncFrequency: 15,
        autoDetectMeetings: true,
    },
    outlook: {
        connected: false,
        syncEnabled: true,
        syncFrequency: 15,
    },
    zapier: {
        connected: false,
        webhookUrl: '',
        outgoingTriggers: {
            focusSessionComplete: true,
            taskComplete: true,
            dailySummary: false,
            goalAchieved: true,
        },
    },
    clickup: {
        connected: false,
        syncTasks: true,
        syncProjects: true,
    },
    email: {
        configured: false,
        email: '',
        dailyReport: true,
        dailyReportTime: '18:00',
        weeklyReport: true,
        weeklyReportDay: 'friday',
        focusAlerts: false,
        breakReminders: true,
    },
    api: {
        keys: [],
        enabled: false,
        rateLimit: 100,
    },
};

// ============================================
// STORAGE
// ============================================

const STORAGE_KEY = 'wakey_integrations';

function loadIntegrations(): IntegrationsState {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return { ...defaultState, ...JSON.parse(stored) };
        }
    } catch (error) {
        console.error('Failed to load integrations:', error);
    }
    return defaultState;
}

function saveIntegrations(state: IntegrationsState): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error('Failed to save integrations:', error);
    }
}

// ============================================
// GOOGLE CALENDAR SERVICE
// ============================================

export const googleCalendarService = {
    getConfig(): GoogleCalendarConfig {
        return loadIntegrations().google;
    },

    async connect(): Promise<{ success: boolean; email?: string; error?: string }> {
        // Simulate OAuth flow
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock successful connection
        const mockEmail = 'user@gmail.com';
        const state = loadIntegrations();
        state.google = {
            ...state.google,
            connected: true,
            email: mockEmail,
            accessToken: 'mock_google_token_' + Date.now(),
            lastSync: new Date().toISOString(),
        };
        saveIntegrations(state);

        return { success: true, email: mockEmail };
    },

    async disconnect(): Promise<void> {
        const state = loadIntegrations();
        state.google = {
            ...defaultState.google,
        };
        saveIntegrations(state);
    },

    async syncEvents(): Promise<CalendarEvent[]> {
        const config = this.getConfig();
        if (!config.connected) return [];

        // Mock calendar events
        const now = new Date();
        const events: CalendarEvent[] = [
            {
                id: 'g1',
                title: 'Team Standup',
                start: new Date(now.getTime() + 2 * 60 * 60 * 1000),
                end: new Date(now.getTime() + 2.5 * 60 * 60 * 1000),
                isAllDay: false,
                category: 'meeting',
                source: 'google',
                attendees: ['john@company.com', 'jane@company.com'],
            },
            {
                id: 'g2',
                title: 'Deep Work Block',
                start: new Date(now.getTime() + 4 * 60 * 60 * 1000),
                end: new Date(now.getTime() + 6 * 60 * 60 * 1000),
                isAllDay: false,
                category: 'focus',
                source: 'google',
            },
            {
                id: 'g3',
                title: 'Project Review',
                start: new Date(now.getTime() + 24 * 60 * 60 * 1000),
                end: new Date(now.getTime() + 25 * 60 * 60 * 1000),
                isAllDay: false,
                category: 'meeting',
                source: 'google',
            },
        ];

        // Update last sync
        const state = loadIntegrations();
        state.google.lastSync = new Date().toISOString();
        saveIntegrations(state);

        return events;
    },

    updateSettings(settings: Partial<GoogleCalendarConfig>): void {
        const state = loadIntegrations();
        state.google = { ...state.google, ...settings };
        saveIntegrations(state);
    },
};

// ============================================
// OUTLOOK CALENDAR SERVICE
// ============================================

export const outlookCalendarService = {
    getConfig(): OutlookCalendarConfig {
        return loadIntegrations().outlook;
    },

    async connect(): Promise<{ success: boolean; email?: string; error?: string }> {
        await new Promise(resolve => setTimeout(resolve, 1500));

        const mockEmail = 'user@outlook.com';
        const state = loadIntegrations();
        state.outlook = {
            ...state.outlook,
            connected: true,
            email: mockEmail,
            accessToken: 'mock_outlook_token_' + Date.now(),
            lastSync: new Date().toISOString(),
        };
        saveIntegrations(state);

        return { success: true, email: mockEmail };
    },

    async disconnect(): Promise<void> {
        const state = loadIntegrations();
        state.outlook = { ...defaultState.outlook };
        saveIntegrations(state);
    },

    async syncEvents(): Promise<CalendarEvent[]> {
        const config = this.getConfig();
        if (!config.connected) return [];

        const now = new Date();
        const events: CalendarEvent[] = [
            {
                id: 'o1',
                title: 'Client Call',
                start: new Date(now.getTime() + 3 * 60 * 60 * 1000),
                end: new Date(now.getTime() + 4 * 60 * 60 * 1000),
                isAllDay: false,
                category: 'meeting',
                source: 'outlook',
            },
        ];

        const state = loadIntegrations();
        state.outlook.lastSync = new Date().toISOString();
        saveIntegrations(state);

        return events;
    },

    updateSettings(settings: Partial<OutlookCalendarConfig>): void {
        const state = loadIntegrations();
        state.outlook = { ...state.outlook, ...settings };
        saveIntegrations(state);
    },
};

// ============================================
// ZAPIER SERVICE
// ============================================

function generateWebhookUrl(): string {
    const id = Math.random().toString(36).substring(2, 15);
    return `https://hooks.wakey.app/zapier/${id}`;
}

export const zapierService = {
    getConfig(): ZapierConfig {
        return loadIntegrations().zapier;
    },

    async connect(): Promise<{ success: boolean; webhookUrl: string }> {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const webhookUrl = generateWebhookUrl();
        const state = loadIntegrations();
        state.zapier = {
            ...state.zapier,
            connected: true,
            webhookUrl,
        };
        saveIntegrations(state);

        return { success: true, webhookUrl };
    },

    async disconnect(): Promise<void> {
        const state = loadIntegrations();
        state.zapier = { ...defaultState.zapier };
        saveIntegrations(state);
    },

    updateTriggers(triggers: Partial<ZapierConfig['outgoingTriggers']>): void {
        const state = loadIntegrations();
        state.zapier.outgoingTriggers = {
            ...state.zapier.outgoingTriggers,
            ...triggers,
        };
        saveIntegrations(state);
    },

    async testWebhook(): Promise<{ success: boolean }> {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const state = loadIntegrations();
        state.zapier.lastTrigger = new Date().toISOString();
        saveIntegrations(state);

        return { success: true };
    },

    async triggerEvent(eventType: keyof ZapierConfig['outgoingTriggers'], data: unknown): Promise<void> {
        const config = this.getConfig();
        if (!config.connected || !config.outgoingTriggers[eventType]) return;

        console.log(`[Zapier] Triggering ${eventType}:`, data);

        const state = loadIntegrations();
        state.zapier.lastTrigger = new Date().toISOString();
        saveIntegrations(state);
    },
};

// ============================================
// CLICKUP SERVICE
// ============================================

export const clickupService = {
    getConfig(): ClickUpConfig {
        return loadIntegrations().clickup;
    },

    async connect(apiKey: string): Promise<{ success: boolean; workspaceName?: string; error?: string }> {
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (!apiKey || apiKey.length < 10) {
            return { success: false, error: 'Invalid API key' };
        }

        const mockWorkspace = 'My Workspace';
        const state = loadIntegrations();
        state.clickup = {
            ...state.clickup,
            connected: true,
            apiKey,
            workspaceId: 'ws_' + Math.random().toString(36).substring(2, 8),
            workspaceName: mockWorkspace,
            lastSync: new Date().toISOString(),
        };
        saveIntegrations(state);

        return { success: true, workspaceName: mockWorkspace };
    },

    async disconnect(): Promise<void> {
        const state = loadIntegrations();
        state.clickup = { ...defaultState.clickup };
        saveIntegrations(state);
    },

    async syncTasks(): Promise<{ synced: number; errors: number }> {
        const config = this.getConfig();
        if (!config.connected) return { synced: 0, errors: 0 };

        await new Promise(resolve => setTimeout(resolve, 1000));

        const state = loadIntegrations();
        state.clickup.lastSync = new Date().toISOString();
        saveIntegrations(state);

        return { synced: Math.floor(Math.random() * 10) + 5, errors: 0 };
    },

    updateSettings(settings: Partial<ClickUpConfig>): void {
        const state = loadIntegrations();
        state.clickup = { ...state.clickup, ...settings };
        saveIntegrations(state);
    },
};

// ============================================
// EMAIL NOTIFICATIONS SERVICE
// ============================================

export const emailService = {
    getConfig(): EmailConfig {
        return loadIntegrations().email;
    },

    async configure(email: string): Promise<{ success: boolean; error?: string }> {
        await new Promise(resolve => setTimeout(resolve, 500));

        if (!email || !email.includes('@')) {
            return { success: false, error: 'Invalid email address' };
        }

        const state = loadIntegrations();
        state.email = {
            ...state.email,
            configured: true,
            email,
        };
        saveIntegrations(state);

        return { success: true };
    },

    async disable(): Promise<void> {
        const state = loadIntegrations();
        state.email = { ...defaultState.email };
        saveIntegrations(state);
    },

    updateSettings(settings: Partial<EmailConfig>): void {
        const state = loadIntegrations();
        state.email = { ...state.email, ...settings };
        saveIntegrations(state);
    },

    async sendTestEmail(): Promise<{ success: boolean }> {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return { success: true };
    },

    async sendDailyReport(): Promise<{ success: boolean }> {
        const config = this.getConfig();
        if (!config.configured || !config.dailyReport) {
            return { success: false };
        }

        console.log('[Email] Sending daily report to:', config.email);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true };
    },
};

// ============================================
// API ACCESS SERVICE
// ============================================

function generateApiKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = 'wk_';
    for (let i = 0; i < 32; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
}

export const apiService = {
    getConfig(): ApiConfig {
        return loadIntegrations().api;
    },

    createKey(name: string, permissions: ('read' | 'write')[]): ApiKey {
        const newKey: ApiKey = {
            id: 'key_' + Date.now(),
            name,
            key: generateApiKey(),
            createdAt: new Date().toISOString(),
            permissions,
        };

        const state = loadIntegrations();
        state.api.keys.push(newKey);
        state.api.enabled = true;
        saveIntegrations(state);

        return newKey;
    },

    deleteKey(keyId: string): void {
        const state = loadIntegrations();
        state.api.keys = state.api.keys.filter(k => k.id !== keyId);
        if (state.api.keys.length === 0) {
            state.api.enabled = false;
        }
        saveIntegrations(state);
    },

    updateRateLimit(limit: number): void {
        const state = loadIntegrations();
        state.api.rateLimit = limit;
        saveIntegrations(state);
    },

    toggleEnabled(enabled: boolean): void {
        const state = loadIntegrations();
        state.api.enabled = enabled;
        saveIntegrations(state);
    },
};

// ============================================
// AGGREGATED FUNCTIONS
// ============================================

export function getAllIntegrations(): IntegrationsState {
    return loadIntegrations();
}

export function getConnectedCount(): number {
    const state = loadIntegrations();
    let count = 0;
    if (state.google.connected) count++;
    if (state.outlook.connected) count++;
    if (state.zapier.connected) count++;
    if (state.clickup.connected) count++;
    if (state.email.configured) count++;
    if (state.api.enabled) count++;
    return count;
}

export async function getAllCalendarEvents(): Promise<CalendarEvent[]> {
    const [googleEvents, outlookEvents] = await Promise.all([
        googleCalendarService.syncEvents(),
        outlookCalendarService.syncEvents(),
    ]);

    return [...googleEvents, ...outlookEvents].sort(
        (a, b) => a.start.getTime() - b.start.getTime()
    );
}
