/**
 * @fileoverview Wakey Desktop Application - Main Process
 * 
 * This is the Electron main process that handles:
 * - Application lifecycle (startup, shutdown, single instance)
 * - Activity tracking and categorization
 * - Focus session management
 * - Task management
 * - IPC communication with renderer process
 * - System tray integration
 * - Global keyboard shortcuts
 * 
 * @module main/index
 * @author Wakey Team
 * 
 * @see {@link https://www.electronjs.org/docs/latest/tutorial/process-model Electron Process Model}
 */

import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, globalShortcut } from 'electron';
import { join, resolve } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { fileURLToPath } from 'url';
import Store from 'electron-store';

// ============================================
// Type Definitions
// ============================================

/**
 * Represents a tracked activity/app usage entry.
 * Stored locally with duration tracking.
 */
interface Activity {
    /** Unique identifier for the activity */
    id: number;
    /** Name of the application */
    app_name: string;
    /** Title of the active window */
    window_title: string;
    /** Categorized type (Development, Communication, etc.) */
    category: string;
    /** Whether this app is flagged as a distraction */
    is_distraction: boolean;
    /** Total time spent in seconds */
    duration_seconds: number;
    /** ISO timestamp when activity was first recorded */
    created_at: string;
}

/**
 * Represents a focus/break session with quality metrics.
 */
interface FocusSession {
    /** Unique session identifier */
    id: number;
    /** Session type: focus work or break */
    type: 'focus' | 'break';
    /** Planned duration in minutes */
    duration_minutes: number;
    /** Quality score (0-100) calculated at session end */
    quality_score: number;
    /** Number of distractions during session */
    distractions_count: number;
    /** ISO timestamp when session started */
    started_at: string;
    /** ISO timestamp when session ended (undefined if in progress) */
    ended_at?: string;
}

/**
 * Represents a user task with priority and status tracking.
 */
interface Task {
    /** Unique task identifier */
    id: number;
    /** Task title/description */
    title: string;
    /** Priority level for sorting */
    priority: 'high' | 'medium' | 'low';
    /** Current workflow status */
    status: 'todo' | 'in_progress' | 'done';
    /** ISO timestamp when task was created */
    created_at: string;
    /** ISO timestamp when task was completed */
    completed_at?: string;
}

