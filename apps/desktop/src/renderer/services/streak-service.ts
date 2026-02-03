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
    frozenUntil?: string;       // Date until streak is frozen
    freezesUsed: number;        // Number of freezes used this month
    freezesRemaining: number;   // Freezes available (resets monthly)
    milestoneReached: number[];  // Array of milestone streak counts reached
}

export type StreakType =
    | 'focus-goal'      // Met daily focus goal
    | 'work-hours'      // Worked minimum hours
    | 'no-distractions' // Stayed under distraction limit
    | 'deep-work'       // Had at least one deep work session
    | 'breaks-taken'    // Took required breaks
    | 'early-start'     // Started work before 9am
    | 'on-time-finish'; // Stopped work before 6pm

export interface StreakMilestone {
    days: number;
    name: string;
    icon: string;
    reward: string;
    color: string;
}

interface StreakData {
    streaks: Record<StreakType, Streak>;
    history: StreakHistoryItem[];
    vacationMode: boolean;
    vacationStart?: string;
    vacationEnd?: string;
    totalFreezesDays: number;
}

interface StreakHistoryItem {
    date: string;
    type: StreakType;
    achieved: boolean;
    wasFrozen?: boolean;
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

const STREAK_MILESTONES: StreakMilestone[] = [
    { days: 3, name: 'Getting Started', icon: '🌱', reward: '5 XP', color: '#4CAF50' },
    { days: 7, name: 'Week Warrior', icon: '🔥', reward: '25 XP + Badge', color: '#FF9800' },
    { days: 14, name: 'Fortnight Fighter', icon: '⚡', reward: '50 XP', color: '#2196F3' },
    { days: 30, name: 'Month Master', icon: '🏆', reward: '100 XP + Theme', color: '#9C27B0' },
    { days: 60, name: 'Consistency King', icon: '👑', reward: '200 XP + Badge', color: '#FFD700' },
    { days: 100, name: 'Century Club', icon: '💯', reward: '500 XP + Title', color: '#E91E63' },
    { days: 365, name: 'Year Champion', icon: '🌟', reward: '2000 XP + Legendary Badge', color: '#00BCD4' },
];

const MAX_MONTHLY_FREEZES = 3;

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
                frozenUntil: undefined,
                freezesUsed: 0,
                freezesRemaining: MAX_MONTHLY_FREEZES,
                milestoneReached: [],
            };
        }
        return { streaks, history: [], vacationMode: false, totalFreezesDays: 0 };
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

        // Don't break streaks during vacation mode
        if (this.isVacationMode()) {
            return;
        }

        for (const type of Object.keys(this.data.streaks) as StreakType[]) {
            const streak = this.data.streaks[type];

            // Check if streak is frozen (protected)
            if (streak.frozenUntil && streak.frozenUntil >= today) {
                continue; // Streak is protected, skip
            }

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

    /**
     * Freeze a streak for 1 day (uses one of the monthly freezes)
     */
    freezeStreak(type: StreakType): { success: boolean; message: string } {
        const streak = this.data.streaks[type];

        if (streak.freezesRemaining <= 0) {
            return { success: false, message: 'No freezes remaining this month' };
        }

        if (streak.frozenUntil && streak.frozenUntil >= this.getTodayDate()) {
            return { success: false, message: 'Streak is already frozen' };
        }

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        streak.frozenUntil = tomorrow.toISOString().split('T')[0];
        streak.freezesUsed++;
        streak.freezesRemaining--;
        this.data.totalFreezesDays++;

        this.saveToStorage();
        return { success: true, message: 'Streak frozen for 1 day' };
    }

    /**
     * Enable vacation mode - preserves all streaks during vacation
     */
    setVacationMode(enabled: boolean, endDate?: string): void {
        this.data.vacationMode = enabled;

        if (enabled) {
            this.data.vacationStart = this.getTodayDate();
            this.data.vacationEnd = endDate;
        } else {
            this.data.vacationStart = undefined;
            this.data.vacationEnd = undefined;
        }

        this.saveToStorage();
    }

    /**
     * Check if currently in vacation mode
     */
    isVacationMode(): boolean {
        if (!this.data.vacationMode) return false;

        // Auto-disable if end date passed
        if (this.data.vacationEnd && this.data.vacationEnd < this.getTodayDate()) {
            this.setVacationMode(false);
            return false;
        }

        return true;
    }

    /**
     * Check for new milestones and return newly reached ones
     */
    checkMilestones(type: StreakType): StreakMilestone[] {
        const streak = this.data.streaks[type];
        const newMilestones: StreakMilestone[] = [];

        for (const milestone of STREAK_MILESTONES) {
            if (streak.currentStreak >= milestone.days &&
                !streak.milestoneReached.includes(milestone.days)) {
                streak.milestoneReached.push(milestone.days);
                newMilestones.push(milestone);
            }
        }

        if (newMilestones.length > 0) {
            this.saveToStorage();
        }

        return newMilestones;
    }

    /**
     * Get all available milestones with progress
     */
    getMilestones(type: StreakType): Array<StreakMilestone & { reached: boolean; progress: number }> {
        const streak = this.data.streaks[type];

        return STREAK_MILESTONES.map(m => ({
            ...m,
            reached: streak.milestoneReached.includes(m.days),
            progress: Math.min(100, (streak.currentStreak / m.days) * 100)
        }));
    }

    /**
     * Get next milestone for a streak
     */
    getNextMilestone(type: StreakType): StreakMilestone | null {
        const streak = this.data.streaks[type];

        for (const milestone of STREAK_MILESTONES) {
            if (streak.currentStreak < milestone.days) {
                return milestone;
            }
        }

        return null; // All milestones reached!
    }

    /**
     * Reset monthly freezes (call at start of month)
     */
    resetMonthlyFreezes(): void {
        for (const type of Object.keys(this.data.streaks) as StreakType[]) {
            this.data.streaks[type].freezesUsed = 0;
            this.data.streaks[type].freezesRemaining = MAX_MONTHLY_FREEZES;
        }
        this.saveToStorage();
    }

    /**
     * Get streak recovery challenge (when streak is broken)
     */
    getRecoveryChallenge(type: StreakType): { name: string; description: string; goal: number } | null {
        const streak = this.data.streaks[type];

        // Only offer recovery if streak was recently broken (within 3 days)
        if (streak.currentStreak > 0 || !streak.lastActiveDate) {
            return null;
        }

        const daysSinceLast = Math.floor(
            (Date.now() - new Date(streak.lastActiveDate).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceLast > 3) {
            return null;
        }

        return {
            name: 'Streak Recovery Challenge',
            description: `Complete your ${STREAK_CONFIGS[type].name} goal 3 days in a row to earn a bonus freeze`,
            goal: 3
        };
    }
}

export const streakService = new StreakService();
export { STREAK_MILESTONES, STREAK_CONFIGS };
export default streakService;
