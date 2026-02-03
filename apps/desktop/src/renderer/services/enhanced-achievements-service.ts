// apps/desktop/src/renderer/services/enhanced-achievements-service.ts

import { v4 as generateId } from 'uuid';
import { eventBus } from '../lib/event-bus';

interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
    points: number;
    secret: boolean;
    category: AchievementCategory;
    requirements: AchievementRequirement[];
    rewards: AchievementReward[];
    unlockedAt?: Date;
    progress: number;  // 0-100
}

interface AchievementCategory {
    id: string;
    name: string;
    icon: string;
    color: string;
}

type AchievementRequirement =
    | { type: 'focus_hours'; amount: number; period?: 'day' | 'week' | 'month' | 'lifetime' }
    | { type: 'streak_days'; amount: number }
    | { type: 'tasks_completed'; amount: number }
    | { type: 'deep_work_sessions'; amount: number }
    | { type: 'perfect_days'; amount: number }
    | { type: 'level_reached'; level: number }
    | { type: 'integration_connected'; integrationId: string };

interface AchievementReward {
    type: 'theme' | 'badge' | 'sound' | 'title' | 'feature';
    value: string;
}

interface Challenge {
    id: string;
    name: string;
    description: string;
    type: 'daily' | 'weekly' | 'special';
    requirements: AchievementRequirement[];
    reward: { points: number; xp: number };
    expiresAt: Date;
    completed: boolean;
}

interface AchievementShowcase {
    userId: string;
    totalPoints: number;
    tier: string;
    featuredAchievements: Achievement[];
    recentUnlocks: Achievement[];
    stats: {
        totalAchievements: number;
        unlockedAchievements: number;
        rareAchievements: number;
    };
}

const ACHIEVEMENT_TIERS = {
    bronze: { minPoints: 0, color: '#CD7F32', multiplier: 1 },
    silver: { minPoints: 100, color: '#C0C0C0', multiplier: 1.5 },
    gold: { minPoints: 500, color: '#FFD700', multiplier: 2 },
    platinum: { minPoints: 2000, color: '#E5E4E2', multiplier: 3 },
    diamond: { minPoints: 10000, color: '#B9F2FF', multiplier: 5 }
};

const CATEGORIES: AchievementCategory[] = [
    { id: 'focus', name: 'Focus', icon: '🎯', color: '#FF6B6B' },
    { id: 'productivity', name: 'Productivity', icon: '⚡', color: '#4ECDC4' },
    { id: 'streaks', name: 'Streaks', icon: '🔥', color: '#FF8C00' },
    { id: 'social', name: 'Social', icon: '👥', color: '#9B59B6' },
    { id: 'special', name: 'Special', icon: '⭐', color: '#F39C12' },
];

