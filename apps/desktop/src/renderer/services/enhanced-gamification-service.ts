// apps/desktop/src/renderer/services/enhanced-gamification-service.ts
// Phase 18: Enhanced Gamification & Challenges 2.0

/**
 * Enhanced Gamification Service
 * 
 * Advanced gamification features:
 * - Multi-tier achievements with badges
 * - Team challenges and competitions
 * - Seasonal events and limited-time rewards
 * - XP and leveling system
 * - Streaks with milestone bonuses
 * - Daily/Weekly/Monthly challenges
 */

export interface UserLevel {
    level: number;
    title: string;
    currentXP: number;
    requiredXP: number;
    totalXP: number;
    badge: string;
    perks: string[];
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    category: AchievementCategory;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
    icon: string;
    xpReward: number;
    unlockedAt?: Date;
    progress?: number;
    maxProgress?: number;
    secret?: boolean;
}

export type AchievementCategory =
    | 'focus'
    | 'productivity'
    | 'streaks'
    | 'social'
    | 'wellness'
    | 'exploration'
    | 'mastery';

export interface Challenge {
    id: string;
    name: string;
    description: string;
    type: 'daily' | 'weekly' | 'monthly' | 'special';
    category: AchievementCategory;
    goal: number;
    progress: number;
    xpReward: number;
    bonusReward?: string;
    expiresAt: Date;
    participants?: number;
    isTeamChallenge?: boolean;
}

export interface TeamCompetition {
    id: string;
    name: string;
    description: string;
    teams: Team[];
    startDate: Date;
    endDate: Date;
    prizePool: Prize[];
    currentRound: number;
    totalRounds: number;
}

export interface Team {
    id: string;
    name: string;
    members: string[];
    score: number;
    rank: number;
    avatar: string;
}

export interface Prize {
    rank: number;
    xp: number;
    badge?: string;
    title?: string;
}

export interface SeasonalEvent {
    id: string;
    name: string;
    theme: string;
    description: string;
    startDate: Date;
    endDate: Date;
    challenges: Challenge[];
    exclusiveRewards: Achievement[];
    isActive: boolean;
}

const LEVEL_TITLES: Record<number, { title: string; badge: string; perks: string[] }> = {
    1: { title: 'Novice', badge: '🌱', perks: ['Basic features'] },
    5: { title: 'Apprentice', badge: '🌿', perks: ['Custom themes'] },
    10: { title: 'Practitioner', badge: '🌳', perks: ['Priority support'] },
    20: { title: 'Expert', badge: '🌲', perks: ['Beta features'] },
    30: { title: 'Master', badge: '🏔️', perks: ['Feature requests'] },
    50: { title: 'Grandmaster', badge: '⭐', perks: ['Early access'] },
    75: { title: 'Legend', badge: '🌟', perks: ['Custom badges'] },
    100: { title: 'Mythic', badge: '✨', perks: ['Lifetime premium'] }
};

class EnhancedGamificationService {
    private userLevel: UserLevel;
    private achievements: Map<string, Achievement> = new Map();
    private challenges: Challenge[] = [];
    private events: SeasonalEvent[] = [];
    private readonly STORAGE_KEY = 'wakey-gamification';

    constructor() {
        this.userLevel = this.loadUserLevel();
        this.initializeAchievements();
        this.initializeChallenges();
        this.loadFromStorage();
    }

    // ============================================
    // Leveling System
    // ============================================

    getUserLevel(): UserLevel {
        return { ...this.userLevel };
    }

    addXP(amount: number, source?: string): { leveledUp: boolean; newLevel?: UserLevel } {
        this.userLevel.currentXP += amount;
        this.userLevel.totalXP += amount;

        let leveledUp = false;
        while (this.userLevel.currentXP >= this.userLevel.requiredXP) {
            this.userLevel.currentXP -= this.userLevel.requiredXP;
            this.userLevel.level++;
            this.userLevel.requiredXP = this.calculateRequiredXP(this.userLevel.level);
            this.updateLevelInfo();
            leveledUp = true;
        }

        this.saveToStorage();

        return {
            leveledUp,
            newLevel: leveledUp ? { ...this.userLevel } : undefined
        };
    }

    private calculateRequiredXP(level: number): number {
        // Exponential growth curve
        return Math.floor(100 * Math.pow(1.15, level - 1));
    }

