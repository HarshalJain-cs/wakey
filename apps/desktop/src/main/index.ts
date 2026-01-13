import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, globalShortcut } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import Store from 'electron-store';

// Data store for persistence (no native modules needed)
interface Activity {
    id: number;
    app_name: string;
    window_title: string;
    category: string;
    is_distraction: boolean;
    duration_seconds: number;
    created_at: string;
}

interface FocusSession {
    id: number;
    type: 'focus' | 'break';
    duration_minutes: number;
    quality_score: number;
    distractions_count: number;
    started_at: string;
    ended_at?: string;
}

interface Task {
    id: number;
    title: string;
    priority: 'high' | 'medium' | 'low';
    status: 'todo' | 'in_progress' | 'done';
    created_at: string;
    completed_at?: string;
}

interface StoreSchema {
    settings: {
        autoStartTracking: boolean;
        startMinimized: boolean;
        darkMode: boolean;
        syncInterval: number;
        trackUrls: boolean;
        idleThreshold: number;
    };
    activities: Activity[];
    focusSessions: FocusSession[];
    tasks: Task[];
    nextIds: { activity: number; session: number; task: number };
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
        },
        activities: [],
        focusSessions: [],
        tasks: [],
        nextIds: { activity: 1, session: 1, task: 1 },
    },
});

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isTracking = false;
let trackingInterval: NodeJS.Timeout | null = null;
let currentActivityId: number | null = null;
let currentActivityStart: number | null = null;
let lastAppName: string | null = null;

// App categorization
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

function categorizeApp(appName: string): string {
    const lower = appName.toLowerCase();
    for (const [key, category] of Object.entries(CATEGORY_RULES)) {
        if (lower.includes(key)) return category;
    }
    return 'Other';
}

function isDistraction(appName: string): boolean {
    const distractions = ['youtube', 'netflix', 'tiktok', 'instagram', 'twitter', 'reddit', 'facebook', 'steam', 'twitch'];
    const lower = appName.toLowerCase();
    return distractions.some(d => lower.includes(d));
}

function getToday(): string {
    return new Date().toISOString().split('T')[0];
}

// Activity logging
function logActivity(appName: string, windowTitle: string): void {
    const activities = store.get('activities', []);
    const nextIds = store.get('nextIds');
    const today = getToday();

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
app.on('before-quit', () => { globalShortcut.unregisterAll(); stopTracking(); });

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) app.quit();
else app.on('second-instance', () => { if (mainWindow) { if (mainWindow.isMinimized()) mainWindow.restore(); mainWindow.show(); mainWindow.focus(); } });
