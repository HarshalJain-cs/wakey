/**
 * @fileoverview Productivity Streaks Service
 * 
 * Tracks consecutive days of meeting productivity goals.
 * Gamification through streaks encourages consistent behavior.
 */

export interface Streak {
    type: StreakType;
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string;
    isActive: boolean;
}

export type StreakType =
    | 'focus-goal'      // Met daily focus goal
    | 'work-hours'      // Worked minimum hours
    | 'no-distractions' // Stayed under distraction limit
    | 'deep-work'       // Had at least one deep work session
    | 'breaks-taken'    // Took required breaks
    | 'early-start'     // Started work before 9am
    | 'on-time-finish'; // Stopped work before 6pm

interface StreakData {
    streaks: Record<StreakType, Streak>;
    history: StreakHistoryItem[];
}

interface StreakHistoryItem {
    date: string;
    type: StreakType;
    achieved: boolean;
}

const STREAK_CONFIGS: Record<StreakType, { name: string; icon: string; description: string }> = {
    'focus-goal': { name: 'Focus Champion', icon: '🎯', description: 'Met daily focus goal' },
    'work-hours': { name: 'Consistent Worker', icon: '⏰', description: 'Worked minimum hours' },
    'no-distractions': { name: 'Distraction Free', icon: '🚫', description: 'Stayed under distraction limit' },
    'deep-work': { name: 'Deep Worker', icon: '🧠', description: 'Completed deep work session' },
    'breaks-taken': { name: 'Balanced', icon: '☕', description: 'Took proper breaks' },
    'early-start': { name: 'Early Bird', icon: '🌅', description: 'Started before 9am' },
    'on-time-finish': { name: 'Life Balancer', icon: '🌙', description: 'Finished before 6pm' },
};

class StreakService {
    private data: StreakData;

    constructor() {
        this.data = this.loadFromStorage();
    }

    private loadFromStorage(): StreakData {
        try {
            const stored = localStorage.getItem('wakey_streaks');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load streaks:', error);
        }

        // Initialize with default streaks
        const streaks: Record<StreakType, Streak> = {} as Record<StreakType, Streak>;
        for (const type of Object.keys(STREAK_CONFIGS) as StreakType[]) {
            streaks[type] = {
                type,
                currentStreak: 0,
                longestStreak: 0,
                lastActiveDate: '',
                isActive: false,
            };
        }
        return { streaks, history: [] };
    }

    private saveToStorage(): void {
        localStorage.setItem('wakey_streaks', JSON.stringify(this.data));
    }

    private getTodayDate(): string {
        return new Date().toISOString().split('T')[0];
    }

    private getYesterdayDate(): string {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toISOString().split('T')[0];
    }

    /**
     * Record that a streak goal was achieved today
     */
    recordAchievement(type: StreakType): void {
        const today = this.getTodayDate();
        const streak = this.data.streaks[type];

        // Already recorded today
        if (streak.lastActiveDate === today) {
            return;
        }

        const yesterday = this.getYesterdayDate();

        if (streak.lastActiveDate === yesterday) {
            // Continuing streak
            streak.currentStreak++;
        } else {
            // Starting new streak
            streak.currentStreak = 1;
        }

        streak.lastActiveDate = today;
        streak.isActive = true;
        streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);

        // Record in history
        this.data.history.push({
            date: today,
            type,
            achieved: true,
        });

        this.saveToStorage();
    }

    /**
     * Check and update streak status for today
     * Call this at end of day or app startup
     */
    checkStreakStatus(): void {
        const today = this.getTodayDate();
        const yesterday = this.getYesterdayDate();

        for (const type of Object.keys(this.data.streaks) as StreakType[]) {
            const streak = this.data.streaks[type];

            // If last active was before yesterday, streak is broken
            if (streak.lastActiveDate &&
                streak.lastActiveDate !== today &&
                streak.lastActiveDate !== yesterday) {
                streak.currentStreak = 0;
                streak.isActive = false;
            }
        }

        this.saveToStorage();
    }

    /**
     * Get all streaks
     */
    getAllStreaks(): Streak[] {
        return Object.values(this.data.streaks);
    }

    /**
     * Get active streaks (current > 0)
     */
    getActiveStreaks(): Streak[] {
        return this.getAllStreaks().filter(s => s.currentStreak > 0);
    }

    /**
     * Get streak by type
     */
    getStreak(type: StreakType): Streak {
        return this.data.streaks[type];
    }

    /**
     * Get streak config (name, icon, description)
     */
    getStreakConfig(type: StreakType) {
        return STREAK_CONFIGS[type];
    }

    /**
     * Get all streak configs
     */
    getAllConfigs() {
        return STREAK_CONFIGS;
    }

    /**
     * Get total streak score (sum of all active streaks)
     */
    getTotalStreakScore(): number {
        return this.getAllStreaks().reduce((sum, s) => sum + s.currentStreak, 0);
    }

    /**
     * Get history for past N days
     */
    getHistory(days: number = 7): StreakHistoryItem[] {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        const cutoffStr = cutoff.toISOString().split('T')[0];

        return this.data.history.filter(h => h.date >= cutoffStr);
    }
}

export const streakService = new StreakService();
export default streakService;
