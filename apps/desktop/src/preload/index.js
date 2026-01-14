import { contextBridge, ipcRenderer } from 'electron';
// Expose Wakey API to renderer
contextBridge.exposeInMainWorld('wakey', {
    // Window controls
    minimize: () => ipcRenderer.invoke('window-minimize'),
    maximize: () => ipcRenderer.invoke('window-maximize'),
    close: () => ipcRenderer.invoke('window-close'),
    // Settings
    getSettings: () => ipcRenderer.invoke('get-settings'),
    setSetting: (key, value) => ipcRenderer.invoke('set-setting', key, value),
    // Tracking
    getTrackingStatus: () => ipcRenderer.invoke('get-tracking-status'),
    setTrackingStatus: (status) => ipcRenderer.invoke('set-tracking-status', status),
    // Activity data
    getTodayActivities: () => ipcRenderer.invoke('get-today-activities'),
    getTodayStats: () => ipcRenderer.invoke('get-today-stats'),
    getCurrentActivity: () => ipcRenderer.invoke('get-current-activity'),
    // Focus sessions
    startFocusSession: (type, duration) => ipcRenderer.invoke('start-focus-session', type, duration),
    endFocusSession: (id, quality, distractions) => ipcRenderer.invoke('end-focus-session', id, quality, distractions),
    // Tasks
    getTasks: () => ipcRenderer.invoke('get-tasks'),
    createTask: (title, priority) => ipcRenderer.invoke('create-task', title, priority),
    updateTaskStatus: (id, status) => ipcRenderer.invoke('update-task-status', id, status),
    deleteTask: (id) => ipcRenderer.invoke('delete-task', id),
    // Knowledge Management
    getNotes: () => ipcRenderer.invoke('get-notes'),
    saveNotes: (notes) => ipcRenderer.invoke('save-notes', notes),
    getKnowledgeGraph: () => ipcRenderer.invoke('get-knowledge-graph'),
    saveKnowledgeGraph: (data) => ipcRenderer.invoke('save-knowledge-graph', data),
    getFlashcards: () => ipcRenderer.invoke('get-flashcards'),
    saveFlashcards: (cards) => ipcRenderer.invoke('save-flashcards', cards),
    // Agents
    getAgentTasks: () => ipcRenderer.invoke('get-agent-tasks'),
    saveAgentTasks: (tasks) => ipcRenderer.invoke('save-agent-tasks', tasks),
    // Event listeners
    onTrackingToggle: (callback) => {
        ipcRenderer.on('tracking-toggle', (_event, status) => callback(status));
    },
    onFocusStart: (callback) => {
        ipcRenderer.on('focus-start', () => callback());
    },
    onNavigate: (callback) => {
        ipcRenderer.on('navigate', (_event, route) => callback(route));
    },
    onActivityUpdate: (callback) => {
        ipcRenderer.on('activity-update', (_event, activity) => callback(activity));
    },
    onDistractionDetected: (callback) => {
        ipcRenderer.on('distraction-detected', (_event, data) => callback(data));
    },
    // Auto-Update
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
    downloadUpdate: () => ipcRenderer.invoke('download-update'),
    installUpdate: () => ipcRenderer.invoke('install-update'),
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    getUpdateConfig: () => ipcRenderer.invoke('get-update-config'),
    setUpdateConfig: (config) => ipcRenderer.invoke('set-update-config', config),
    onUpdateStatus: (callback) => {
        ipcRenderer.on('update-status', (_event, status) => callback(status));
    },
    // Remove listeners
    removeAllListeners: (channel) => {
        ipcRenderer.removeAllListeners(channel);
    },
});
//# sourceMappingURL=index.js.map