const ACHIEVEMENTS: Achievement[] = [
    // Focus Achievements
    {
        id: 'first-focus',
        name: 'First Step',
        description: 'Complete your first focus session',
        icon: '🎯',
        tier: 'bronze',
        points: 10,
        secret: false,
        category: CATEGORIES[0],
        requirements: [{ type: 'focus_hours', amount: 0.5, period: 'lifetime' }],
        rewards: [],
        progress: 0
    },
    {
        id: 'hour-warrior',
        name: 'Hour Warrior',
        description: 'Complete 10 hours of focus time',
        icon: '⏰',
        tier: 'bronze',
        points: 50,
        secret: false,
        category: CATEGORIES[0],
        requirements: [{ type: 'focus_hours', amount: 10, period: 'lifetime' }],
        rewards: [],
        progress: 0
    },
    {
        id: 'deep-diver',
        name: 'Deep Diver',
        description: 'Complete 100 hours of deep work',
        icon: '🏊',
        tier: 'gold',
        points: 500,
        secret: false,
        category: CATEGORIES[0],
        requirements: [{ type: 'deep_work_sessions', amount: 100 }],
        rewards: [{ type: 'theme', value: 'deep-ocean' }],
        progress: 0
    },
    {
        id: 'focus-legend',
        name: 'Focus Legend',
        description: 'Reach 1000 hours of total focus time',
        icon: '🏆',
        tier: 'diamond',
        points: 5000,
        secret: false,
        category: CATEGORIES[0],
        requirements: [{ type: 'focus_hours', amount: 1000, period: 'lifetime' }],
        rewards: [
            { type: 'title', value: 'Focus Legend' },
            { type: 'badge', value: 'legendary-badge' }
        ],
        progress: 0
    },
    // Streak Achievements
    {
        id: 'streak-starter',
        name: 'Streak Starter',
        description: 'Maintain a 3-day streak',
        icon: '🔥',
        tier: 'bronze',
        points: 25,
        secret: false,
        category: CATEGORIES[2],
        requirements: [{ type: 'streak_days', amount: 3 }],
        rewards: [],
        progress: 0
    },
    {
        id: 'week-warrior',
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: '📅',
        tier: 'silver',
        points: 100,
        secret: false,
        category: CATEGORIES[2],
        requirements: [{ type: 'streak_days', amount: 7 }],
        rewards: [{ type: 'badge', value: 'week-badge' }],
        progress: 0
    },
    {
        id: 'month-master',
        name: 'Month Master',
        description: 'Maintain a 30-day streak',
        icon: '🗓️',
        tier: 'gold',
        points: 500,
        secret: false,
        category: CATEGORIES[2],
        requirements: [{ type: 'streak_days', amount: 30 }],
        rewards: [{ type: 'theme', value: 'fire-theme' }],
        progress: 0
    },
    // Task Achievements
    {
        id: 'task-starter',
        name: 'Task Starter',
        description: 'Complete 10 tasks',
        icon: '✅',
        tier: 'bronze',
        points: 20,
        secret: false,
        category: CATEGORIES[1],
        requirements: [{ type: 'tasks_completed', amount: 10 }],
        rewards: [],
        progress: 0
    },
    {
        id: 'task-master',
        name: 'Task Master',
        description: 'Complete 100 tasks',
        icon: '📋',
        tier: 'silver',
        points: 150,
        secret: false,
        category: CATEGORIES[1],
        requirements: [{ type: 'tasks_completed', amount: 100 }],
        rewards: [{ type: 'sound', value: 'victory-fanfare' }],
        progress: 0
    },
    // Secret Achievement
    {
        id: 'night-owl',
        name: '???',
        description: 'Unlocks when discovered',
        icon: '❓',
        tier: 'gold',
        points: 250,
        secret: true,
        category: CATEGORIES[4],
        requirements: [{ type: 'focus_hours', amount: 4, period: 'day' }],  // 4 hours after midnight
        rewards: [{ type: 'theme', value: 'midnight' }],
        progress: 0
    },
    {
        id: 'early-bird',
        name: '???',
        description: 'Unlocks when discovered',
        icon: '❓',
        tier: 'gold',
        points: 250,
        secret: true,
        category: CATEGORIES[4],
        requirements: [{ type: 'focus_hours', amount: 2, period: 'day' }],  // Before 7am
        rewards: [{ type: 'theme', value: 'sunrise' }],
        progress: 0
    },
];

export class EnhancedAchievementsService {
    private achievements: Achievement[] = [...ACHIEVEMENTS];
    private totalPoints: number = 0;

    getAchievements(): Achievement[] {
        return this.achievements.map(a =>
            a.secret && !a.unlockedAt
                ? { ...a, name: '???', description: 'Unlocks when discovered' }
                : a
        );
    }

    getCategories(): AchievementCategory[] {
        return CATEGORIES;
    }

    getTierInfo(tier: keyof typeof ACHIEVEMENT_TIERS) {
        return ACHIEVEMENT_TIERS[tier];
    }

