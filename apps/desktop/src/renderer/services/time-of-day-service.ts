/**
 * @fileoverview Time of Day Analysis Service
 * 
 * Analyzes productivity patterns by time of day to find optimal work hours.
 * Shows when user is most productive (morning, afternoon, evening).
 */

export interface HourlyStats {
    hour: number; // 0-23
    focusMinutes: number;
    distractionMinutes: number;
    avgFocusScore: number;
    deepWorkMinutes: number;
    sampleCount: number;
}

export interface TimeOfDayProfile {
    peakHours: number[]; // Best 3 hours
    lowHours: number[];  // Worst 3 hours
    morningScore: number;  // 6-12
    afternoonScore: number; // 12-18
    eveningScore: number;   // 18-24
    recommendation: string;
}

class TimeOfDayService {
    private hourlyData: Map<number, HourlyStats> = new Map();

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem('wakey_time_of_day');
            if (stored) {
                const data = JSON.parse(stored);
                this.hourlyData = new Map(Object.entries(data).map(([k, v]) => [parseInt(k), v as HourlyStats]));
            } else {
                this.initializeHours();
            }
        } catch (error) {
            console.error('Failed to load time of day data:', error);
            this.initializeHours();
        }
    }

    private initializeHours(): void {
        for (let h = 0; h < 24; h++) {
            this.hourlyData.set(h, {
                hour: h,
                focusMinutes: 0,
                distractionMinutes: 0,
                avgFocusScore: 0,
                deepWorkMinutes: 0,
                sampleCount: 0,
            });
        }
    }

    private saveToStorage(): void {
        const data = Object.fromEntries(this.hourlyData);
        localStorage.setItem('wakey_time_of_day', JSON.stringify(data));
    }

    /**
     * Record activity for current hour
     */
    recordActivity(focusMinutes: number, distractionMinutes: number, focusScore: number, isDeepWork: boolean): void {
        const hour = new Date().getHours();
        const existing = this.hourlyData.get(hour) || {
            hour,
            focusMinutes: 0,
            distractionMinutes: 0,
            avgFocusScore: 0,
            deepWorkMinutes: 0,
            sampleCount: 0,
        };

        // Running average for focus score
        const newCount = existing.sampleCount + 1;
        const newAvgScore = ((existing.avgFocusScore * existing.sampleCount) + focusScore) / newCount;

        this.hourlyData.set(hour, {
            hour,
            focusMinutes: existing.focusMinutes + focusMinutes,
            distractionMinutes: existing.distractionMinutes + distractionMinutes,
            avgFocusScore: newAvgScore,
            deepWorkMinutes: existing.deepWorkMinutes + (isDeepWork ? focusMinutes : 0),
            sampleCount: newCount,
        });

        this.saveToStorage();
    }

    /**
     * Get stats for all hours
     */
    getAllHourlyStats(): HourlyStats[] {
        return Array.from(this.hourlyData.values()).sort((a, b) => a.hour - b.hour);
    }

    /**
     * Get productivity profile
     */
    getProfile(): TimeOfDayProfile {
        const stats = this.getAllHourlyStats().filter(s => s.sampleCount > 0);

        if (stats.length === 0) {
            return {
                peakHours: [9, 10, 11],
                lowHours: [14, 15, 16],
                morningScore: 0,
                afternoonScore: 0,
                eveningScore: 0,
                recommendation: 'Start tracking to discover your optimal work hours!',
            };
        }

        // Sort by focus score to find peaks and lows
        const sorted = [...stats].sort((a, b) => b.avgFocusScore - a.avgFocusScore);
        const peakHours = sorted.slice(0, 3).map(s => s.hour);
        const lowHours = sorted.slice(-3).map(s => s.hour);

        // Calculate period scores
        const calcPeriodScore = (startHour: number, endHour: number) => {
            const periodStats = stats.filter(s => s.hour >= startHour && s.hour < endHour);
            if (periodStats.length === 0) return 0;
            return periodStats.reduce((sum, s) => sum + s.avgFocusScore, 0) / periodStats.length;
        };

        const morningScore = calcPeriodScore(6, 12);
        const afternoonScore = calcPeriodScore(12, 18);
        const eveningScore = calcPeriodScore(18, 24);

        // Generate recommendation
        let recommendation = '';
        const bestPeriod = Math.max(morningScore, afternoonScore, eveningScore);
        if (bestPeriod === morningScore) {
            recommendation = '🌅 You\'re a morning person! Schedule deep work before lunch.';
        } else if (bestPeriod === afternoonScore) {
            recommendation = '☀️ Afternoons are your power hours! Block 2-5pm for focus work.';
        } else {
            recommendation = '🌙 You\'re a night owl! Save complex tasks for the evening.';
        }

        return {
            peakHours,
            lowHours,
            morningScore: Math.round(morningScore),
            afternoonScore: Math.round(afternoonScore),
            eveningScore: Math.round(eveningScore),
            recommendation,
        };
    }

    /**
     * Get formatted hour label
     */
    formatHour(hour: number): string {
        const period = hour >= 12 ? 'PM' : 'AM';
        const h = hour % 12 || 12;
        return `${h}${period}`;
    }

    /**
     * Generate sample data for demo
     */
    generateSampleData(): void {
        // Morning person profile with some afternoon dip
        const patterns: Record<number, number> = {
            6: 60, 7: 70, 8: 80, 9: 90, 10: 95, 11: 85,
            12: 60, 13: 55, 14: 50, 15: 55, 16: 65, 17: 70,
            18: 60, 19: 55, 20: 50, 21: 45, 22: 40, 23: 30,
        };

        for (const [hour, baseScore] of Object.entries(patterns)) {
            const h = parseInt(hour);
            const variance = Math.random() * 10 - 5;
            const hours = this.hourlyData.get(h)!;

            this.hourlyData.set(h, {
                ...hours,
                avgFocusScore: baseScore + variance,
                focusMinutes: Math.round((baseScore / 100) * 45),
                distractionMinutes: Math.round(((100 - baseScore) / 100) * 15),
                deepWorkMinutes: baseScore > 70 ? Math.round((baseScore / 100) * 30) : 0,
                sampleCount: Math.round(5 + Math.random() * 10),
            });
        }

        this.saveToStorage();
    }
}

export const timeOfDayService = new TimeOfDayService();
export default timeOfDayService;