    private updateLevelInfo() {
        const levelThresholds = Object.keys(LEVEL_TITLES).map(Number).sort((a, b) => b - a);
        const matchingLevel = levelThresholds.find(threshold => this.userLevel.level >= threshold) || 1;
        const levelInfo = LEVEL_TITLES[matchingLevel];

        this.userLevel.title = levelInfo.title;
        this.userLevel.badge = levelInfo.badge;
        this.userLevel.perks = levelInfo.perks;
    }

    private loadUserLevel(): UserLevel {
        return {
            level: 1,
            title: 'Novice',
            currentXP: 0,
            requiredXP: 100,
            totalXP: 0,
            badge: '🌱',
            perks: ['Basic features']
        };
    }

    // ============================================
    // Achievements
    // ============================================

    private initializeAchievements() {
        const achievementsList: Achievement[] = [
            // Focus achievements
            { id: 'first-focus', name: 'First Steps', description: 'Complete your first focus session', category: 'focus', tier: 'bronze', icon: '🎯', xpReward: 50 },
            { id: 'focus-10', name: 'Getting Focused', description: 'Complete 10 focus sessions', category: 'focus', tier: 'bronze', icon: '🎯', xpReward: 100 },
            { id: 'focus-50', name: 'Focus Warrior', description: 'Complete 50 focus sessions', category: 'focus', tier: 'silver', icon: '⚔️', xpReward: 250 },
            { id: 'focus-100', name: 'Focus Master', description: 'Complete 100 focus sessions', category: 'focus', tier: 'gold', icon: '👑', xpReward: 500 },
            { id: 'focus-500', name: 'Focus Legend', description: 'Complete 500 focus sessions', category: 'focus', tier: 'platinum', icon: '🏆', xpReward: 1000 },
            { id: 'deep-work-1h', name: 'Deep Diver', description: 'Complete a 1-hour deep work session', category: 'focus', tier: 'silver', icon: '🌊', xpReward: 150 },
            { id: 'deep-work-2h', name: 'Ocean Explorer', description: 'Complete a 2-hour deep work session', category: 'focus', tier: 'gold', icon: '🐋', xpReward: 300 },

            // Streak achievements
            { id: 'streak-3', name: 'Triple Threat', description: 'Maintain a 3-day streak', category: 'streaks', tier: 'bronze', icon: '🔥', xpReward: 75 },
            { id: 'streak-7', name: 'Week Warrior', description: 'Maintain a 7-day streak', category: 'streaks', tier: 'silver', icon: '🔥', xpReward: 200 },
            { id: 'streak-30', name: 'Monthly Master', description: 'Maintain a 30-day streak', category: 'streaks', tier: 'gold', icon: '🌟', xpReward: 500 },
            { id: 'streak-100', name: 'Century Club', description: 'Maintain a 100-day streak', category: 'streaks', tier: 'platinum', icon: '💯', xpReward: 1500 },
            { id: 'streak-365', name: 'Year of Focus', description: 'Maintain a 365-day streak', category: 'streaks', tier: 'diamond', icon: '💎', xpReward: 5000 },

            // Productivity achievements
            { id: 'tasks-10', name: 'Task Starter', description: 'Complete 10 tasks', category: 'productivity', tier: 'bronze', icon: '✅', xpReward: 50 },
            { id: 'tasks-100', name: 'Productivity Pro', description: 'Complete 100 tasks', category: 'productivity', tier: 'silver', icon: '📋', xpReward: 200 },
            { id: 'zero-inbox', name: 'Inbox Zero', description: 'Complete all tasks in a day', category: 'productivity', tier: 'silver', icon: '📭', xpReward: 150 },

            // Wellness achievements
            { id: 'breaks-taken', name: 'Self Care', description: 'Take 50 wellness breaks', category: 'wellness', tier: 'silver', icon: '🧘', xpReward: 150 },
            { id: 'no-burnout', name: 'Balance Master', description: 'Maintain healthy work patterns for 30 days', category: 'wellness', tier: 'gold', icon: '⚖️', xpReward: 400 },

            // Social achievements
            { id: 'team-challenge', name: 'Team Player', description: 'Complete a team challenge', category: 'social', tier: 'silver', icon: '🤝', xpReward: 200 },
            { id: 'leaderboard-top10', name: 'Rising Star', description: 'Reach top 10 on the leaderboard', category: 'social', tier: 'gold', icon: '⬆️', xpReward: 300 },

            // Secret achievements
            { id: 'night-owl', name: 'Night Owl', description: '???', category: 'exploration', tier: 'silver', icon: '🦉', xpReward: 200, secret: true },
            { id: 'early-bird', name: 'Early Bird', description: '???', category: 'exploration', tier: 'silver', icon: '🐦', xpReward: 200, secret: true },
        ];

        achievementsList.forEach(a => this.achievements.set(a.id, a));
    }

