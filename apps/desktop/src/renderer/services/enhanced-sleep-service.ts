// apps/desktop/src/renderer/services/enhanced-sleep-service.ts

interface SleepProfile {
    averageBedtime: string;
    averageWakeTime: string;
    averageDuration: number;
    chronotype: 'morning-lark' | 'night-owl' | 'intermediate';
    sleepDebt: number;  // hours
    optimalSleepWindow: { start: string; end: string };
}

interface SleepProductivityCorrelation {
    optimalSleepDuration: number;
    productivityByDuration: Map<number, number>;
    productivityByQuality: Map<string, number>;
}

interface SleepEntry {
    date: Date;
    bedtime: string;
    wakeTime: string;
    duration: number;
    quality: number;
    stages: { stage: string; minutes: number }[];
}

interface BedtimeReminder {
    bedtime: Date;
    windDownStart: Date;
    activities: { time: number; activity: string }[];
}

export class EnhancedSleepService {
    private sleepHistory: SleepEntry[] = [];

    async getSleepProfile(): Promise<SleepProfile> {
        const sleepHistory = await this.getSleepHistory(30);

        const avgBedtime = this.calculateAverageBedtime(sleepHistory);
        const avgWakeTime = this.calculateAverageWakeTime(sleepHistory);
        const avgDuration = this.calculateAverageDuration(sleepHistory);

        return {
            averageBedtime: avgBedtime,
            averageWakeTime: avgWakeTime,
            averageDuration: avgDuration,
            chronotype: this.determineChronotype(avgBedtime, avgWakeTime),
            sleepDebt: this.calculateSleepDebt(sleepHistory),
            optimalSleepWindow: this.calculateOptimalWindow(sleepHistory)
        };
    }

    async getSleepHistory(days: number): Promise<SleepEntry[]> {
        // Would fetch from database and wearable data
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        return this.sleepHistory.filter(entry => entry.date >= cutoff);
    }

    async analyzeSleepProductivityCorrelation(): Promise<SleepProductivityCorrelation> {
        const sleepData = await this.getSleepHistory(90);

        // Analyze correlation between sleep duration and productivity
        const byDuration = new Map<number, number>();
        const byQuality = new Map<string, number>();

        // Group by duration (rounded to nearest hour)
        for (const entry of sleepData) {
            const hours = Math.round(entry.duration);
            const currentProd = byDuration.get(hours) || 0;
            byDuration.set(hours, currentProd + entry.quality);
        }

        // Find optimal duration
        let maxProd = 0;
        let optimalDuration = 8;
        for (const [duration, totalProd] of byDuration) {
            if (totalProd > maxProd) {
                maxProd = totalProd;
                optimalDuration = duration;
            }
        }

        return {
            optimalSleepDuration: optimalDuration,
            productivityByDuration: byDuration,
            productivityByQuality: byQuality
        };
    }

    async getBedtimeReminder(): Promise<BedtimeReminder> {
        const profile = await this.getSleepProfile();
        const targetBedtime = this.parseTime(profile.optimalSleepWindow.start);

        // Wind-down routine starts 1 hour before bed
        const windDownStart = new Date(targetBedtime.getTime() - 60 * 60 * 1000);

        return {
            bedtime: targetBedtime,
            windDownStart,
            activities: [
                { time: -60, activity: 'Dim lights, reduce screen brightness' },
                { time: -45, activity: 'Light stretching or reading' },
                { time: -30, activity: "Prepare tomorrow's tasks" },
                { time: -15, activity: 'Breathing exercises' },
                { time: 0, activity: 'Time for bed!' }
            ]
        };
    }

    async trackSleep(entry: Omit<SleepEntry, 'date'>): Promise<void> {
        this.sleepHistory.push({
            ...entry,
            date: new Date()
        });
        // Would save to database
    }

    private calculateAverageBedtime(history: SleepEntry[]): string {
        if (history.length === 0) return '23:00';

        let totalMinutes = 0;
        for (const entry of history) {
            const [hours, mins] = entry.bedtime.split(':').map(Number);
            // Handle times after midnight as next day
            const adjustedHours = hours < 12 ? hours + 24 : hours;
            totalMinutes += adjustedHours * 60 + mins;
        }

        const avgMinutes = totalMinutes / history.length;
        const avgHours = Math.floor(avgMinutes / 60) % 24;
        const avgMins = Math.floor(avgMinutes % 60);

        return `${avgHours.toString().padStart(2, '0')}:${avgMins.toString().padStart(2, '0')}`;
    }

