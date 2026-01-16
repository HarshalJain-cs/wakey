/**
 * @fileoverview Sleep Quality Input Service
 * 
 * Morning sleep quality ratings correlated with productivity:
 * - Simple 1-5 rating
 * - Sleep hours tracking
 * - Correlation with focus scores
 */

export interface SleepEntry {
    date: string;
    quality: 1 | 2 | 3 | 4 | 5;
    hoursSlept: number;
    bedTime: string | null;
    wakeTime: string | null;
    notes: string;
}

export interface SleepCorrelation {
    averageSleepHours: number;
    averageQuality: number;
    bestSleepDays: string[];
    worstSleepDays: string[];
    productivityCorrelation: 'positive' | 'negative' | 'neutral';
    recommendation: string;
}

const QUALITY_LABELS: Record<number, { label: string; emoji: string; description: string }> = {
    1: { label: 'Terrible', emoji: '😫', description: 'Barely slept, exhausted' },
    2: { label: 'Poor', emoji: '😞', description: 'Restless, woke up tired' },
    3: { label: 'Okay', emoji: '😐', description: 'Average, could be better' },
    4: { label: 'Good', emoji: '😊', description: 'Rested, ready for the day' },
    5: { label: 'Excellent', emoji: '🤩', description: 'Perfect sleep, fully refreshed' },
};

class SleepQualityService {
    private entries: SleepEntry[] = [];

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem('wakey_sleep');
            if (stored) {
                this.entries = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load sleep data:', error);
        }
    }

    private saveToStorage(): void {
        // Keep last 90 days
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 90);
        this.entries = this.entries.filter(e => new Date(e.date) >= cutoff);

        localStorage.setItem('wakey_sleep', JSON.stringify(this.entries));
    }

    /**
     * Log sleep quality for today
     */
    logSleep(data: Omit<SleepEntry, 'date'>): SleepEntry {
        const today = new Date().toISOString().split('T')[0];

        // Update or add today's entry
        const existingIndex = this.entries.findIndex(e => e.date === today);
        const entry: SleepEntry = { ...data, date: today };

        if (existingIndex >= 0) {
            this.entries[existingIndex] = entry;
        } else {
            this.entries.push(entry);
        }

        this.saveToStorage();
        return entry;
    }

    /**
     * Get today's sleep entry
     */
    getTodayEntry(): SleepEntry | null {
        const today = new Date().toISOString().split('T')[0];
        return this.entries.find(e => e.date === today) || null;
    }

    /**
     * Check if sleep logged today
     */
    hasLoggedToday(): boolean {
        return this.getTodayEntry() !== null;
    }

    /**
     * Get recent entries
     */
    getRecentEntries(days: number = 7): SleepEntry[] {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        return this.entries
            .filter(e => new Date(e.date) >= cutoff)
            .sort((a, b) => b.date.localeCompare(a.date));
    }

    /**
     * Get quality label info
     */
    getQualityInfo(quality: number): typeof QUALITY_LABELS[1] {
        return QUALITY_LABELS[quality] || QUALITY_LABELS[3];
    }

    /**
     * Get all quality labels
     */
    getAllQualityLabels(): typeof QUALITY_LABELS {
        return QUALITY_LABELS;
    }

    /**
     * Calculate sleep correlation with productivity
     */
    getCorrelation(focusScores: Record<string, number>): SleepCorrelation {
        const recentEntries = this.getRecentEntries(14);

        if (recentEntries.length === 0) {
            return {
                averageSleepHours: 0,
                averageQuality: 0,
                bestSleepDays: [],
                worstSleepDays: [],
                productivityCorrelation: 'neutral',
                recommendation: 'Start logging your sleep to see correlations with productivity!',
            };
        }

        const averageSleepHours = recentEntries.reduce((sum, e) => sum + e.hoursSlept, 0) / recentEntries.length;
        const averageQuality = recentEntries.reduce((sum, e) => sum + e.quality, 0) / recentEntries.length;

        // Sort by quality
        const sorted = [...recentEntries].sort((a, b) => b.quality - a.quality);
        const bestSleepDays = sorted.slice(0, 3).map(e => e.date);
        const worstSleepDays = sorted.slice(-3).map(e => e.date);

        // Calculate correlation
        let correlation: SleepCorrelation['productivityCorrelation'] = 'neutral';
        let correlationScore = 0;

        recentEntries.forEach(entry => {
            const focusScore = focusScores[entry.date];
            if (focusScore) {
                if (entry.quality >= 4 && focusScore >= 70) correlationScore++;
                if (entry.quality <= 2 && focusScore <= 50) correlationScore++;
                if (entry.quality >= 4 && focusScore <= 50) correlationScore--;
                if (entry.quality <= 2 && focusScore >= 70) correlationScore--;
            }
        });

        if (correlationScore >= 3) correlation = 'positive';
        else if (correlationScore <= -3) correlation = 'negative';

        // Generate recommendation
        let recommendation = '';
        if (averageQuality < 3) {
            recommendation = '😴 Your sleep quality is low. Try going to bed 30 min earlier.';
        } else if (averageSleepHours < 7) {
            recommendation = '⏰ You\'re not getting enough sleep. Aim for 7-8 hours.';
        } else if (averageQuality >= 4 && averageSleepHours >= 7) {
            recommendation = '🌟 Great sleep habits! Keep it up for peak productivity.';
        } else {
            recommendation = '💤 Track your sleep consistently to optimize your productivity.';
        }

        return {
            averageSleepHours: Math.round(averageSleepHours * 10) / 10,
            averageQuality: Math.round(averageQuality * 10) / 10,
            bestSleepDays,
            worstSleepDays,
            productivityCorrelation: correlation,
            recommendation,
        };
    }

    /**
     * Get sleep stats
     */
    getStats(): {
        avgQuality: number;
        avgHours: number;
        streak: number;
        lastEntry: SleepEntry | null;
    } {
        const recent = this.getRecentEntries(30);

        // Calculate streak
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const dateStr = checkDate.toISOString().split('T')[0];

            if (this.entries.find(e => e.date === dateStr)) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }

        return {
            avgQuality: recent.length > 0
                ? Math.round(recent.reduce((sum, e) => sum + e.quality, 0) / recent.length * 10) / 10
                : 0,
            avgHours: recent.length > 0
                ? Math.round(recent.reduce((sum, e) => sum + e.hoursSlept, 0) / recent.length * 10) / 10
                : 0,
            streak,
            lastEntry: recent[0] || null,
        };
    }

    /**
     * Generate sample data
     */
    generateSampleData(): void {
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            this.entries.push({
                date: date.toISOString().split('T')[0],
                quality: (Math.floor(Math.random() * 3) + 3) as SleepEntry['quality'],
                hoursSlept: 6 + Math.random() * 2,
                bedTime: '23:00',
                wakeTime: '07:00',
                notes: '',
            });
        }

        this.saveToStorage();
    }
}

export const sleepQualityService = new SleepQualityService();
export default sleepQualityService;
