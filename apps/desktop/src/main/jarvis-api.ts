/**
 * @fileoverview JARVIS API for Main Process
 * 
 * IPC handlers for JARVIS integration:
 * - Activity data endpoints
 * - Focus session control
 * - Task management API
 * - Insights retrieval
 * 
 * This module exposes Wakey functionality to JARVIS via IPC.
 * 
 * @module main/jarvis-api
 */

import { ipcMain, BrowserWindow } from 'electron';

// ============================================
// Types
// ============================================

interface JarvisAPIResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

interface ActivityStats {
    focusMinutes: number;
    breakMinutes: number;
    distractionMinutes: number;
    tasksCompleted: number;
    focusScore: number;
    deepWorkSessions: number;
}

interface FocusSession {
    id: string;
    startTime: Date;
    duration: number;
    status: 'active' | 'paused' | 'completed';
}

interface Task {
    id: string;
    title: string;
    status: 'todo' | 'in_progress' | 'done';
    priority: 'low' | 'medium' | 'high';
    createdAt: Date;
}

// ============================================
// JARVIS API Setup
// ============================================

/**
 * Initialize JARVIS API handlers
 */
export function setupJarvisAPI(mainWindow: BrowserWindow): void {
    console.log('[JARVIS API] Setting up IPC handlers...');

    // ==========================================
    // Activity Endpoints
    // ==========================================

    /**
     * Get today's activity stats
     */
    ipcMain.handle('jarvis:get-stats', async (): Promise<JarvisAPIResponse<ActivityStats>> => {
        try {
            // Get stats from renderer
            const stats = await mainWindow.webContents.executeJavaScript(`
                (function() {
                    const stored = localStorage.getItem('wakey_activity');
                    if (!stored) return null;
                    return JSON.parse(stored);
                })()
            `);

            return {
                success: true,
                data: stats || {
                    focusMinutes: 0,
                    breakMinutes: 0,
                    distractionMinutes: 0,
                    tasksCompleted: 0,
                    focusScore: 0,
                    deepWorkSessions: 0,
                },
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get stats',
            };
        }
    });

    /**
     * Get current activity
     */
    ipcMain.handle('jarvis:get-current-activity', async (): Promise<JarvisAPIResponse> => {
        try {
            const activity = await mainWindow.webContents.executeJavaScript(`
                (function() {
                    const stored = localStorage.getItem('wakey_current_activity');
                    return stored ? JSON.parse(stored) : null;
                })()
            `);

            return { success: true, data: activity };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get activity',
            };
        }
    });

    // ==========================================
    // Focus Session Endpoints
    // ==========================================

    /**
     * Start a focus session
     */
    ipcMain.handle('jarvis:start-focus', async (_event, durationMinutes: number = 25): Promise<JarvisAPIResponse<FocusSession>> => {
        try {
            mainWindow.webContents.send('jarvis:command', {
                type: 'start-focus',
                duration: durationMinutes,
            });

            const session: FocusSession = {
                id: `focus_${Date.now()}`,
                startTime: new Date(),
                duration: durationMinutes,
                status: 'active',
            };

            return { success: true, data: session };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to start focus',
            };
        }
    });

    /**
     * Stop focus session
     */
    ipcMain.handle('jarvis:stop-focus', async (): Promise<JarvisAPIResponse> => {
        try {
            mainWindow.webContents.send('jarvis:command', {
                type: 'stop-focus',
            });

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to stop focus',
            };
        }
    });

    /**
     * Start a break
     */
    ipcMain.handle('jarvis:start-break', async (_event, durationMinutes: number = 5): Promise<JarvisAPIResponse> => {
        try {
            mainWindow.webContents.send('jarvis:command', {
                type: 'start-break',
                duration: durationMinutes,
            });

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to start break',
            };
        }
    });

    /**
     * Get current focus session
     */
    ipcMain.handle('jarvis:get-focus-session', async (): Promise<JarvisAPIResponse<FocusSession | null>> => {
        try {
            const session = await mainWindow.webContents.executeJavaScript(`
                (function() {
                    const stored = localStorage.getItem('wakey_focus_session');
                    return stored ? JSON.parse(stored) : null;
                })()
            `);

            return { success: true, data: session };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get session',
            };
        }
    });

    // ==========================================
    // Task Endpoints
    // ==========================================

    /**
     * Get all tasks
     */
    ipcMain.handle('jarvis:get-tasks', async (): Promise<JarvisAPIResponse<Task[]>> => {
        try {
            const tasks = await mainWindow.webContents.executeJavaScript(`
                (function() {
                    const stored = localStorage.getItem('wakey_tasks');
                    return stored ? JSON.parse(stored) : [];
                })()
            `);

            return { success: true, data: tasks };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get tasks',
            };
        }
    });

    /**
     * Create a task
     */
    ipcMain.handle('jarvis:create-task', async (_event, title: string, priority: string = 'medium'): Promise<JarvisAPIResponse<Task>> => {
        try {
            mainWindow.webContents.send('jarvis:command', {
                type: 'create-task',
                title,
                priority,
            });

            const task: Task = {
                id: `task_${Date.now()}`,
                title,
                status: 'todo',
                priority: priority as Task['priority'],
                createdAt: new Date(),
            };

            return { success: true, data: task };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create task',
            };
        }
    });

    /**
     * Complete a task
     */
    ipcMain.handle('jarvis:complete-task', async (_event, taskId: string): Promise<JarvisAPIResponse> => {
        try {
            mainWindow.webContents.send('jarvis:command', {
                type: 'complete-task',
                taskId,
            });

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to complete task',
            };
        }
    });

    // ==========================================
    // Insights Endpoints
    // ==========================================

    /**
     * Get AI insights
     */
    ipcMain.handle('jarvis:get-insights', async (): Promise<JarvisAPIResponse<string[]>> => {
        try {
            const insights = await mainWindow.webContents.executeJavaScript(`
                (function() {
                    const stored = localStorage.getItem('wakey_insights');
                    return stored ? JSON.parse(stored) : [];
                })()
            `);

            return { success: true, data: insights };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get insights',
            };
        }
    });

    /**
     * Get productivity predictions
     */
    ipcMain.handle('jarvis:get-predictions', async (): Promise<JarvisAPIResponse> => {
        try {
            const predictions = await mainWindow.webContents.executeJavaScript(`
                (function() {
                    if (typeof window.predictiveTaskService !== 'undefined') {
                        return window.predictiveTaskService.getPredictions();
                    }
                    return [];
                })()
            `);

            return { success: true, data: predictions };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get predictions',
            };
        }
    });

    // ==========================================
    // Tracking Endpoints
    // ==========================================

    /**
     * Toggle activity tracking
     */
    ipcMain.handle('jarvis:toggle-tracking', async (): Promise<JarvisAPIResponse<boolean>> => {
        try {
            mainWindow.webContents.send('jarvis:command', {
                type: 'toggle-tracking',
            });

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to toggle tracking',
            };
        }
    });

    /**
     * Get tracking status
     */
    ipcMain.handle('jarvis:get-tracking-status', async (): Promise<JarvisAPIResponse<{ isTracking: boolean }>> => {
        try {
            const isTracking = await mainWindow.webContents.executeJavaScript(`
                (function() {
                    const stored = localStorage.getItem('wakey_tracking_active');
                    return stored === 'true';
                })()
            `);

            return { success: true, data: { isTracking } };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get tracking status',
            };
        }
    });

    // ==========================================
    // Voice Command Handler
    // ==========================================

    /**
     * Execute voice command
     */
    ipcMain.handle('jarvis:voice-command', async (_event, command: string): Promise<JarvisAPIResponse<string>> => {
        try {
            const result = await mainWindow.webContents.executeJavaScript(`
                (function() {
                    if (typeof window.jarvisBridgeService !== 'undefined') {
                        return window.jarvisBridgeService.processVoiceCommand('${command.replace(/'/g, "\\'")}');
                    }
                    return 'Voice commands not available';
                })()
            `);

            return { success: true, data: result };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to execute command',
            };
        }
    });

    // ==========================================
    // System Endpoints
    // ==========================================

    /**
     * Get Wakey version
     */
    ipcMain.handle('jarvis:get-version', async (): Promise<JarvisAPIResponse<string>> => {
        try {
            const { app } = await import('electron');
            return { success: true, data: app.getVersion() };
        } catch {
            return { success: true, data: '1.0.0' };
        }
    });

    /**
     * Ping - check if Wakey is running
     */
    ipcMain.handle('jarvis:ping', async (): Promise<JarvisAPIResponse<{ timestamp: number }>> => {
        return {
            success: true,
            data: { timestamp: Date.now() },
        };
    });

    console.log('[JARVIS API] All handlers registered');
}

/**
 * Remove JARVIS API handlers
 */
export function teardownJarvisAPI(): void {
    const handlers = [
        'jarvis:get-stats',
        'jarvis:get-current-activity',
        'jarvis:start-focus',
        'jarvis:stop-focus',
        'jarvis:start-break',
        'jarvis:get-focus-session',
        'jarvis:get-tasks',
        'jarvis:create-task',
        'jarvis:complete-task',
        'jarvis:get-insights',
        'jarvis:get-predictions',
        'jarvis:toggle-tracking',
        'jarvis:get-tracking-status',
        'jarvis:voice-command',
        'jarvis:get-version',
        'jarvis:ping',
    ];

    handlers.forEach(handler => {
        ipcMain.removeHandler(handler);
    });

    console.log('[JARVIS API] All handlers removed');
}

export default { setupJarvisAPI, teardownJarvisAPI };
