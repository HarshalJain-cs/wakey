// Auto-Update Service for Electron
// Handles checking for updates, downloading, and installing

import { autoUpdater, UpdateInfo } from 'electron-updater';
import { BrowserWindow, ipcMain, dialog } from 'electron';

// ==========================================
// Configuration
// ==========================================

export interface UpdateConfig {
    autoDownload: boolean;
    autoInstallOnAppQuit: boolean;
    allowPrerelease: boolean;
    checkInterval: number; // minutes
}

const defaultConfig: UpdateConfig = {
    autoDownload: true,
    autoInstallOnAppQuit: true,
    allowPrerelease: false,
    checkInterval: 60, // Check every hour
};

let currentConfig: UpdateConfig = { ...defaultConfig };
let mainWindow: BrowserWindow | null = null;
let checkTimer: NodeJS.Timeout | null = null;

// ==========================================
// Initialize
// ==========================================

export function initAutoUpdater(window: BrowserWindow, config?: Partial<UpdateConfig>): void {
    mainWindow = window;

    if (config) {
        currentConfig = { ...currentConfig, ...config };
    }

    // Configure auto-updater
    autoUpdater.autoDownload = currentConfig.autoDownload;
    autoUpdater.autoInstallOnAppQuit = currentConfig.autoInstallOnAppQuit;
    autoUpdater.allowPrerelease = currentConfig.allowPrerelease;

    // Set up event handlers
    setupEventHandlers();

    // Register IPC handlers
    registerIPCHandlers();

    // Start periodic checks
    startPeriodicChecks();

    // Check immediately on startup
    setTimeout(() => {
        checkForUpdates();
    }, 5000); // 5 seconds after launch
}

// ==========================================
// Event Handlers
// ==========================================

function setupEventHandlers(): void {
    autoUpdater.on('checking-for-update', () => {
        sendToRenderer('update-status', { status: 'checking' });
    });

    autoUpdater.on('update-available', (info: UpdateInfo) => {
        sendToRenderer('update-status', {
            status: 'available',
            version: info.version,
            releaseDate: info.releaseDate,
            releaseNotes: info.releaseNotes,
        });

        // Show notification dialog if auto-download is off
        if (!currentConfig.autoDownload && mainWindow) {
            dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'Update Available',
                message: `A new version (${info.version}) is available.`,
                detail: 'Would you like to download it now?',
                buttons: ['Download', 'Later'],
            }).then(({ response }) => {
                if (response === 0) {
                    autoUpdater.downloadUpdate();
                }
            });
        }
    });

    autoUpdater.on('update-not-available', () => {
        sendToRenderer('update-status', { status: 'up-to-date' });
    });

    autoUpdater.on('download-progress', (progress) => {
        sendToRenderer('update-status', {
            status: 'downloading',
            percent: progress.percent,
            bytesPerSecond: progress.bytesPerSecond,
            total: progress.total,
            transferred: progress.transferred,
        });
    });

    autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
        sendToRenderer('update-status', {
            status: 'ready',
            version: info.version,
        });

        // Show restart dialog
        if (mainWindow) {
            dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'Update Ready',
                message: `Version ${info.version} has been downloaded.`,
                detail: 'Restart now to apply the update?',
                buttons: ['Restart', 'Later'],
            }).then(({ response }) => {
                if (response === 0) {
                    autoUpdater.quitAndInstall();
                }
            });
        }
    });

    autoUpdater.on('error', (error) => {
        sendToRenderer('update-status', {
            status: 'error',
            error: error.message,
        });
        console.error('Auto-update error:', error);
    });
}

// ==========================================
// IPC Handlers
// ==========================================

function registerIPCHandlers(): void {
    ipcMain.handle('check-for-updates', async () => {
        try {
            const result = await autoUpdater.checkForUpdates();
            return result?.updateInfo;
        } catch (error) {
            console.error('Check for updates failed:', error);
            return null;
        }
    });

    ipcMain.handle('download-update', async () => {
        try {
            await autoUpdater.downloadUpdate();
            return true;
        } catch (error) {
            console.error('Download update failed:', error);
            return false;
        }
    });

    ipcMain.handle('install-update', () => {
        autoUpdater.quitAndInstall();
    });

    ipcMain.handle('get-update-config', () => {
        return currentConfig;
    });

    ipcMain.handle('set-update-config', (_, config: Partial<UpdateConfig>) => {
        currentConfig = { ...currentConfig, ...config };
        autoUpdater.autoDownload = currentConfig.autoDownload;
        autoUpdater.autoInstallOnAppQuit = currentConfig.autoInstallOnAppQuit;
        autoUpdater.allowPrerelease = currentConfig.allowPrerelease;

        // Restart periodic checks with new interval
        startPeriodicChecks();

        return currentConfig;
    });

    ipcMain.handle('get-app-version', () => {
        return autoUpdater.currentVersion.version;
    });
}

// ==========================================
// Utility Functions
// ==========================================

export function checkForUpdates(): Promise<void> {
    return autoUpdater.checkForUpdates()
        .then(() => { })
        .catch((error) => {
            console.error('Update check failed:', error);
        });
}

function startPeriodicChecks(): void {
    if (checkTimer) {
        clearInterval(checkTimer);
    }

    checkTimer = setInterval(() => {
        checkForUpdates();
    }, currentConfig.checkInterval * 60 * 1000);
}

export function stopPeriodicChecks(): void {
    if (checkTimer) {
        clearInterval(checkTimer);
        checkTimer = null;
    }
}

function sendToRenderer(channel: string, data: unknown): void {
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send(channel, data);
    }
}

// ==========================================
// Cleanup
// ==========================================

export function cleanup(): void {
    stopPeriodicChecks();
    mainWindow = null;
}
