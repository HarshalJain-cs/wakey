/**
 * @fileoverview JARVIS API for Main Process
 * 
 * IPC handlers for JARVIS integration:
 * - Activity data endpoints
 * - Focus session control
 * - Task management API
 * - Insights retrieval
 * 
 * SECURITY: This module uses proper IPC handlers instead of executeJavaScript()
 * to prevent code injection vulnerabilities.
 * 
 * @module main/jarvis-api
 */

import { ipcMain, BrowserWindow } from 'electron';
import { logger } from './logger';
import { isValidVoiceCommand, parseVoiceCommand, sanitizeCommand } from './voice-validator';

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
 * 
 * SECURITY: All data retrieval now uses IPC message passing instead of
 * executeJavaScript() to prevent code injection attacks.
 */
export function setupJarvisAPI(mainWindow: BrowserWindow): void {
    logger.info('[JARVIS API] Setting up IPC handlers...');

    // ==========================================
    // Activity Endpoints (Using secure IPC)
    // ==========================================

    /**
     * Get today's activity stats
     * SECURITY: Uses IPC request/response pattern instead of executeJavaScript
     */
    ipcMain.handle('jarvis:get-stats', async (): Promise<JarvisAPIResponse<ActivityStats>> => {
        try {
            // Request stats from renderer via IPC
            const statsPromise = new Promise<ActivityStats>((resolve) => {
                const handler = (_event: Electron.IpcMainEvent, stats: ActivityStats) => {
                    ipcMain.removeListener('jarvis:stats-response', handler);
                    resolve(stats);
                };
                ipcMain.on('jarvis:stats-response', handler);
                mainWindow.webContents.send('jarvis:request-stats');

                // Timeout fallback
                setTimeout(() => {
                    ipcMain.removeListener('jarvis:stats-response', handler);
                    resolve({
                        focusMinutes: 0,
                        breakMinutes: 0,
                        distractionMinutes: 0,
                        tasksCompleted: 0,
                        focusScore: 0,
                        deepWorkSessions: 0,
                    });
                }, 1000);
            });

            const stats = await statsPromise;
            return { success: true, data: stats };
        } catch (error) {
            logger.error('[JARVIS API] Failed to get stats:', error);
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
            const activityPromise = new Promise<unknown>((resolve) => {
                const handler = (_event: Electron.IpcMainEvent, activity: unknown) => {
                    ipcMain.removeListener('jarvis:activity-response', handler);
                    resolve(activity);
                };
                ipcMain.on('jarvis:activity-response', handler);
                mainWindow.webContents.send('jarvis:request-activity');

                setTimeout(() => {
                    ipcMain.removeListener('jarvis:activity-response', handler);
                    resolve(null);
                }, 1000);
            });

            const activity = await activityPromise;
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
            const sessionPromise = new Promise<FocusSession | null>((resolve) => {
                const handler = (_event: Electron.IpcMainEvent, session: FocusSession | null) => {
                    ipcMain.removeListener('jarvis:focus-session-response', handler);
                    resolve(session);
                };
                ipcMain.on('jarvis:focus-session-response', handler);
                mainWindow.webContents.send('jarvis:request-focus-session');

                setTimeout(() => {
                    ipcMain.removeListener('jarvis:focus-session-response', handler);
                    resolve(null);
                }, 1000);
            });

            const session = await sessionPromise;
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
            const tasksPromise = new Promise<Task[]>((resolve) => {
                const handler = (_event: Electron.IpcMainEvent, tasks: Task[]) => {
                    ipcMain.removeListener('jarvis:tasks-response', handler);
                    resolve(tasks);
                };
                ipcMain.on('jarvis:tasks-response', handler);
                mainWindow.webContents.send('jarvis:request-tasks');

                setTimeout(() => {
                    ipcMain.removeListener('jarvis:tasks-response', handler);
                    resolve([]);
                }, 1000);
            });

            const tasks = await tasksPromise;
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
            // Sanitize input
            const sanitizedTitle = title.slice(0, 200).replace(/[<>]/g, '');
            const sanitizedPriority = ['low', 'medium', 'high'].includes(priority) ? priority : 'medium';

            mainWindow.webContents.send('jarvis:command', {
                type: 'create-task',
                title: sanitizedTitle,
                priority: sanitizedPriority,
            });

            const task: Task = {
                id: `task_${Date.now()}`,
                title: sanitizedTitle,
                status: 'todo',
                priority: sanitizedPriority as Task['priority'],
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
            // Sanitize taskId
            const sanitizedId = taskId.slice(0, 100).replace(/[^a-zA-Z0-9_-]/g, '');

            mainWindow.webContents.send('jarvis:command', {
                type: 'complete-task',
                taskId: sanitizedId,
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
            const insightsPromise = new Promise<string[]>((resolve) => {
                const handler = (_event: Electron.IpcMainEvent, insights: string[]) => {
                    ipcMain.removeListener('jarvis:insights-response', handler);
                    resolve(insights);
                };
                ipcMain.on('jarvis:insights-response', handler);
                mainWindow.webContents.send('jarvis:request-insights');

                setTimeout(() => {
                    ipcMain.removeListener('jarvis:insights-response', handler);
                    resolve([]);
                }, 1000);
            });

            const insights = await insightsPromise;
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
            const predictionsPromise = new Promise<unknown>((resolve) => {
                const handler = (_event: Electron.IpcMainEvent, predictions: unknown) => {
                    ipcMain.removeListener('jarvis:predictions-response', handler);
                    resolve(predictions);
                };
                ipcMain.on('jarvis:predictions-response', handler);
                mainWindow.webContents.send('jarvis:request-predictions');

                setTimeout(() => {
                    ipcMain.removeListener('jarvis:predictions-response', handler);
                    resolve([]);
                }, 1000);
            });

            const predictions = await predictionsPromise;
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
            const statusPromise = new Promise<{ isTracking: boolean }>((resolve) => {
                const handler = (_event: Electron.IpcMainEvent, status: { isTracking: boolean }) => {
                    ipcMain.removeListener('jarvis:tracking-status-response', handler);
                    resolve(status);
                };
                ipcMain.on('jarvis:tracking-status-response', handler);
                mainWindow.webContents.send('jarvis:request-tracking-status');

                setTimeout(() => {
                    ipcMain.removeListener('jarvis:tracking-status-response', handler);
                    resolve({ isTracking: false });
                }, 1000);
            });

            const status = await statusPromise;
            return { success: true, data: status };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get tracking status',
            };
        }
    });

    // ==========================================
    // Voice Command Handler (SECURED)
    // ==========================================

    /**
     * Execute voice command
     * 
     * SECURITY: Commands are validated against an allowlist before execution.
     * This prevents command injection attacks.
     */
    ipcMain.handle('jarvis:voice-command', async (_event, command: string): Promise<JarvisAPIResponse<string>> => {
        try {
            // Step 1: Sanitize the command
            const sanitized = sanitizeCommand(command);

            if (!sanitized) {
                logger.warn('[JARVIS API] Empty voice command received');
                return { success: false, error: 'Empty command' };
            }

            // Step 2: Validate against allowlist
            if (!isValidVoiceCommand(sanitized)) {
                logger.warn('[JARVIS API] Invalid voice command rejected:', sanitized);
                return {
                    success: false,
                    error: 'Command not recognized. Try: start focus, stop focus, create task [title], get stats'
                };
            }

            // Step 3: Parse and execute the command
            const parsed = parseVoiceCommand(sanitized);

            if (!parsed) {
                return { success: false, error: 'Could not parse command' };
            }

            logger.debug('[JARVIS API] Executing voice command:', parsed);

            // Execute based on command type
            let responseMessage = '';

            switch (parsed.type) {
                case 'focus':
                    if (parsed.action === 'start') {
                        mainWindow.webContents.send('jarvis:command', {
                            type: 'start-focus',
                            duration: parsed.params.duration || 25,
                        });
                        responseMessage = `Starting ${parsed.params.duration || 25} minute focus session`;
                    } else {
                        mainWindow.webContents.send('jarvis:command', { type: 'stop-focus' });
                        responseMessage = 'Focus session stopped';
                    }
                    break;

                case 'break':
                    mainWindow.webContents.send('jarvis:command', {
                        type: 'start-break',
                        duration: parsed.params.duration || 5,
                    });
                    responseMessage = `Starting ${parsed.params.duration || 5} minute break`;
                    break;

                case 'task':
                    if (parsed.action === 'create') {
                        mainWindow.webContents.send('jarvis:command', {
                            type: 'create-task',
                            title: parsed.params.title,
                            priority: 'medium',
                        });
                        responseMessage = `Created task: ${parsed.params.title}`;
                    } else if (parsed.action === 'complete') {
                        mainWindow.webContents.send('jarvis:command', {
                            type: 'complete-task',
                            title: parsed.params.title,
                        });
                        responseMessage = `Marked task as complete: ${parsed.params.title}`;
                    }
                    break;

                case 'query':
                    mainWindow.webContents.send('jarvis:command', {
                        type: 'query',
                        query: parsed.action,
                    });
                    responseMessage = `Getting ${parsed.action}...`;
                    break;

                case 'tracking':
                    mainWindow.webContents.send('jarvis:command', {
                        type: `${parsed.action}-tracking`,
                    });
                    responseMessage = `Tracking ${parsed.action}ed`;
                    break;

                case 'navigation':
                    mainWindow.webContents.send('jarvis:command', {
                        type: 'navigate',
                        page: parsed.params.page,
                    });
                    responseMessage = `Opening ${parsed.params.page}`;
                    break;

                default:
                    responseMessage = 'Command processed';
            }

            return { success: true, data: responseMessage };
        } catch (error) {
            logger.error('[JARVIS API] Voice command error:', error);
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

    logger.info('[JARVIS API] All handlers registered');
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

    logger.info('[JARVIS API] All handlers removed');
}

export default { setupJarvisAPI, teardownJarvisAPI };
