// Notification Service
// Handles desktop notifications via Electron's notification API

export interface NotificationOptions {
    title: string;
    body: string;
    icon?: string;
    silent?: boolean;
    urgency?: 'low' | 'normal' | 'critical';
    tag?: string;
    onClick?: () => void;
}

// ==========================================
// Notification Queue
// ==========================================

interface QueuedNotification extends NotificationOptions {
    id: string;
    timestamp: number;
}

let notificationQueue: QueuedNotification[] = [];
let isProcessing = false;

// Rate limiting: max 3 notifications per minute
const RATE_LIMIT = 3;
const RATE_WINDOW = 60000; // 1 minute
let recentNotifications: number[] = [];

// ==========================================
// Core Functions
// ==========================================

/**
 * Show a notification
 */
export function showNotification(options: NotificationOptions): string {
    const id = generateId();

    // Check rate limiting
    const now = Date.now();
    recentNotifications = recentNotifications.filter(t => now - t < RATE_WINDOW);

    if (recentNotifications.length >= RATE_LIMIT) {
        // Queue for later
        notificationQueue.push({
            ...options,
            id,
            timestamp: now,
        });
        processQueue();
        return id;
    }

    // Show immediately
    displayNotification(options, id);
    recentNotifications.push(now);

    return id;
}

/**
 * Show a focus session reminder
 */
export function showFocusReminder(minutesElapsed: number): void {
    showNotification({
        title: '⏰ Focus Check-In',
        body: `You've been focused for ${minutesElapsed} minutes. Great work! Take a break soon.`,
        urgency: 'normal',
        tag: 'focus-reminder',
    });
}

/**
 * Show a distraction alert
 */
export function showDistractionAlert(appName: string): void {
    showNotification({
        title: '⚠️ Distraction Detected',
        body: `You're using ${appName} during focus time. Stay on track!`,
        urgency: 'critical',
        tag: 'distraction-alert',
    });
}

/**
 * Show a goal achieved notification
 */
export function showGoalAchieved(goalName: string): void {
    showNotification({
        title: '🎉 Goal Achieved!',
        body: `Congratulations! You've completed: ${goalName}`,
        urgency: 'normal',
        tag: 'goal-achieved',
    });
}

/**
 * Show a daily summary notification
 */
export function showDailySummary(focusMinutes: number, sessions: number): void {
    const hours = Math.floor(focusMinutes / 60);
    const mins = focusMinutes % 60;
    const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    showNotification({
        title: '📊 Daily Summary',
        body: `Today: ${timeStr} focused across ${sessions} sessions`,
        urgency: 'low',
        tag: 'daily-summary',
    });
}

/**
 * Show a break reminder
 */
export function showBreakReminder(): void {
    showNotification({
        title: '☕ Time for a Break',
        body: 'You\'ve been working hard. Take 5 minutes to rest your eyes and stretch.',
        urgency: 'normal',
        tag: 'break-reminder',
    });
}

/**
 * Show sync status notification
 */
export function showSyncStatus(success: boolean, error?: string): void {
    if (success) {
        showNotification({
            title: '☁️ Sync Complete',
            body: 'Your data has been synced to the cloud.',
            urgency: 'low',
            tag: 'sync-status',
        });
    } else {
        showNotification({
            title: '⚠️ Sync Failed',
            body: error || 'Failed to sync data. Will retry later.',
            urgency: 'normal',
            tag: 'sync-status',
        });
    }
}

// ==========================================
// Scheduled Notifications
// ==========================================

let scheduledTimers: Map<string, NodeJS.Timeout> = new Map();

/**
 * Schedule a notification for a specific time
 */
export function scheduleNotification(
    options: NotificationOptions,
    delayMs: number
): string {
    const id = generateId();

    const timer = setTimeout(() => {
        showNotification(options);
        scheduledTimers.delete(id);
    }, delayMs);

    scheduledTimers.set(id, timer);
    return id;
}

/**
 * Cancel a scheduled notification
 */
export function cancelScheduledNotification(id: string): boolean {
    const timer = scheduledTimers.get(id);
    if (timer) {
        clearTimeout(timer);
        scheduledTimers.delete(id);
        return true;
    }
    return false;
}

/**
 * Cancel all scheduled notifications
 */
export function cancelAllScheduled(): void {
    scheduledTimers.forEach(timer => clearTimeout(timer));
    scheduledTimers.clear();
}

// ==========================================
// Internal Functions
// ==========================================

function displayNotification(options: NotificationOptions, id: string): void {
    if ('Notification' in window) {
        // Use browser Notification API (works in renderer process)
        if (Notification.permission === 'granted') {
            const notification = new Notification(options.title, {
                body: options.body,
                icon: options.icon || '/icon.png',
                silent: options.silent,
                tag: options.tag,
            });

            if (options.onClick) {
                notification.onclick = options.onClick;
            }
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    displayNotification(options, id);
                }
            });
        }
    }
}

function processQueue(): void {
    if (isProcessing || notificationQueue.length === 0) return;

    isProcessing = true;

    const checkAndProcess = () => {
        const now = Date.now();
        recentNotifications = recentNotifications.filter(t => now - t < RATE_WINDOW);

        if (recentNotifications.length < RATE_LIMIT && notificationQueue.length > 0) {
            const next = notificationQueue.shift()!;
            displayNotification(next, next.id);
            recentNotifications.push(now);
        }

        if (notificationQueue.length > 0) {
            setTimeout(checkAndProcess, 5000); // Check again in 5 seconds
        } else {
            isProcessing = false;
        }
    };

    setTimeout(checkAndProcess, 5000);
}

function generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ==========================================
// Settings Integration
// ==========================================

let notificationsEnabled = true;
let soundEnabled = true;

export async function loadSettings(): Promise<void> {
    try {
        const settings = await window.wakey.getSettings();
        notificationsEnabled = settings.notificationsEnabled as boolean ?? true;
        soundEnabled = settings.soundEnabled as boolean ?? true;
    } catch (error) {
        console.error('Failed to load notification settings:', error);
    }
}

export function isNotificationsEnabled(): boolean {
    return notificationsEnabled;
}

export function setNotificationsEnabled(enabled: boolean): void {
    notificationsEnabled = enabled;
}

export function isSoundEnabled(): boolean {
    return soundEnabled;
}

export function setSoundEnabled(enabled: boolean): void {
    soundEnabled = enabled;
}
