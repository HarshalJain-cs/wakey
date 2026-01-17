/**
 * @fileoverview Deep Work Detection Service
 * 
 * Automatically detects extended periods of uninterrupted focused work.
 * Deep work = 60+ minutes without context switching to distraction apps.
 */

export interface DeepWorkSession {
    id: string;
    startTime: Date;
    endTime: Date | null;
    durationMinutes: number;
    apps: string[];
    isComplete: boolean;
}

interface DeepWorkConfig {
    minimumMinutes: number;          // Minutes required for deep work (default 60)
    maxContextSwitches: number;      // Max switches allowed (default 3)
    allowedBreakMinutes: number;     // Short breaks don't break the session (default 5)
    distractionApps: string[];       // Apps that break deep work
}

const DEFAULT_CONFIG: DeepWorkConfig = {
    minimumMinutes: 60,
    maxContextSwitches: 3,
    allowedBreakMinutes: 5,
    distractionApps: [
        'youtube', 'netflix', 'tiktok', 'twitter', 'x.com',
        'facebook', 'instagram', 'reddit', 'discord', 'telegram',
        'whatsapp', 'slack', 'messenger', 'snapchat'
    ],
};

class DeepWorkService {
    private config: DeepWorkConfig;
    private sessions: DeepWorkSession[] = [];
    private currentSession: DeepWorkSession | null = null;
    private sessionStartTime: Date | null = null;
    private _contextSwitchCount: number = 0;
    private lastActivityTime: Date = new Date();
    private focusedApps: Set<string> = new Set();

    constructor() {
        this.config = { ...DEFAULT_CONFIG };
        this.loadFromStorage();
    }

    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem('wakey_deep_work');
            if (stored) {
                const data = JSON.parse(stored);
                this.sessions = data.sessions || [];
                this.config = { ...DEFAULT_CONFIG, ...data.config };
            }
        } catch (error) {
            console.error('Failed to load deep work data:', error);
        }
    }

    private saveToStorage(): void {
        localStorage.setItem('wakey_deep_work', JSON.stringify({
            sessions: this.sessions,
            config: this.config,
        }));
    }

    /**
     * Process activity event from tracking
     */
    processActivity(appName: string, _windowTitle: string): void {
        const now = new Date();
        const isDistraction = this.isDistractionApp(appName);

        if (isDistraction) {
            // Distraction detected - check if it breaks the session
            if (this.currentSession) {
                const breakDuration = (now.getTime() - this.lastActivityTime.getTime()) / 60000;

                if (breakDuration > this.config.allowedBreakMinutes) {
                    // Session broken
                    this.endCurrentSession(false);
                }
            }
        } else {
            // Productive activity
            if (!this.currentSession) {
                this.startNewSession();
            }

            this.focusedApps.add(appName);
            this.updateSessionDuration();
        }

        this.lastActivityTime = now;
    }

    private isDistractionApp(appName: string): boolean {
        const lowerName = appName.toLowerCase();
        return this.config.distractionApps.some(d => lowerName.includes(d));
    }

    private startNewSession(): void {
        this.sessionStartTime = new Date();
        this._contextSwitchCount = 0;
        this.focusedApps = new Set();

        this.currentSession = {
            id: `deep_${Date.now()}`,
            startTime: this.sessionStartTime,
            endTime: null,
            durationMinutes: 0,
            apps: [],
            isComplete: false,
        };
    }

    private updateSessionDuration(): void {
        if (!this.currentSession || !this.sessionStartTime) return;

        const now = new Date();
        const duration = (now.getTime() - this.sessionStartTime.getTime()) / 60000;
        this.currentSession.durationMinutes = Math.round(duration);
        this.currentSession.apps = Array.from(this.focusedApps);

        // Check if session qualifies as deep work
        if (duration >= this.config.minimumMinutes && !this.currentSession.isComplete) {
            this.currentSession.isComplete = true;
            this.onDeepWorkAchieved();
        }
    }

    private endCurrentSession(completed: boolean): void {
        if (!this.currentSession) return;

        this.currentSession.endTime = new Date();
        this.currentSession.isComplete = completed &&
            this.currentSession.durationMinutes >= this.config.minimumMinutes;

        if (this.currentSession.durationMinutes >= 15) {
            // Only save sessions 15+ minutes
            this.sessions.push(this.currentSession);
            this.saveToStorage();
        }

        this.currentSession = null;
        this.sessionStartTime = null;
    }

    private onDeepWorkAchieved(): void {
        // Trigger notification or streak update
        console.log('🧠 Deep Work session achieved!');
        // Could emit event or call notification service
    }

    /**
     * Get current session info
     */
    getCurrentSession(): DeepWorkSession | null {
        if (this.currentSession) {
            this.updateSessionDuration();
        }
        return this.currentSession;
    }

    /**
     * Get today's deep work sessions
     */
    getTodaySessions(): DeepWorkSession[] {
        const today = new Date().toISOString().split('T')[0];
        return this.sessions.filter(s =>
            s.startTime.toString().startsWith(today) && s.isComplete
        );
    }

    /**
     * Get total deep work minutes today
     */
    getTodayDeepWorkMinutes(): number {
        return this.getTodaySessions().reduce((sum, s) => sum + s.durationMinutes, 0);
    }

    /**
     * Get all completed deep work sessions
     */
    getCompletedSessions(days: number = 7): DeepWorkSession[] {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        return this.sessions.filter(s =>
            s.isComplete && new Date(s.startTime) >= cutoff
        );
    }

    /**
     * Check if currently in deep work
     */
    isInDeepWork(): boolean {
        if (!this.currentSession) return false;
        return this.currentSession.durationMinutes >= this.config.minimumMinutes;
    }

    /**
     * Get time until deep work achieved (in current session)
     */
    getTimeUntilDeepWork(): number {
        if (!this.currentSession) return this.config.minimumMinutes;
        return Math.max(0, this.config.minimumMinutes - this.currentSession.durationMinutes);
    }

    /**
     * Get context switch count for current session
     */
    getContextSwitchCount(): number {
        return this._contextSwitchCount;
    }

    /**
     * Update configuration
     */
    updateConfig(config: Partial<DeepWorkConfig>): void {
        this.config = { ...this.config, ...config };
        this.saveToStorage();
    }

    /**
     * Get configuration
     */
    getConfig(): DeepWorkConfig {
        return { ...this.config };
    }
}

export const deepWorkService = new DeepWorkService();
export default deepWorkService;
