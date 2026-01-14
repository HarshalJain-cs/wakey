export interface GoogleCalendarConfig {
    connected: boolean;
    email?: string;
    accessToken?: string;
    syncEnabled: boolean;
    syncFrequency: number;
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
    rateLimit: number;
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
export declare const googleCalendarService: {
    getConfig(): GoogleCalendarConfig;
    connect(): Promise<{
        success: boolean;
        email?: string;
        error?: string;
    }>;
    disconnect(): Promise<void>;
    syncEvents(): Promise<CalendarEvent[]>;
    updateSettings(settings: Partial<GoogleCalendarConfig>): void;
};
export declare const outlookCalendarService: {
    getConfig(): OutlookCalendarConfig;
    connect(): Promise<{
        success: boolean;
        email?: string;
        error?: string;
    }>;
    disconnect(): Promise<void>;
    syncEvents(): Promise<CalendarEvent[]>;
    updateSettings(settings: Partial<OutlookCalendarConfig>): void;
};
export declare const zapierService: {
    getConfig(): ZapierConfig;
    connect(): Promise<{
        success: boolean;
        webhookUrl: string;
    }>;
    disconnect(): Promise<void>;
    updateTriggers(triggers: Partial<ZapierConfig["outgoingTriggers"]>): void;
    testWebhook(): Promise<{
        success: boolean;
    }>;
    triggerEvent(eventType: keyof ZapierConfig["outgoingTriggers"], data: unknown): Promise<void>;
};
export declare const clickupService: {
    getConfig(): ClickUpConfig;
    connect(apiKey: string): Promise<{
        success: boolean;
        workspaceName?: string;
        error?: string;
    }>;
    disconnect(): Promise<void>;
    syncTasks(): Promise<{
        synced: number;
        errors: number;
    }>;
    updateSettings(settings: Partial<ClickUpConfig>): void;
};
export declare const emailService: {
    getConfig(): EmailConfig;
    configure(email: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    disable(): Promise<void>;
    updateSettings(settings: Partial<EmailConfig>): void;
    sendTestEmail(): Promise<{
        success: boolean;
    }>;
    sendDailyReport(): Promise<{
        success: boolean;
    }>;
};
export declare const apiService: {
    getConfig(): ApiConfig;
    createKey(name: string, permissions: ("read" | "write")[]): ApiKey;
    deleteKey(keyId: string): void;
    updateRateLimit(limit: number): void;
    toggleEnabled(enabled: boolean): void;
};
export declare function getAllIntegrations(): IntegrationsState;
export declare function getConnectedCount(): number;
export declare function getAllCalendarEvents(): Promise<CalendarEvent[]>;
//# sourceMappingURL=integrations.d.ts.map