    getAchievements(): Achievement[] {
        return Array.from(this.achievements.values());
    }

    getUnlockedAchievements(): Achievement[] {
        return this.getAchievements().filter(a => a.unlockedAt);
    }

    unlockAchievement(id: string): { success: boolean; achievement?: Achievement; xpGained?: number } {
        const achievement = this.achievements.get(id);
        if (!achievement || achievement.unlockedAt) {
            return { success: false };
        }

        achievement.unlockedAt = new Date();
        this.achievements.set(id, achievement);
        this.addXP(achievement.xpReward, `Achievement: ${achievement.name}`);
        this.saveToStorage();

        return {
            success: true,
            achievement,
            xpGained: achievement.xpReward
        };
    }

    // ============================================
    // Challenges
    // ============================================

    private initializeChallenges() {
        const now = new Date();
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);

        const endOfWeek = new Date(now);
        endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));

        this.challenges = [
            // Daily challenges
            { id: 'daily-focus-3', name: 'Triple Focus', description: 'Complete 3 focus sessions', type: 'daily', category: 'focus', goal: 3, progress: 0, xpReward: 50, expiresAt: endOfDay },
            { id: 'daily-tasks-5', name: 'Five Alive', description: 'Complete 5 tasks', type: 'daily', category: 'productivity', goal: 5, progress: 0, xpReward: 40, expiresAt: endOfDay },
            { id: 'daily-break', name: 'Take a Breather', description: 'Take at least one wellness break', type: 'daily', category: 'wellness', goal: 1, progress: 0, xpReward: 25, expiresAt: endOfDay },

            // Weekly challenges
            { id: 'weekly-focus-20', name: 'Weekly Warrior', description: 'Complete 20 focus sessions this week', type: 'weekly', category: 'focus', goal: 20, progress: 0, xpReward: 200, expiresAt: endOfWeek },
            { id: 'weekly-deep-5h', name: 'Deep Dive', description: 'Accumulate 5 hours of deep work', type: 'weekly', category: 'focus', goal: 300, progress: 0, xpReward: 250, expiresAt: endOfWeek },
        ];
    }

    getChallenges(): Challenge[] {
        return [...this.challenges];
    }

    getActiveChallenges(): Challenge[] {
        const now = new Date();
        return this.challenges.filter(c => new Date(c.expiresAt) > now && c.progress < c.goal);
    }

    updateChallengeProgress(id: string, amount: number): { completed: boolean; xpGained?: number } {
        const challenge = this.challenges.find(c => c.id === id);
        if (!challenge) return { completed: false };

        challenge.progress = Math.min(challenge.progress + amount, challenge.goal);

        if (challenge.progress >= challenge.goal) {
            this.addXP(challenge.xpReward, `Challenge: ${challenge.name}`);
            this.saveToStorage();
            return { completed: true, xpGained: challenge.xpReward };
        }

        this.saveToStorage();
        return { completed: false };
    }

    // ============================================
    // Seasonal Events
    // ============================================

    getActiveEvents(): SeasonalEvent[] {
        const now = new Date();
        return this.events.filter(e =>
            new Date(e.startDate) <= now &&
            new Date(e.endDate) >= now
        );
    }

    // ============================================
    // Storage
    // ============================================

    private loadFromStorage() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                if (data.userLevel) this.userLevel = data.userLevel;
                if (data.achievements) {
                    data.achievements.forEach((a: Achievement) => {
                        const existing = this.achievements.get(a.id);
                        if (existing) {
                            this.achievements.set(a.id, { ...existing, ...a });
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Failed to load gamification data:', error);
        }
    }

    private saveToStorage() {
        try {
            const data = {
                userLevel: this.userLevel,
                achievements: Array.from(this.achievements.values()).filter(a => a.unlockedAt),
                challenges: this.challenges
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save gamification data:', error);
        }
    }
}

export const enhancedGamificationService = new EnhancedGamificationService();
export default enhancedGamificationService;
