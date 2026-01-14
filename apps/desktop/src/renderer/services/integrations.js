// Integration Services for Wakey
// Manages connections to external services: Google Calendar, Outlook, Zapier, ClickUp, Email
// ============================================
// DEFAULT STATE
// ============================================
const defaultState = {
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
function loadIntegrations() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return { ...defaultState, ...JSON.parse(stored) };
        }
    }
    catch (error) {
        console.error('Failed to load integrations:', error);
    }
    return defaultState;
}
function saveIntegrations(state) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
    catch (error) {
        console.error('Failed to save integrations:', error);
    }
}
// ============================================
// GOOGLE CALENDAR SERVICE
// ============================================
export const googleCalendarService = {
    getConfig() {
        return loadIntegrations().google;
    },
    async connect() {
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
    async disconnect() {
        const state = loadIntegrations();
        state.google = {
            ...defaultState.google,
        };
        saveIntegrations(state);
    },
    async syncEvents() {
        const config = this.getConfig();
        if (!config.connected)
            return [];
        // Mock calendar events
        const now = new Date();
        const events = [
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
    updateSettings(settings) {
        const state = loadIntegrations();
        state.google = { ...state.google, ...settings };
        saveIntegrations(state);
    },
};
// ============================================
// OUTLOOK CALENDAR SERVICE
// ============================================
export const outlookCalendarService = {
    getConfig() {
        return loadIntegrations().outlook;
    },
    async connect() {
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
    async disconnect() {
        const state = loadIntegrations();
        state.outlook = { ...defaultState.outlook };
        saveIntegrations(state);
    },
    async syncEvents() {
        const config = this.getConfig();
        if (!config.connected)
            return [];
        const now = new Date();
        const events = [
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
    updateSettings(settings) {
        const state = loadIntegrations();
        state.outlook = { ...state.outlook, ...settings };
        saveIntegrations(state);
    },
};
// ============================================
// ZAPIER SERVICE
// ============================================
function generateWebhookUrl() {
    const id = Math.random().toString(36).substring(2, 15);
    return `https://hooks.wakey.app/zapier/${id}`;
}
export const zapierService = {
    getConfig() {
        return loadIntegrations().zapier;
    },
    async connect() {
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
    async disconnect() {
        const state = loadIntegrations();
        state.zapier = { ...defaultState.zapier };
        saveIntegrations(state);
    },
    updateTriggers(triggers) {
        const state = loadIntegrations();
        state.zapier.outgoingTriggers = {
            ...state.zapier.outgoingTriggers,
            ...triggers,
        };
        saveIntegrations(state);
    },
    async testWebhook() {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const state = loadIntegrations();
        state.zapier.lastTrigger = new Date().toISOString();
        saveIntegrations(state);
        return { success: true };
    },
    async triggerEvent(eventType, data) {
        const config = this.getConfig();
        if (!config.connected || !config.outgoingTriggers[eventType])
            return;
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
    getConfig() {
        return loadIntegrations().clickup;
    },
    async connect(apiKey) {
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
    async disconnect() {
        const state = loadIntegrations();
        state.clickup = { ...defaultState.clickup };
        saveIntegrations(state);
    },
    async syncTasks() {
        const config = this.getConfig();
        if (!config.connected)
            return { synced: 0, errors: 0 };
        await new Promise(resolve => setTimeout(resolve, 1000));
        const state = loadIntegrations();
        state.clickup.lastSync = new Date().toISOString();
        saveIntegrations(state);
        return { synced: Math.floor(Math.random() * 10) + 5, errors: 0 };
    },
    updateSettings(settings) {
        const state = loadIntegrations();
        state.clickup = { ...state.clickup, ...settings };
        saveIntegrations(state);
    },
};
// ============================================
// EMAIL NOTIFICATIONS SERVICE
// ============================================
export const emailService = {
    getConfig() {
        return loadIntegrations().email;
    },
    async configure(email) {
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
    async disable() {
        const state = loadIntegrations();
        state.email = { ...defaultState.email };
        saveIntegrations(state);
    },
    updateSettings(settings) {
        const state = loadIntegrations();
        state.email = { ...state.email, ...settings };
        saveIntegrations(state);
    },
    async sendTestEmail() {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return { success: true };
    },
    async sendDailyReport() {
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
function generateApiKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = 'wk_';
    for (let i = 0; i < 32; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
}
export const apiService = {
    getConfig() {
        return loadIntegrations().api;
    },
    createKey(name, permissions) {
        const newKey = {
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
    deleteKey(keyId) {
        const state = loadIntegrations();
        state.api.keys = state.api.keys.filter(k => k.id !== keyId);
        if (state.api.keys.length === 0) {
            state.api.enabled = false;
        }
        saveIntegrations(state);
    },
    updateRateLimit(limit) {
        const state = loadIntegrations();
        state.api.rateLimit = limit;
        saveIntegrations(state);
    },
    toggleEnabled(enabled) {
        const state = loadIntegrations();
        state.api.enabled = enabled;
        saveIntegrations(state);
    },
};
// ============================================
// AGGREGATED FUNCTIONS
// ============================================
export function getAllIntegrations() {
    return loadIntegrations();
}
export function getConnectedCount() {
    const state = loadIntegrations();
    let count = 0;
    if (state.google.connected)
        count++;
    if (state.outlook.connected)
        count++;
    if (state.zapier.connected)
        count++;
    if (state.clickup.connected)
        count++;
    if (state.email.configured)
        count++;
    if (state.api.enabled)
        count++;
    return count;
}
export async function getAllCalendarEvents() {
    const [googleEvents, outlookEvents] = await Promise.all([
        googleCalendarService.syncEvents(),
        outlookCalendarService.syncEvents(),
    ]);
    return [...googleEvents, ...outlookEvents].sort((a, b) => a.start.getTime() - b.start.getTime());
}
//# sourceMappingURL=integrations.js.map