    private calculateAverageWakeTime(history: SleepEntry[]): string {
        if (history.length === 0) return '07:00';

        let totalMinutes = 0;
        for (const entry of history) {
            const [hours, mins] = entry.wakeTime.split(':').map(Number);
            totalMinutes += hours * 60 + mins;
        }

        const avgMinutes = totalMinutes / history.length;
        const avgHours = Math.floor(avgMinutes / 60);
        const avgMins = Math.floor(avgMinutes % 60);

        return `${avgHours.toString().padStart(2, '0')}:${avgMins.toString().padStart(2, '0')}`;
    }

    private calculateAverageDuration(history: SleepEntry[]): number {
        if (history.length === 0) return 7.5;

        const totalDuration = history.reduce((sum, e) => sum + e.duration, 0);
        return totalDuration / history.length;
    }

    private determineChronotype(bedtime: string, wakeTime: string): 'morning-lark' | 'night-owl' | 'intermediate' {
        const bedHour = parseInt(bedtime.split(':')[0]);
        const wakeHour = parseInt(wakeTime.split(':')[0]);

        // Early bedtime (before 22) and early wake (before 7) = morning lark
        if (bedHour < 22 && wakeHour < 7) return 'morning-lark';

        // Late bedtime (after midnight) and late wake (after 9) = night owl
        if ((bedHour >= 0 && bedHour < 6) && wakeHour >= 9) return 'night-owl';

        return 'intermediate';
    }

    private calculateSleepDebt(history: SleepEntry[]): number {
        if (history.length === 0) return 0;

        const recommendedSleep = 8; // hours
        const recentHistory = history.slice(-7); // Last week

        let debt = 0;
        for (const entry of recentHistory) {
            if (entry.duration < recommendedSleep) {
                debt += recommendedSleep - entry.duration;
            }
        }

        return Math.round(debt * 10) / 10;
    }

    private calculateOptimalWindow(history: SleepEntry[]): { start: string; end: string } {
        // Find the sleep windows with highest quality
        if (history.length === 0) {
            return { start: '23:00', end: '07:00' };
        }

        const avgBedtime = this.calculateAverageBedtime(history);
        const avgWakeTime = this.calculateAverageWakeTime(history);

        return {
            start: avgBedtime,
            end: avgWakeTime
        };
    }

    private parseTime(timeStr: string): Date {
        const [hours, mins] = timeStr.split(':').map(Number);
        const now = new Date();
        now.setHours(hours, mins, 0, 0);

        // If time is in the past, set for tomorrow
        if (now < new Date()) {
            now.setDate(now.getDate() + 1);
        }

        return now;
    }

    // Circadian rhythm tracking
    async getCircadianPhase(): Promise<{ phase: string; optimalActivities: string[] }> {
        const now = new Date();
        const hour = now.getHours();

        if (hour >= 6 && hour < 9) {
            return {
                phase: 'wake-up',
                optimalActivities: ['Light exposure', 'Light exercise', 'Planning tasks']
            };
        } else if (hour >= 9 && hour < 12) {
            return {
                phase: 'peak-alertness',
                optimalActivities: ['Deep work', 'Complex problem solving', 'Creative tasks']
            };
        } else if (hour >= 12 && hour < 14) {
            return {
                phase: 'post-lunch-dip',
                optimalActivities: ['Light tasks', 'Meetings', 'Administrative work']
            };
        } else if (hour >= 14 && hour < 17) {
            return {
                phase: 'afternoon-peak',
                optimalActivities: ['Focused work', 'Collaboration', 'Learning']
            };
        } else if (hour >= 17 && hour < 21) {
            return {
                phase: 'wind-down',
                optimalActivities: ['Light tasks', 'Review', 'Exercise']
            };
        } else {
            return {
                phase: 'sleep-preparation',
                optimalActivities: ['Relaxation', 'Screen-free time', 'Meditation']
            };
        }
    }
}

export const enhancedSleepService = new EnhancedSleepService();
export type { SleepProfile, SleepProductivityCorrelation, SleepEntry, BedtimeReminder };