interface Note {
    id: number;
    title: string;
    content: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

interface KnowledgeNode {
    id: string;
    type: 'note' | 'concept' | 'entity' | 'task';
    title: string;
    content: string;
    metadata?: any;
}

interface KnowledgeEdge {
    source: string;
    target: string;
    type: string;
}

interface Flashcard {
    id: number;
    front: string;
    back: string;
    intervalDays: number;
    easeFactor: number;
    nextReview: string;
    createdAt: string;
}

interface AgentTask {
    id: string;
    agentType: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    result?: any;
    error?: string;
    createdAt: string;
}

interface StoreSchema {
    settings: {
        autoStartTracking: boolean;
        startMinimized: boolean;
        darkMode: boolean;
        syncInterval: number;
        trackUrls: boolean;
        idleThreshold: number;
        customDistractions: string[];
        // Supabase configuration
        supabaseUrl: string;
        supabaseAnonKey: string;
        requireAuth: boolean;
        // Additional auth-related settings can be stored dynamically
        [key: string]: unknown;
    };
    activities: Activity[];
    focusSessions: FocusSession[];
    tasks: Task[];
    notes: Note[];
    knowledgeNodes: KnowledgeNode[];
    knowledgeEdges: KnowledgeEdge[];
    flashcards: Flashcard[];
    agentTasks: AgentTask[];
    nextIds: {
        activity: number;
        session: number;
        task: number;
        note: number;
        flashcard: number;
    };
}

const store = new Store<StoreSchema>({
    defaults: {
        settings: {
            autoStartTracking: false,
            startMinimized: false,
            darkMode: true,
            syncInterval: 60,
            trackUrls: true,
            idleThreshold: 5,
            customDistractions: [],
            // Supabase config (can be overridden via env or settings)
            supabaseUrl: process.env.VITE_SUPABASE_URL || '',
            supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY || '',
            // Auth requirement (set to false to skip login during development)
            requireAuth: false,
        },
        activities: [],
        focusSessions: [],
        tasks: [],
        notes: [],
        knowledgeNodes: [],
        knowledgeEdges: [],
        flashcards: [],
        agentTasks: [],
        nextIds: {
            activity: 1,
            session: 1,
            task: 1,
            note: 1,
            flashcard: 1
        },
    },
});

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isTracking = false;
let trackingInterval: NodeJS.Timeout | null = null;
let currentActivityId: number | null = null;
let currentActivityStart: number | null = null;
let lastAppName: string | null = null;

// ============================================
// App Categorization & Distraction Detection
// ============================================

/**
 * Rule-based category mapping for common applications.
 * Maps lowercase keyword to category name.
 */
const CATEGORY_RULES: Record<string, string> = {
    'code': 'Development', 'visual studio': 'Development', 'terminal': 'Development',
    'powershell': 'Development', 'git': 'Development', 'postman': 'Development',
    'slack': 'Communication', 'discord': 'Communication', 'teams': 'Communication',
    'zoom': 'Communication', 'outlook': 'Communication',
    'notion': 'Productivity', 'obsidian': 'Productivity', 'word': 'Productivity',
    'excel': 'Productivity', 'figma': 'Design', 'photoshop': 'Design',
    'youtube': 'Entertainment', 'netflix': 'Entertainment', 'spotify': 'Entertainment',
    'twitter': 'Social Media', 'facebook': 'Social Media', 'instagram': 'Social Media',
    'reddit': 'Social Media', 'chrome': 'Browser', 'edge': 'Browser', 'firefox': 'Browser',
    'wakey': 'Productivity',
};

/**
 * Categorizes an application based on rule-based keyword matching.
 * 
 * @param appName - The name of the application to categorize
 * @returns Category string (e.g., 'Development', 'Entertainment') or 'Other' if unknown
 */
function categorizeApp(appName: string): string {
    const lower = appName.toLowerCase();
    for (const [key, category] of Object.entries(CATEGORY_RULES)) {
        if (lower.includes(key)) return category;
    }
    return 'Other';
}

/**
 * Checks if an application is considered a distraction.
 * Combines default distraction list with user-configured custom list.
 * 
 * @param appName - The name of the application to check
 * @returns true if the app is flagged as a distraction
 */
function isDistraction(appName: string): boolean {
    const defaultDistractions = ['youtube', 'netflix', 'tiktok', 'instagram', 'twitter', 'reddit', 'facebook', 'steam', 'twitch', 'discord', 'telegram', 'whatsapp'];
    const customDistractions = store.get('settings.customDistractions', []) as string[];
    const allDistractions = [...defaultDistractions, ...customDistractions];
    const lower = appName.toLowerCase();
    return allDistractions.some(d => lower.includes(d));
}

/**
 * Gets today's date as an ISO date string (YYYY-MM-DD).
 * Used for filtering activities and sessions by day.
 */
function getToday(): string {
    return new Date().toISOString().split('T')[0];
}

// ============================================
// Activity Tracking
// ============================================

/**
 * Logs an activity entry for the given app and window.
 * Updates duration if the same app is still active, otherwise creates new entry.
 * Sends distraction alerts to renderer if a distraction app is detected.
 * 
 * @param appName - The name of the active application
 * @param windowTitle - The title of the active window
 */
function logActivity(appName: string, windowTitle: string): void {
    const activities = store.get('activities', []);
    const nextIds = store.get('nextIds');

    // Update duration if same app
    if (lastAppName === appName && currentActivityId && currentActivityStart) {
        const duration = Math.floor((Date.now() - currentActivityStart) / 1000);
        const idx = activities.findIndex(a => a.id === currentActivityId);
        if (idx !== -1) {
            activities[idx].duration_seconds = duration;
            store.set('activities', activities);
        }
        return;
    }

    // Create new activity
    const category = categorizeApp(appName);
    const distraction = isDistraction(appName);

    const activity: Activity = {
        id: nextIds.activity,
        app_name: appName,
        window_title: windowTitle,
        category,
        is_distraction: distraction,
        duration_seconds: 0,
        created_at: new Date().toISOString(),
    };

    activities.push(activity);
    store.set('activities', activities);
    store.set('nextIds.activity', nextIds.activity + 1);

    currentActivityId = activity.id;
    currentActivityStart = Date.now();
    lastAppName = appName;

    if (distraction && mainWindow) {
        mainWindow.webContents.send('distraction-detected', { app: appName, title: windowTitle });
    }

    mainWindow?.webContents.send('activity-update', { app: appName, title: windowTitle, category, isDistraction: distraction });
}

// Get today's stats
function getTodayStats() {
    const activities = store.get('activities', []);
    const sessions = store.get('focusSessions', []);
    const today = getToday();

    const todayActivities = activities.filter(a => a.created_at.startsWith(today));
    const todaySessions = sessions.filter(s => s.started_at.startsWith(today));

    const focusTime = todayActivities
        .filter(a => !a.is_distraction)
        .reduce((sum, a) => sum + a.duration_seconds, 0);

    const distractions = todayActivities.filter(a => a.is_distraction).length;

    // Group by app for top apps
    const appTimes = new Map<string, number>();
    todayActivities.forEach(a => {
        const current = appTimes.get(a.app_name) || 0;
        appTimes.set(a.app_name, current + a.duration_seconds);
    });

    const topApps = Array.from(appTimes.entries())
        .map(([app, seconds]) => ({ app, minutes: Math.floor(seconds / 60) }))
        .sort((a, b) => b.minutes - a.minutes)
        .slice(0, 5);

    return {
        focusTime: Math.floor(focusTime / 60),
        sessions: todaySessions.filter(s => s.ended_at).length,
        distractions,
        topApps,
    };
}

// Focus sessions
function startFocusSession(type: 'focus' | 'break', durationMinutes: number): number {
    const sessions = store.get('focusSessions', []);
    const nextIds = store.get('nextIds');

    const session: FocusSession = {
        id: nextIds.session,
        type,
        duration_minutes: durationMinutes,
        quality_score: 0,
        distractions_count: 0,
        started_at: new Date().toISOString(),
    };

    sessions.push(session);
    store.set('focusSessions', sessions);
    store.set('nextIds.session', nextIds.session + 1);

    return session.id;
}

function endFocusSession(id: number, qualityScore: number, distractions: number): void {
    const sessions = store.get('focusSessions', []);
    const idx = sessions.findIndex(s => s.id === id);
    if (idx !== -1) {
        sessions[idx].ended_at = new Date().toISOString();
        sessions[idx].quality_score = qualityScore;
        sessions[idx].distractions_count = distractions;
        store.set('focusSessions', sessions);
    }
}

// Tasks
function createTask(title: string, priority: string): number {
    const tasks = store.get('tasks', []);
    const nextIds = store.get('nextIds');

    const task: Task = {
        id: nextIds.task,
        title,
        priority: priority as Task['priority'],
        status: 'todo',
        created_at: new Date().toISOString(),
    };

    tasks.push(task);
    store.set('tasks', tasks);
    store.set('nextIds.task', nextIds.task + 1);

    return task.id;
}

function getTasks(): Task[] {
    return store.get('tasks', []).sort((a, b) => {
        const statusOrder = { in_progress: 0, todo: 1, done: 2 };
        return statusOrder[a.status] - statusOrder[b.status];
    });
}

function updateTaskStatus(id: number, status: string): void {
    const tasks = store.get('tasks', []);
    const idx = tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
        tasks[idx].status = status as Task['status'];
        tasks[idx].completed_at = status === 'done' ? new Date().toISOString() : undefined;
        store.set('tasks', tasks);
    }
}

