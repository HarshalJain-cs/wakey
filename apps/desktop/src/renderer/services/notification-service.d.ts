export interface NotificationOptions {
    title: string;
    body: string;
    icon?: string;
    silent?: boolean;
    urgency?: 'low' | 'normal' | 'critical';
    tag?: string;
    onClick?: () => void;
}
/**
 * Show a notification
 */
export declare function showNotification(options: NotificationOptions): string;
/**
 * Show a focus session reminder
 */
export declare function showFocusReminder(minutesElapsed: number): void;
/**
 * Show a distraction alert
 */
export declare function showDistractionAlert(appName: string): void;
/**
 * Show a goal achieved notification
 */
export declare function showGoalAchieved(goalName: string): void;
/**
 * Show a daily summary notification
 */
export declare function showDailySummary(focusMinutes: number, sessions: number): void;
/**
 * Show a break reminder
 */
export declare function showBreakReminder(): void;
/**
 * Show sync status notification
 */
export declare function showSyncStatus(success: boolean, error?: string): void;
/**
 * Schedule a notification for a specific time
 */
export declare function scheduleNotification(options: NotificationOptions, delayMs: number): string;
/**
 * Cancel a scheduled notification
 */
export declare function cancelScheduledNotification(id: string): boolean;
/**
 * Cancel all scheduled notifications
 */
export declare function cancelAllScheduled(): void;
export declare function loadSettings(): Promise<void>;
export declare function isNotificationsEnabled(): boolean;
export declare function setNotificationsEnabled(enabled: boolean): void;
export declare function isSoundEnabled(): boolean;
export declare function setSoundEnabled(enabled: boolean): void;
//# sourceMappingURL=notification-service.d.ts.map