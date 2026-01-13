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
            onTrackingToggle: (callback: (status: boolean) => void) => void;
            onFocusStart: (callback: () => void) => void;
            onNavigate: (callback: (route: string) => void) => void;
            onActivityUpdate: (callback: (activity: { app: string; title: string; category: string; isDistraction: boolean }) => void) => void;
            onDistractionDetected: (callback: (data: { app: string; title: string }) => void) => void;
            removeAllListeners: (channel: string) => void;
        };
    }
}