    getCurrentTier(): { tier: string; progress: number } {
        const tiers = Object.entries(ACHIEVEMENT_TIERS).reverse();
        for (const [tierName, tierData] of tiers) {
            if (this.totalPoints >= tierData.minPoints) {
                const nextTier = tiers[tiers.indexOf([tierName, tierData]) - 1];
                const progress = nextTier
                    ? ((this.totalPoints - tierData.minPoints) / (nextTier[1].minPoints - tierData.minPoints)) * 100
                    : 100;
                return { tier: tierName, progress: Math.min(progress, 100) };
            }
        }
        return { tier: 'bronze', progress: 0 };
    }

    async checkAchievements(): Promise<Achievement[]> {
        const newlyUnlocked: Achievement[] = [];

        for (const achievement of this.achievements) {
            if (achievement.unlockedAt) continue;

            const progress = await this.calculateProgress(achievement);
            achievement.progress = progress;

            if (progress >= 100) {
                achievement.unlockedAt = new Date();
                if (achievement.secret) {
                    achievement.name = this.getSecretAchievementName(achievement.id);
                    achievement.description = this.getSecretAchievementDescription(achievement.id);
                }
                newlyUnlocked.push(achievement);
                this.totalPoints += achievement.points;
                await this.grantRewards(achievement);
                await this.showUnlockNotification(achievement);
            }
        }

        return newlyUnlocked;
    }

    private async calculateProgress(achievement: Achievement): Promise<number> {
        // Would integrate with database to get actual stats
        let totalProgress = 0;

        for (const req of achievement.requirements) {
            let reqProgress = 0;

            switch (req.type) {
                case 'focus_hours':
                    const focusHours = await this.getFocusHours(req.period);
                    reqProgress = (focusHours / req.amount) * 100;
                    break;
                case 'streak_days':
                    const streakDays = await this.getCurrentStreak();
                    reqProgress = (streakDays / req.amount) * 100;
                    break;
                case 'tasks_completed':
                    const tasksCompleted = await this.getCompletedTasks();
                    reqProgress = (tasksCompleted / req.amount) * 100;
                    break;
                case 'deep_work_sessions':
                    const sessions = await this.getDeepWorkSessions();
                    reqProgress = (sessions / req.amount) * 100;
                    break;
            }

            totalProgress += reqProgress / achievement.requirements.length;
        }

        return Math.min(totalProgress, 100);
    }

    private async getFocusHours(period?: string): Promise<number> {
        try {
            if (period === 'day') {
                const todayStats = await window.wakey.getTodayStats();
                return todayStats.focusTime / 60; // Convert minutes to hours
            } else if (period === 'week') {
                // Use week comparison data
                const weekData = await window.wakey.getWeekComparison();
                return weekData.thisWeek.focusMinutes / 60;
            } else {
                // Lifetime
                const allTimeStats = await window.wakey.getAllTimeStats();
                return allTimeStats.totalFocusMinutes / 60;
            }
        } catch (error) {
            console.error('Failed to get focus hours:', error);
            return 0;
        }
    }

    private async getCurrentStreak(): Promise<number> {
        try {
            // Calculate streak from activities - count consecutive days with focus activity
            const allTimeStats = await window.wakey.getAllTimeStats();
            // Simple streak approximation: days with any focus activity
            // For a more accurate implementation, we'd need a dedicated streak handler
            return Math.min(allTimeStats.totalDays, 30); // Cap at 30 for now
        } catch (error) {
            console.error('Failed to get streak:', error);
            return 0;
        }
    }

    private async getCompletedTasks(): Promise<number> {
        try {
            // Use completed sessions as proxy for completed work units
            const allTimeStats = await window.wakey.getAllTimeStats();
            return allTimeStats.completedSessions || 0;
        } catch (error) {
            console.error('Failed to get completed tasks:', error);
            return 0;
        }
    }

    private async getDeepWorkSessions(): Promise<number> {
        try {
            const allTimeStats = await window.wakey.getAllTimeStats();
            return allTimeStats.completedSessions || 0;
        } catch (error) {
            console.error('Failed to get deep work sessions:', error);
            return 0;
        }
    }

