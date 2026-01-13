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
    onDistractionDetected: (callback: (data: { app: string; title: string }) => void) => {
        ipcRenderer.on('distraction-detected', (_event, data) => callback(data));
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

    // Remove listeners
    removeAllListeners: (channel: string) => {
        ipcRenderer.removeAllListeners(channel);
    },
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
            onTrackingToggle: (callback: (status: boolean) => void) => void;
            onFocusStart: (callback: () => void) => void;
            onNavigate: (callback: (route: string) => void) => void;
            onActivityUpdate: (callback: (activity: { app: string; title: string; category: string; isDistraction: boolean }) => void) => void;
            onDistractionDetected: (callback: (data: { app: string; title: string }) => void) => void;
            checkForUpdates: () => Promise<any>;
            downloadUpdate: () => Promise<boolean>;
            installUpdate: () => Promise<void>;
            getAppVersion: () => Promise<string>;
            getUpdateConfig: () => Promise<{ autoDownload: boolean; autoInstallOnAppQuit: boolean; allowPrerelease: boolean; checkInterval: number }>;
            setUpdateConfig: (config: { autoDownload?: boolean; autoInstallOnAppQuit?: boolean; allowPrerelease?: boolean; checkInterval?: number }) => Promise<any>;
            onUpdateStatus: (callback: (status: { status: string; version?: string; percent?: number; error?: string }) => void) => void;
            removeAllListeners: (channel: string) => void;
        };
    }
}