function deleteTask(id: number): void {
    const tasks = store.get('tasks', []).filter(t => t.id !== id);
    store.set('tasks', tasks);
}

// Tracking
function startTracking(): void {
    if (trackingInterval) return;
    console.log('Starting activity tracking...');

    trackingInterval = setInterval(() => {
        // Placeholder tracking - logs Wakey app
        if (mainWindow) {
            const title = mainWindow.isFocused() ? 'Dashboard' : 'Background';
            logActivity('Wakey', title);
        }
    }, 10000);

    isTracking = true;
    mainWindow?.webContents.send('tracking-toggle', true);
}

function stopTracking(): void {
    if (trackingInterval) {
        clearInterval(trackingInterval);
        trackingInterval = null;
    }
    isTracking = false;
    currentActivityId = null;
    currentActivityStart = null;
    lastAppName = null;
    mainWindow?.webContents.send('tracking-toggle', false);
}

function createWindow(): void {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 700,
        show: false,
        autoHideMenuBar: true,
        frame: false,
        titleBarStyle: 'hidden',
        backgroundColor: '#0f172a',
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false,
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    mainWindow.on('ready-to-show', () => mainWindow?.show());
    mainWindow.on('close', (event) => { event.preventDefault(); mainWindow?.hide(); });

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
    }
}

function createTray(): void {
    const iconPath = join(__dirname, '../../resources/icon.png');
    let icon: Electron.NativeImage;

    try {
        icon = nativeImage.createFromPath(iconPath);
        if (!icon.isEmpty()) icon = icon.resize({ width: 16, height: 16 });
        else throw new Error('Empty');
    } catch {
        icon = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAApElEQVQ4jWNgGAWDATAyMjL+Z2Bg+M/AwPCfkZHxPxMT038GBob/TExM/xkZGf8zMTH9Z2Bg+M/ExPSfgYHhPxMT039GRsb/TExM/xkYGP4zMTH9Z2Rk/M/IyPifkZHxPyMj439GRsb/jIyM/xkZGf8zMjL+Z2Rk/M/IyPifkZHxPyMj439GRsb/TExM/xkYGP4zMTH9Z2Bg+M/ExPSfgYHh/ygYegAAyEQU+2qJmaoAAAAASUVORK5CYII=');
    }

    tray = new Tray(icon);

    const updateMenu = () => {
        const contextMenu = Menu.buildFromTemplate([
            { label: isTracking ? '⏸️ Pause Tracking' : '▶️ Start Tracking', click: () => { isTracking ? stopTracking() : startTracking(); updateMenu(); } },
            { type: 'separator' },
            { label: '🎯 Start Focus', click: () => { mainWindow?.show(); mainWindow?.webContents.send('focus-start'); } },
            { label: '📊 Dashboard', click: () => mainWindow?.show() },
            { type: 'separator' },
            { label: '⚙️ Settings', click: () => { mainWindow?.show(); mainWindow?.webContents.send('navigate', '/settings'); } },
            { type: 'separator' },
            { label: '❌ Quit', click: () => { mainWindow?.destroy(); app.quit(); } },
        ]);
        tray?.setContextMenu(contextMenu);
        tray?.setToolTip(`Wakey - ${isTracking ? 'Tracking' : 'Idle'}`);
    };

    updateMenu();
    tray.on('click', () => mainWindow?.show());
}