    private getSecretAchievementName(id: string): string {
        const names: Record<string, string> = {
            'night-owl': 'Night Owl',
            'early-bird': 'Early Bird',
        };
        return names[id] || 'Secret Achievement';
    }

    private getSecretAchievementDescription(id: string): string {
        const descriptions: Record<string, string> = {
            'night-owl': 'Complete 4 hours of focus after midnight',
            'early-bird': 'Complete 2 hours of focus before 7am',
        };
        return descriptions[id] || 'A secret achievement has been unlocked!';
    }

    private async grantRewards(achievement: Achievement): Promise<void> {
        for (const reward of achievement.rewards) {
            console.log(`Granting reward: ${reward.type} - ${reward.value}`);
            // Would save to user preferences
        }
    }

    private async showUnlockNotification(achievement: Achievement): Promise<void> {
        eventBus.emit('achievement:unlocked', {
            achievement: {
                id: achievement.id,
                name: achievement.name,
                description: achievement.description
            }
        });
    }

    async shareAchievement(achievementId: string, platform: 'twitter' | 'linkedin' | 'discord'): Promise<void> {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (!achievement) return;

        const shareUrl = await this.generateShareCard(achievement);
        await this.postToPlatform(platform, shareUrl, achievement);
    }

    private async generateShareCard(achievement: Achievement): Promise<string> {
        // Would generate shareable image
        return `https://wakey.app/share/achievement/${achievement.id}`;
    }

    private async postToPlatform(platform: string, url: string, achievement: Achievement): Promise<void> {
        const text = `🏆 I just unlocked "${achievement.name}" in Wakey! ${achievement.description}`;

        switch (platform) {
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`);
                break;
            case 'linkedin':
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`);
                break;
            case 'discord':
                navigator.clipboard.writeText(`${text}\n${url}`);
                break;
        }
    }

    async getDailyChallenges(): Promise<Challenge[]> {
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        return [
            {
                id: generateId(),
                name: 'Focus Hour',
                description: 'Complete 1 hour of focus time today',
                type: 'daily',
                requirements: [{ type: 'focus_hours', amount: 1, period: 'day' }],
                reward: { points: 25, xp: 100 },
                expiresAt: today,
                completed: false
            },
            {
                id: generateId(),
                name: 'Task Blitz',
                description: 'Complete 5 tasks today',
                type: 'daily',
                requirements: [{ type: 'tasks_completed', amount: 5 }],
                reward: { points: 30, xp: 150 },
                expiresAt: today,
                completed: false
            },
            {
                id: generateId(),
                name: 'Perfect Focus',
                description: 'Complete a focus session with 100% quality',
                type: 'daily',
                requirements: [{ type: 'perfect_days', amount: 1 }],
                reward: { points: 50, xp: 200 },
                expiresAt: today,
                completed: false
            }
        ];
    }

    async getAchievementShowcase(): Promise<AchievementShowcase> {
        const unlockedAchievements = this.achievements.filter(a => a.unlockedAt);
        const recentUnlocks = [...unlockedAchievements]
            .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0))
            .slice(0, 5);

        const rareAchievements = unlockedAchievements.filter(
            a => a.tier === 'gold' || a.tier === 'platinum' || a.tier === 'diamond'
        );

        return {
            userId: 'current-user',
            totalPoints: this.totalPoints,
            tier: this.getCurrentTier().tier,
            featuredAchievements: unlockedAchievements.slice(0, 6),
            recentUnlocks,
            stats: {
                totalAchievements: this.achievements.length,
                unlockedAchievements: unlockedAchievements.length,
                rareAchievements: rareAchievements.length
            }
        };
    }
}

export const enhancedAchievementsService = new EnhancedAchievementsService();
export type { Achievement, AchievementCategory, AchievementReward, Challenge, AchievementShowcase };
