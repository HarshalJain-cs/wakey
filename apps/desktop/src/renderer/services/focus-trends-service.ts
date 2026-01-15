/**
 * @fileoverview Focus Trends Service
 * 
 * Provides weekly/monthly trend data for focus scores and productivity metrics.
 * Used for generating charts and analytics.
 */

export interface DailyStats {
    date: string;
    focusScore: number;
    focusMinutes: number;
    distractionMinutes: number;
    deepWorkSessions: number;
    contextSwitches: number;
    breaksTaken: number;
}

export interface WeeklyTrend {
    weekStart: string;
    averageFocusScore: number;
    totalFocusMinutes: number;
    bestDay: string;
    worstDay: string;
    improvement: number; // % change from previous week
}

interface TrendData {
    dailyStats: DailyStats[];
    weeklyTrends: WeeklyTrend[];
}

class FocusTrendsService {
    private data: TrendData;

    constructor() {
        this.data = this.loadFromStorage();
    }

    private loadFromStorage(): TrendData {
        try {
            const stored = localStorage.getItem('wakey_focus_trends');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load focus trends:', error);
        }
        return { dailyStats: [], weeklyTrends: [] };
    }

    private saveToStorage(): void {
        localStorage.setItem('wakey_focus_trends', JSON.stringify(this.data));
    }

    /**
     * Record today's stats
     */
    recordDailyStats(stats: Omit<DailyStats, 'date'>): void {
        const today = new Date().toISOString().split('T')[0];

        // Update or add today's stats
        const existingIndex = this.data.dailyStats.findIndex(s => s.date === today);
        const dailyStats: DailyStats = { ...stats, date: today };

        if (existingIndex >= 0) {
            this.data.dailyStats[existingIndex] = dailyStats;
        } else {
            this.data.dailyStats.push(dailyStats);
        }

        // Keep only last 90 days
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 90);
        this.data.dailyStats = this.data.dailyStats.filter(
            s => new Date(s.date) >= cutoff
        );

        this.saveToStorage();
    }

    /**
     * Get daily stats for the past N days
     */
    getDailyStats(days: number = 7): DailyStats[] {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        return this.data.dailyStats
            .filter(s => new Date(s.date) >= cutoff)
            .sort((a, b) => a.date.localeCompare(b.date));
    }

    /**
     * Get focus score trend for chart
     */
    getFocusScoreTrend(days: number = 7): { date: string; score: number }[] {
        const stats = this.getDailyStats(days);
        return stats.map(s => ({ date: s.date, score: s.focusScore }));
    }

    /**
     * Get focus minutes trend for chart
     */
    getFocusMinutesTrend(days: number = 7): { date: string; minutes: number }[] {
        const stats = this.getDailyStats(days);
        return stats.map(s => ({ date: s.date, minutes: s.focusMinutes }));
    }

    /**
     * Calculate weekly summary
     */
    getWeeklySummary(): {
        thisWeek: { focusMinutes: number; avgScore: number; deepWorkSessions: number };
        lastWeek: { focusMinutes: number; avgScore: number; deepWorkSessions: number };
        improvement: number;
    } {
        const now = new Date();
        const thisWeekStart = new Date(now);
        thisWeekStart.setDate(now.getDate() - now.getDay());

        const lastWeekStart = new Date(thisWeekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);

        const thisWeekStats = this.data.dailyStats.filter(s =>
            new Date(s.date) >= thisWeekStart
        );

        const lastWeekStats = this.data.dailyStats.filter(s => {
            const date = new Date(s.date);
            return date >= lastWeekStart && date < thisWeekStart;
        });

        const calcSummary = (stats: DailyStats[]) => ({
            focusMinutes: stats.reduce((sum, s) => sum + s.focusMinutes, 0),
            avgScore: stats.length > 0
                ? stats.reduce((sum, s) => sum + s.focusScore, 0) / stats.length
                : 0,
            deepWorkSessions: stats.reduce((sum, s) => sum + s.deepWorkSessions, 0),
        });

        const thisWeek = calcSummary(thisWeekStats);
        const lastWeek = calcSummary(lastWeekStats);

        const improvement = lastWeek.avgScore > 0
            ? ((thisWeek.avgScore - lastWeek.avgScore) / lastWeek.avgScore) * 100
            : 0;

        return { thisWeek, lastWeek, improvement };
    }

    /**
     * Get best and worst days
     */
    getBestWorstDays(days: number = 30): { best: DailyStats | null; worst: DailyStats | null } {
        const stats = this.getDailyStats(days);
        if (stats.length === 0) return { best: null, worst: null };

        const sorted = [...stats].sort((a, b) => b.focusScore - a.focusScore);
        return {
            best: sorted[0],
            worst: sorted[sorted.length - 1],
        };
    }

    /**
     * Generate sample data for demo
     */
    generateSampleData(): void {
        const days = 14;
        const today = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            // Generate realistic-looking data with some variance
            const baseScore = 65 + Math.random() * 20;
            const dayOfWeek = date.getDay();
            const weekendPenalty = (dayOfWeek === 0 || dayOfWeek === 6) ? -15 : 0;

            this.recordDailyStats({
                focusScore: Math.round(baseScore + weekendPenalty),
                focusMinutes: Math.round(180 + Math.random() * 120 + weekendPenalty * 3),
                distractionMinutes: Math.round(30 + Math.random() * 60),
                deepWorkSessions: Math.round(1 + Math.random() * 3),
                contextSwitches: Math.round(20 + Math.random() * 40),
                breaksTaken: Math.round(3 + Math.random() * 4),
            });
        }
    }

    /**
     * Clear all data
     */
    clearData(): void {
        this.data = { dailyStats: [], weeklyTrends: [] };
        this.saveToStorage();
    }
}

export const focusTrendsService = new FocusTrendsService();
export default focusTrendsService;
