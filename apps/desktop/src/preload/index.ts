import { contextBridge, ipcRenderer } from 'electron';

// Expose Wakey API to renderer
contextBridge.exposeInMainWorld('wakey', {
    // Window controls
    minimize: () => ipcRenderer.invoke('window-minimize'),
    maximize: () => ipcRenderer.invoke('window-maximize'),
    close: () => ipcRenderer.invoke('window-close'),

    // Settings
    getSettings: () => ipcRenderer.invoke('get-settings'),
    setSetting: (key: string, value: unknown) => ipcRenderer.invoke('set-setting', key, value),

    // Tracking
    getTrackingStatus: () => ipcRenderer.invoke('get-tracking-status'),
    setTrackingStatus: (status: boolean) => ipcRenderer.invoke('set-tracking-status', status),

    // Activity data
    getTodayActivities: () => ipcRenderer.invoke('get-today-activities'),
    getTodayStats: () => ipcRenderer.invoke('get-today-stats'),
    getCurrentActivity: () => ipcRenderer.invoke('get-current-activity'),

    // Focus sessions
    startFocusSession: (type: 'focus' | 'break', duration: number) =>
        ipcRenderer.invoke('start-focus-session', type, duration),
    endFocusSession: (id: number, quality: number, distractions: number) =>
        ipcRenderer.invoke('end-focus-session', id, quality, distractions),

    // Tasks
    getTasks: () => ipcRenderer.invoke('get-tasks'),
    createTask: (title: string, priority: string) => ipcRenderer.invoke('create-task', title, priority),
    updateTaskStatus: (id: number, status: string) => ipcRenderer.invoke('update-task-status', id, status),
    deleteTask: (id: number) => ipcRenderer.invoke('delete-task', id),

    // Knowledge Management
    getNotes: () => ipcRenderer.invoke('get-notes'),
    saveNotes: (notes: any[]) => ipcRenderer.invoke('save-notes', notes),
    getKnowledgeGraph: () => ipcRenderer.invoke('get-knowledge-graph'),
    saveKnowledgeGraph: (data: { nodes: any[]; edges: any[] }) => ipcRenderer.invoke('save-knowledge-graph', data),
    getFlashcards: () => ipcRenderer.invoke('get-flashcards'),
    saveFlashcards: (cards: any[]) => ipcRenderer.invoke('save-flashcards', cards),

    // Agents
    getAgentTasks: () => ipcRenderer.invoke('get-agent-tasks'),
    saveAgentTasks: (tasks: any[]) => ipcRenderer.invoke('save-agent-tasks', tasks),

    // Focus Presets
    getFocusPresets: () => ipcRenderer.invoke('get-focus-presets'),
    saveFocusPreset: (preset: any) => ipcRenderer.invoke('save-focus-preset', preset),
    deleteFocusPreset: (id: string) => ipcRenderer.invoke('delete-focus-preset', id),

    // Extension status
    getExtensionStatus: () => ipcRenderer.invoke('get-extension-status'),

    // Analytics - real data from store
    getActivitiesRange: (startDate: string, endDate: string) =>
        ipcRenderer.invoke('get-activities-range', startDate, endDate),
    getStatsRange: (startDate: string, endDate: string) =>
        ipcRenderer.invoke('get-stats-range', startDate, endDate),

    // Enhanced Analytics
    getTopWebsites: (limit?: number, startDate?: string, endDate?: string) =>
        ipcRenderer.invoke('get-top-websites', limit, startDate, endDate),
    getTopApps: (limit?: number, startDate?: string, endDate?: string) =>
        ipcRenderer.invoke('get-top-apps', limit, startDate, endDate),
    getCategoryBreakdown: (startDate?: string, endDate?: string) =>
        ipcRenderer.invoke('get-category-breakdown', startDate, endDate),
    getProductiveVsDistracting: (startDate?: string, endDate?: string) =>
        ipcRenderer.invoke('get-productive-vs-distracting', startDate, endDate),
    getHourlyHeatmap: (startDate?: string, endDate?: string) =>
        ipcRenderer.invoke('get-hourly-heatmap', startDate, endDate),
    getAllTimeStats: () => ipcRenderer.invoke('get-all-time-stats'),
    getWeekComparison: () => ipcRenderer.invoke('get-week-comparison'),

    // Event listeners
    onTrackingToggle: (callback: (status: boolean) => void) => {
        ipcRenderer.on('tracking-toggle', (_event, status) => callback(status));
    },
    onFocusStart: (callback: () => void) => {
        ipcRenderer.on('focus-start', () => callback());
    },
    onNavigate: (callback: (route: string) => void) => {
        ipcRenderer.on('navigate', (_event, route) => callback(route));
    },
    onActivityUpdate: (callback: (activity: { app: string; title: string; category: string; isDistraction: boolean }) => void) => {
        ipcRenderer.on('activity-update', (_event, activity) => callback(activity));
    },
    // Widget IPC
    onWidgetUpdate: (callback: (data: any) => void) => ipcRenderer.on('widget-update', (_e, data) => callback(data)),
    requestWidgetUpdate: () => ipcRenderer.send('request-widget-update'),
    openDashboard: () => ipcRenderer.send('open-dashboard'),
    openSettings: () => ipcRenderer.send('open-settings'),
    quitApp: () => ipcRenderer.send('quit-app'),

    onDistractionDetected: (callback: (data: { app: string; title: string }) => void) => {
        ipcRenderer.on('distraction-detected', (_event, data) => callback(data));
    },
    onBrowserActivity: (callback: (data: any) => void) => {
        ipcRenderer.on('browser-activity', (_event, data) => callback(data));
    },

    // Auto-Update
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
    downloadUpdate: () => ipcRenderer.invoke('download-update'),
    installUpdate: () => ipcRenderer.invoke('install-update'),
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    getUpdateConfig: () => ipcRenderer.invoke('get-update-config'),
    setUpdateConfig: (config: { autoDownload?: boolean; autoInstallOnAppQuit?: boolean; allowPrerelease?: boolean; checkInterval?: number }) =>
        ipcRenderer.invoke('set-update-config', config),
    onUpdateStatus: (callback: (status: { status: string; version?: string; percent?: number; error?: string }) => void) => {
        ipcRenderer.on('update-status', (_event, status) => callback(status));
    },

    // Secure API key storage
    getSecureApiKeys: () => ipcRenderer.invoke('get-secure-api-keys'),
    setSecureApiKey: (key: string, value: string) => ipcRenderer.invoke('set-secure-api-key', key, value),
    deleteSecureApiKey: (key: string) => ipcRenderer.invoke('delete-secure-api-key', key),

    // Remove listeners
    removeAllListeners: (channel: string) => {
        ipcRenderer.removeAllListeners(channel);
    },
});

