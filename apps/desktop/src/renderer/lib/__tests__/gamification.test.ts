/**
 * Gamification Service Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockAchievement, createMockUserProfile } from './test-utils';

// Mock gamification service
const mockGamificationService = {
    calculateLevel: (xp: number): number => {
        // Each level requires 100 * level XP
        let level = 1;
        let totalRequired = 0;
        while (totalRequired + (100 * level) <= xp) {
            totalRequired += 100 * level;
            level++;
        }
        return level;
    },

    calculateXPForLevel: (level: number): number => {
        let total = 0;
        for (let i = 1; i < level; i++) {
            total += 100 * i;
        }
        return total;
    },

    getXPProgress: (xp: number): { current: number; required: number; percentage: number } => {
        const level = mockGamificationService.calculateLevel(xp);
        const currentLevelXP = mockGamificationService.calculateXPForLevel(level);
        const nextLevelXP = mockGamificationService.calculateXPForLevel(level + 1);
        const required = nextLevelXP - currentLevelXP;
        const current = xp - currentLevelXP;
        return {
            current,
            required,
            percentage: Math.round((current / required) * 100),
        };
    },

    awardXP: (profile: { xp: number; level: number }, amount: number): { newXP: number; newLevel: number; leveledUp: boolean } => {
        const newXP = profile.xp + amount;
        const newLevel = mockGamificationService.calculateLevel(newXP);
        return {
            newXP,
            newLevel,
            leveledUp: newLevel > profile.level,
        };
    },

    checkAchievementUnlock: (
        achievement: { progress: number; target: number; unlocked: boolean },
        increment: number
    ): { unlocked: boolean; progress: number } => {
        if (achievement.unlocked) {
            return { unlocked: true, progress: achievement.target };
        }
        const newProgress = Math.min(achievement.progress + increment, achievement.target);
        return {
            unlocked: newProgress >= achievement.target,
            progress: newProgress,
        };
    },

    calculateStreak: (dates: string[], today: string): number => {
        if (!dates.includes(today)) return 0;
        const sortedDates = [...dates].sort().reverse();
        let streak = 0;
        const todayDate = new Date(today);

        for (let i = 0; i < sortedDates.length; i++) {
            const checkDate = new Date(todayDate);
            checkDate.setDate(checkDate.getDate() - i);
            const checkStr = checkDate.toISOString().split('T')[0];
            if (sortedDates.includes(checkStr)) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    },

    calculateDailyChallenge: (focusTime: number, target: number): { completed: boolean; progress: number } => {
        const progress = Math.min((focusTime / target) * 100, 100);
        return {
            completed: progress >= 100,
            progress: Math.round(progress),
        };
    },
};

describe('Gamification Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Level Calculation', () => {
        it('should start at level 1 with 0 XP', () => {
            expect(mockGamificationService.calculateLevel(0)).toBe(1);
        });

        it('should remain level 1 with 99 XP', () => {
            expect(mockGamificationService.calculateLevel(99)).toBe(1);
        });

        it('should reach level 2 at 100 XP', () => {
            expect(mockGamificationService.calculateLevel(100)).toBe(2);
        });

        it('should reach level 3 at 300 XP (100 + 200)', () => {
            expect(mockGamificationService.calculateLevel(300)).toBe(3);
        });

        it('should calculate high levels correctly', () => {
            // Level 10 requires: 100+200+300+...+900 = 4500 XP
            expect(mockGamificationService.calculateLevel(4500)).toBe(10);
        });
    });

    describe('XP Progress', () => {
        it('should show 0% progress at level start', () => {
            const progress = mockGamificationService.getXPProgress(100);
            expect(progress.current).toBe(0);
            expect(progress.percentage).toBe(0);
        });

        it('should show 50% progress midway through level', () => {
            const progress = mockGamificationService.getXPProgress(200);
            expect(progress.current).toBe(100);
            expect(progress.required).toBe(200);
            expect(progress.percentage).toBe(50);
        });

        it('should calculate required XP correctly', () => {
            const progress = mockGamificationService.getXPProgress(0);
            expect(progress.required).toBe(100); // Level 1 to 2 requires 100 XP
        });
    });

    describe('XP Awards', () => {
        it('should add XP correctly', () => {
            const profile = { xp: 50, level: 1 };
            const result = mockGamificationService.awardXP(profile, 30);
            expect(result.newXP).toBe(80);
            expect(result.leveledUp).toBe(false);
        });

        it('should detect level up', () => {
            const profile = { xp: 90, level: 1 };
            const result = mockGamificationService.awardXP(profile, 20);
            expect(result.newXP).toBe(110);
            expect(result.newLevel).toBe(2);
            expect(result.leveledUp).toBe(true);
        });

        it('should handle multiple level ups', () => {
            const profile = { xp: 0, level: 1 };
            const result = mockGamificationService.awardXP(profile, 500);
            expect(result.newLevel).toBeGreaterThan(2);
            expect(result.leveledUp).toBe(true);
        });
    });

    describe('Achievement Unlocks', () => {
        it('should not unlock if already unlocked', () => {
            const achievement = { progress: 100, target: 100, unlocked: true };
            const result = mockGamificationService.checkAchievementUnlock(achievement, 50);
            expect(result.unlocked).toBe(true);
            expect(result.progress).toBe(100);
        });

        it('should increment progress', () => {
            const achievement = { progress: 50, target: 100, unlocked: false };
            const result = mockGamificationService.checkAchievementUnlock(achievement, 20);
            expect(result.progress).toBe(70);
            expect(result.unlocked).toBe(false);
        });

        it('should unlock when reaching target', () => {
            const achievement = { progress: 90, target: 100, unlocked: false };
            const result = mockGamificationService.checkAchievementUnlock(achievement, 10);
            expect(result.progress).toBe(100);
            expect(result.unlocked).toBe(true);
        });

        it('should cap progress at target', () => {
            const achievement = { progress: 90, target: 100, unlocked: false };
            const result = mockGamificationService.checkAchievementUnlock(achievement, 50);
            expect(result.progress).toBe(100);
        });
    });

    describe('Streak Calculation', () => {
        it('should return 0 if today is not in dates', () => {
            const dates = ['2026-02-01', '2026-02-02'];
            expect(mockGamificationService.calculateStreak(dates, '2026-02-04')).toBe(0);
        });

        it('should return 1 for just today', () => {
            const dates = ['2026-02-03'];
            expect(mockGamificationService.calculateStreak(dates, '2026-02-03')).toBe(1);
        });

        it('should count consecutive days', () => {
            const dates = ['2026-02-01', '2026-02-02', '2026-02-03'];
            expect(mockGamificationService.calculateStreak(dates, '2026-02-03')).toBe(3);
        });

        it('should break on gap', () => {
            const dates = ['2026-02-01', '2026-02-03'];
            expect(mockGamificationService.calculateStreak(dates, '2026-02-03')).toBe(1);
        });
    });

    describe('Daily Challenge', () => {
        it('should show 0% for no focus time', () => {
            const result = mockGamificationService.calculateDailyChallenge(0, 120);
            expect(result.progress).toBe(0);
            expect(result.completed).toBe(false);
        });

        it('should calculate progress percentage', () => {
            const result = mockGamificationService.calculateDailyChallenge(60, 120);
            expect(result.progress).toBe(50);
            expect(result.completed).toBe(false);
        });

        it('should mark completed at 100%', () => {
            const result = mockGamificationService.calculateDailyChallenge(120, 120);
            expect(result.progress).toBe(100);
            expect(result.completed).toBe(true);
        });

        it('should cap at 100% when exceeded', () => {
            const result = mockGamificationService.calculateDailyChallenge(200, 120);
            expect(result.progress).toBe(100);
        });
    });
});

describe('Mock Factories', () => {
    it('should create valid achievement', () => {
        const achievement = createMockAchievement();
        expect(achievement.id).toBeDefined();
        expect(achievement.tier).toBe('bronze');
        expect(achievement.unlocked).toBe(false);
    });

    it('should create valid user profile', () => {
        const profile = createMockUserProfile();
        expect(profile.email).toBe('test@example.com');
        expect(profile.level).toBe(1);
        expect(profile.xp).toBe(0);
    });

    it('should allow overrides', () => {
        const profile = createMockUserProfile({ level: 10, xp: 5000 });
        expect(profile.level).toBe(10);
        expect(profile.xp).toBe(5000);
    });
});