function registerShortcuts(): void {
    globalShortcut.register('CommandOrControl+Shift+F', () => { mainWindow?.show(); mainWindow?.webContents.send('focus-start'); });
    globalShortcut.register('CommandOrControl+Shift+T', () => { isTracking ? stopTracking() : startTracking(); });
}

function setupIpcHandlers(): void {
    ipcMain.handle('get-settings', () => store.get('settings'));
    ipcMain.handle('set-setting', (_e, key: string, value: unknown) => { store.set(`settings.${key}` as keyof StoreSchema, value); return true; });
    ipcMain.handle('window-minimize', () => mainWindow?.minimize());
    ipcMain.handle('window-maximize', () => mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow?.maximize());
    ipcMain.handle('window-close', () => mainWindow?.hide());
    ipcMain.handle('get-tracking-status', () => isTracking);
    ipcMain.handle('set-tracking-status', (_e, status: boolean) => { status && !isTracking ? startTracking() : !status && isTracking ? stopTracking() : null; return isTracking; });
    ipcMain.handle('get-today-activities', () => store.get('activities', []).filter(a => a.created_at.startsWith(getToday())));
    ipcMain.handle('get-today-stats', () => getTodayStats());
    ipcMain.handle('get-current-activity', () => lastAppName ? { app: lastAppName, category: categorizeApp(lastAppName) } : null);
    ipcMain.handle('start-focus-session', (_e, type: 'focus' | 'break', duration: number) => startFocusSession(type, duration));
    ipcMain.handle('end-focus-session', (_e, id: number, quality: number, distractions: number) => endFocusSession(id, quality, distractions));
    ipcMain.handle('get-tasks', () => getTasks());
    ipcMain.handle('create-task', (_e, title: string, priority: string) => createTask(title, priority));
    ipcMain.handle('update-task-status', (_e, id: number, status: string) => updateTaskStatus(id, status));
    ipcMain.handle('delete-task', (_e, id: number) => deleteTask(id));

    // Phase 5: Knowledge Management handlers
    ipcMain.handle('get-notes', () => store.get('notes', []));
    ipcMain.handle('save-notes', (_e, notes: Note[]) => { store.set('notes', notes); return true; });
    ipcMain.handle('get-knowledge-graph', () => ({
        nodes: store.get('knowledgeNodes', []),
        edges: store.get('knowledgeEdges', []),
    }));
    ipcMain.handle('save-knowledge-graph', (_e, { nodes, edges }) => {
        store.set('knowledgeNodes', nodes);
        store.set('knowledgeEdges', edges);
        return true;
    });
    ipcMain.handle('get-flashcards', () => store.get('flashcards', []));
    ipcMain.handle('save-flashcards', (_e, cards: Flashcard[]) => { store.set('flashcards', cards); return true; });

    // Phase 5: Agent handlers
    ipcMain.handle('get-agent-tasks', () => store.get('agentTasks', []));
    ipcMain.handle('save-agent-tasks', (_e, tasks: AgentTask[]) => { store.set('agentTasks', tasks); return true; });
}

app.whenReady().then(() => {
    electronApp.setAppUserModelId('com.wakey.app');
    app.on('browser-window-created', (_, window) => optimizer.watchWindowShortcuts(window));

    createWindow();
    createTray();
    registerShortcuts();
    setupIpcHandlers();

    if (store.get('settings.autoStartTracking')) startTracking();
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { });
app.on('before-quit', () => {
    if (app.isReady()) {
        try {
            globalShortcut.unregisterAll();
        } catch (e) {
            console.error('Failed to unregister shortcuts:', e);
        }
    }
    stopTracking();
});

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) app.quit();
else app.on('second-instance', () => { if (mainWindow) { if (mainWindow.isMinimized()) mainWindow.restore(); mainWindow.show(); mainWindow.focus(); } });
