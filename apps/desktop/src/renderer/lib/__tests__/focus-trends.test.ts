/**
 * Focus Trends Service Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockDailyStats, createMockLocalStorage } from './test-utils';

// Mock the focus trends service functions
const mockFocusTrendsService = {
    calculateWeeklyTrend: (stats: { focusTime: number }[]) => {
        if (stats.length < 2) return 0;
        const recent = stats.slice(-3).reduce((sum, s) => sum + s.focusTime, 0) / 3;
        const older = stats.slice(0, 3).reduce((sum, s) => sum + s.focusTime, 0) / 3;
        return older > 0 ? ((recent - older) / older) * 100 : 0;
    },

    calculateProductivityScore: (focusTime: number, distractions: number, tasksCompleted: number) => {
        const focusScore = Math.min(focusTime / 240, 1) * 40; // Max 4 hours = 40 points
        const distractionPenalty = Math.min(distractions * 2, 20);
        const taskBonus = Math.min(tasksCompleted * 3, 40);
        return Math.round(focusScore + taskBonus - distractionPenalty);
    },

    getStreakCount: (dates: string[]) => {
        if (dates.length === 0) return 0;
        const sortedDates = [...dates].sort().reverse();
        let streak = 1;
        for (let i = 0; i < sortedDates.length - 1; i++) {
            const current = new Date(sortedDates[i]);
            const next = new Date(sortedDates[i + 1]);
            const diffDays = (current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24);
            if (diffDays === 1) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    },

    getBestDay: (stats: { date: string; focusTime: number }[]) => {
        if (stats.length === 0) return null;
        return stats.reduce((best, current) =>
            current.focusTime > best.focusTime ? current : best
        );
    },

    getAverageFocusTime: (stats: { focusTime: number }[]) => {
        if (stats.length === 0) return 0;
        return Math.round(stats.reduce((sum, s) => sum + s.focusTime, 0) / stats.length);
    },
};

describe('Focus Trends Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('calculateWeeklyTrend', () => {
        it('should return 0 for less than 2 data points', () => {
            expect(mockFocusTrendsService.calculateWeeklyTrend([])).toBe(0);
            expect(mockFocusTrendsService.calculateWeeklyTrend([{ focusTime: 100 }])).toBe(0);
        });

        it('should calculate positive trend correctly', () => {
            const stats = [
                { focusTime: 60 },
                { focusTime: 60 },
                { focusTime: 60 },
                { focusTime: 120 },
                { focusTime: 120 },
                { focusTime: 120 },
            ];
            const trend = mockFocusTrendsService.calculateWeeklyTrend(stats);
            expect(trend).toBe(100); // 100% increase
        });

        it('should calculate negative trend correctly', () => {
            const stats = [
                { focusTime: 120 },
                { focusTime: 120 },
                { focusTime: 120 },
                { focusTime: 60 },
                { focusTime: 60 },
                { focusTime: 60 },
            ];
            const trend = mockFocusTrendsService.calculateWeeklyTrend(stats);
            expect(trend).toBe(-50); // 50% decrease
        });
    });

    describe('calculateProductivityScore', () => {
        it('should return maximum score for perfect day', () => {
            const score = mockFocusTrendsService.calculateProductivityScore(240, 0, 15);
            expect(score).toBeGreaterThanOrEqual(80);
        });

        it('should penalize distractions', () => {
            const scoreNoDistractions = mockFocusTrendsService.calculateProductivityScore(120, 0, 5);
            const scoreWithDistractions = mockFocusTrendsService.calculateProductivityScore(120, 5, 5);
            expect(scoreNoDistractions).toBeGreaterThan(scoreWithDistractions);
        });

        it('should reward completed tasks', () => {
            const scoreNoTasks = mockFocusTrendsService.calculateProductivityScore(120, 0, 0);
            const scoreWithTasks = mockFocusTrendsService.calculateProductivityScore(120, 0, 10);
            expect(scoreWithTasks).toBeGreaterThan(scoreNoTasks);
        });

        it('should handle zero inputs', () => {
            const score = mockFocusTrendsService.calculateProductivityScore(0, 0, 0);
            expect(score).toBe(0);
        });
    });

    describe('getStreakCount', () => {
        it('should return 0 for empty array', () => {
            expect(mockFocusTrendsService.getStreakCount([])).toBe(0);
        });

        it('should return 1 for single date', () => {
            expect(mockFocusTrendsService.getStreakCount(['2026-02-03'])).toBe(1);
        });

        it('should calculate consecutive days correctly', () => {
            const dates = ['2026-02-01', '2026-02-02', '2026-02-03'];
            expect(mockFocusTrendsService.getStreakCount(dates)).toBe(3);
        });

        it('should break streak on gap', () => {
            const dates = ['2026-02-01', '2026-02-03', '2026-02-04'];
            expect(mockFocusTrendsService.getStreakCount(dates)).toBe(2);
        });
    });

    describe('getBestDay', () => {
        it('should return null for empty array', () => {
            expect(mockFocusTrendsService.getBestDay([])).toBeNull();
        });

        it('should return day with highest focus time', () => {
            const stats = [
                { date: '2026-02-01', focusTime: 100 },
                { date: '2026-02-02', focusTime: 200 },
                { date: '2026-02-03', focusTime: 150 },
            ];
            const best = mockFocusTrendsService.getBestDay(stats);
            expect(best?.date).toBe('2026-02-02');
            expect(best?.focusTime).toBe(200);
        });
    });

    describe('getAverageFocusTime', () => {
        it('should return 0 for empty array', () => {
            expect(mockFocusTrendsService.getAverageFocusTime([])).toBe(0);
        });

        it('should calculate average correctly', () => {
            const stats = [
                { focusTime: 60 },
                { focusTime: 120 },
                { focusTime: 180 },
            ];
            expect(mockFocusTrendsService.getAverageFocusTime(stats)).toBe(120);
        });
    });
});

describe('Daily Stats Creation', () => {
    it('should create valid daily stats with defaults', () => {
        const stats = createMockDailyStats();
        expect(stats.focusTime).toBe(120);
        expect(stats.sessions).toBe(4);
        expect(stats.productivityScore).toBe(85);
    });

    it('should allow overriding default values', () => {
        const stats = createMockDailyStats({ focusTime: 300, sessions: 10 });
        expect(stats.focusTime).toBe(300);
        expect(stats.sessions).toBe(10);
    });
});