// Validate that the API is properly exposed
console.log('Wakey preload loaded successfully. API methods available:', {
    minimize: typeof window.wakey?.minimize,
    maximize: typeof window.wakey?.maximize,
    close: typeof window.wakey?.close,
    getSettings: typeof window.wakey?.getSettings,
    setTrackingStatus: typeof window.wakey?.setTrackingStatus
});

// TypeScript declarations
declare global {
    interface Window {
        wakey: {
            minimize: () => Promise<void>;
            maximize: () => Promise<void>;
            close: () => Promise<void>;
            getSettings: () => Promise<Record<string, unknown>>;
            setSetting: (key: string, value: unknown) => Promise<boolean>;
            getTrackingStatus: () => Promise<boolean>;
            setTrackingStatus: (status: boolean) => Promise<boolean>;
            getTodayActivities: () => Promise<unknown[]>;
            getTodayStats: () => Promise<{ focusTime: number; sessions: number; distractions: number; topApps: { app: string; minutes: number }[] }>;
            getCurrentActivity: () => Promise<{ app: string; category: string } | null>;
            startFocusSession: (type: 'focus' | 'break', duration: number) => Promise<number>;
            endFocusSession: (id: number, quality: number, distractions: number) => Promise<void>;
            getTasks: () => Promise<unknown[]>;
            createTask: (title: string, priority: string) => Promise<number>;
            updateTaskStatus: (id: number, status: string) => Promise<void>;
            deleteTask: (id: number) => Promise<void>;
            getNotes: () => Promise<any[]>;
            saveNotes: (notes: any[]) => Promise<boolean>;
            getKnowledgeGraph: () => Promise<{ nodes: any[]; edges: any[] }>;
            saveKnowledgeGraph: (data: { nodes: any[]; edges: any[] }) => Promise<boolean>;
            getFlashcards: () => Promise<any[]>;
            saveFlashcards: (cards: any[]) => Promise<boolean>;
            getAgentTasks: () => Promise<any[]>;
            saveAgentTasks: (tasks: any[]) => Promise<boolean>;
            getFocusPresets: () => Promise<any[]>;
            saveFocusPreset: (preset: any) => Promise<boolean>;
            deleteFocusPreset: (id: string) => Promise<boolean>;
            getExtensionStatus: () => Promise<{ connected: boolean; clientCount: number }>;
            getActivitiesRange: (startDate: string, endDate: string) => Promise<any[]>;
            getStatsRange: (startDate: string, endDate: string) => Promise<{
                date: string;
                focusMinutes: number;
                distractions: number;
                sessions: number;
                topApps: Record<string, number>;
            }[]>;
            getTopWebsites: (limit?: number, startDate?: string, endDate?: string) => Promise<{
                name: string;
                minutes: number;
                category: string;
                isDistraction: boolean;
            }[]>;
            getTopApps: (limit?: number, startDate?: string, endDate?: string) => Promise<{
                name: string;
                minutes: number;
                category: string;
                isDistraction: boolean;
            }[]>;
            getCategoryBreakdown: (startDate?: string, endDate?: string) => Promise<{
                name: string;
                minutes: number;
            }[]>;
            getProductiveVsDistracting: (startDate?: string, endDate?: string) => Promise<{
                productive: number;
                distracting: number;
            }>;
            getHourlyHeatmap: (startDate?: string, endDate?: string) => Promise<{
                day: string;
                hour: number;
                value: number;
            }[]>;
            getAllTimeStats: () => Promise<{
                totalFocusMinutes: number;
                totalDistractingMinutes: number;
                totalDistractions: number;
                completedSessions: number;
                avgQuality: number;
                firstDate: string | null;
                lastDate: string | null;
                totalDays: number;
            }>;
            getWeekComparison: () => Promise<{
                thisWeek: { focusMinutes: number; distractions: number };
                lastWeek: { focusMinutes: number; distractions: number };
                change: { focusPercent: number; distractionsPercent: number };
            }>;
            onTrackingToggle: (callback: (status: boolean) => void) => void;
            onFocusStart: (callback: () => void) => void;
            onNavigate: (callback: (route: string) => void) => void;
            onActivityUpdate: (callback: (activity: { app: string; title: string; category: string; isDistraction: boolean }) => void) => void;
            onDistractionDetected: (callback: (data: { app: string; title: string }) => void) => void;
            onBrowserActivity: (callback: (data: any) => void) => void;
            onWidgetUpdate: (callback: (data: { isTracking: boolean; todayTime: string; progress: number }) => void) => void;
            requestWidgetUpdate: () => void;
            openDashboard: () => void;
            openSettings: () => void;
            quitApp: () => void;
            checkForUpdates: () => Promise<any>;
            downloadUpdate: () => Promise<boolean>;
            installUpdate: () => Promise<void>;
            getAppVersion: () => Promise<string>;
            getUpdateConfig: () => Promise<{ autoDownload: boolean; autoInstallOnAppQuit: boolean; allowPrerelease: boolean; checkInterval: number }>;
            setUpdateConfig: (config: { autoDownload?: boolean; autoInstallOnAppQuit?: boolean; allowPrerelease?: boolean; checkInterval?: number }) => Promise<any>;
             onUpdateStatus: (callback: (status: { status: string; version?: string; percent?: number; error?: string }) => void) => void;
             getSecureApiKeys: () => Promise<Record<string, string>>;
             setSecureApiKey: (key: string, value: string) => Promise<boolean>;
             deleteSecureApiKey: (key: string) => Promise<boolean>;
             removeAllListeners: (channel: string) => void;
        };
    }
}

