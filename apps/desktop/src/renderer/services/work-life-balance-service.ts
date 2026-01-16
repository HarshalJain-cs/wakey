/**
 * @fileoverview Work/Life Balance Service
 * 
 * Tracks work hours and warns on overwork:
 * - Daily work hour limits
 * - Overtime tracking
 * - Balance score calculation
 * - Weekend work tracking
 */

export interface DailyWorkLog {
    date: string;
    workMinutes: number;
    startTime: string | null;
    endTime: string | null;
    overtimeMinutes: number;
    isWeekend: boolean;
}

export interface BalanceScore {
    score: number; // 0-100
    rating: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    factors: {
        name: string;
        impact: number; // -20 to +20
        description: string;
    }[];
    recommendation: string;
}

export interface WorkLifeConfig {
    targetWorkHours: number;      // Daily target (default 8)
    maxWorkHours: number;         // Maximum before warning (default 10)
    preferredStartTime: string;   // HH:mm (default 09:00)
    preferredEndTime: string;     // HH:mm (default 18:00)
    weekendWorkAllowed: boolean;
    overtimeAlertEnabled: boolean;
}

class WorkLifeBalanceService {
    private config: WorkLifeConfig;
    private workLogs: DailyWorkLog[] = [];

    constructor() {
        this.config = this.loadConfig();
        this.loadWorkLogs();
    }

    private loadConfig(): WorkLifeConfig {
        try {
            const stored = localStorage.getItem('wakey_work_life_config');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load work/life config:', error);
        }

        return {
            targetWorkHours: 8,
            maxWorkHours: 10,
            preferredStartTime: '09:00',
            preferredEndTime: '18:00',
            weekendWorkAllowed: false,
            overtimeAlertEnabled: true,
        };
    }

    private loadWorkLogs(): void {
        try {
            const stored = localStorage.getItem('wakey_work_logs');
            if (stored) {
                this.workLogs = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load work logs:', error);
        }
    }

    private saveConfig(): void {
        localStorage.setItem('wakey_work_life_config', JSON.stringify(this.config));
    }

    private saveWorkLogs(): void {
        // Keep last 90 days
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 90);
        this.workLogs = this.workLogs.filter(l => new Date(l.date) >= cutoff);

        localStorage.setItem('wakey_work_logs', JSON.stringify(this.workLogs));
    }

    /**
     * Log work time
     */
    logWorkTime(minutes: number, startTime?: string, endTime?: string): void {
        const today = new Date().toISOString().split('T')[0];
        const isWeekend = [0, 6].includes(new Date().getDay());

        let log = this.workLogs.find(l => l.date === today);
        if (!log) {
            log = {
                date: today,
                workMinutes: 0,
                startTime: startTime || null,
                endTime: null,
                overtimeMinutes: 0,
                isWeekend,
            };
            this.workLogs.push(log);
        }

        log.workMinutes += minutes;
        if (endTime) log.endTime = endTime;
        if (!log.startTime && startTime) log.startTime = startTime;

        // Calculate overtime
        const targetMinutes = this.config.targetWorkHours * 60;
        log.overtimeMinutes = Math.max(0, log.workMinutes - targetMinutes);

        this.saveWorkLogs();
    }

    /**
     * Calculate balance score
     */
    calculateBalanceScore(): BalanceScore {
        const factors: BalanceScore['factors'] = [];
        let baseScore = 100;

        // Get last 7 days of logs
        const recentLogs = this.getRecentLogs(7);

        if (recentLogs.length === 0) {
            return {
                score: 50,
                rating: 'fair',
                factors: [{ name: 'No Data', impact: 0, description: 'Start tracking to see your score' }],
                recommendation: 'Start tracking your work hours to get personalized insights.',
            };
        }

        // Factor 1: Average work hours
        const avgHours = recentLogs.reduce((sum, l) => sum + l.workMinutes, 0) / recentLogs.length / 60;
        if (avgHours > this.config.maxWorkHours) {
            const impact = -Math.min(30, (avgHours - this.config.maxWorkHours) * 5);
            baseScore += impact;
            factors.push({
                name: 'Excessive Hours',
                impact,
                description: `Working ${avgHours.toFixed(1)}h average (target: ${this.config.targetWorkHours}h)`,
            });
        } else if (avgHours < this.config.targetWorkHours * 0.8) {
            factors.push({
                name: 'Good Hours',
                impact: 10,
                description: 'Maintaining healthy work hours',
            });
            baseScore += 10;
        }

        // Factor 2: Weekend work
        const weekendLogs = recentLogs.filter(l => l.isWeekend && l.workMinutes > 30);
        if (weekendLogs.length > 0 && !this.config.weekendWorkAllowed) {
            const impact = -weekendLogs.length * 10;
            baseScore += impact;
            factors.push({
                name: 'Weekend Work',
                impact,
                description: `Worked ${weekendLogs.length} weekend day(s)`,
            });
        }

        // Factor 3: Total overtime
        const totalOvertime = recentLogs.reduce((sum, l) => sum + l.overtimeMinutes, 0);
        if (totalOvertime > 120) { // 2+ hours overtime in week
            const impact = -Math.min(20, Math.floor(totalOvertime / 60) * 5);
            baseScore += impact;
            factors.push({
                name: 'Overtime',
                impact,
                description: `${(totalOvertime / 60).toFixed(1)}h overtime this week`,
            });
        }

        // Factor 4: Consistent end times
        const endTimes = recentLogs.filter(l => l.endTime).map(l => l.endTime);
        if (endTimes.length >= 3) {
            const lateEnds = endTimes.filter(t => t! > this.config.preferredEndTime).length;
            if (lateEnds === 0) {
                factors.push({
                    name: 'Consistent End Time',
                    impact: 10,
                    description: 'Ending work on time consistently',
                });
                baseScore += 10;
            } else if (lateEnds >= 3) {
                const impact = -15;
                baseScore += impact;
                factors.push({
                    name: 'Late Finishes',
                    impact,
                    description: `Worked late ${lateEnds} times this week`,
                });
            }
        }

        // Calculate final score and rating
        const score = Math.max(0, Math.min(100, baseScore));
        let rating: BalanceScore['rating'];
        let recommendation: string;

        if (score >= 85) {
            rating = 'excellent';
            recommendation = '🌟 Excellent work-life balance! Keep maintaining these healthy habits.';
        } else if (score >= 70) {
            rating = 'good';
            recommendation = '👍 Good balance overall. Consider setting stricter boundaries.';
        } else if (score >= 50) {
            rating = 'fair';
            recommendation = '⚠️ Room for improvement. Try to stick to your target hours.';
        } else if (score >= 30) {
            rating = 'poor';
            recommendation = '🚨 Your work patterns suggest burnout risk. Please prioritize rest.';
        } else {
            rating = 'critical';
            recommendation = '🆘 Critical imbalance detected. Consider taking time off and speaking with someone.';
        }

        return { score, rating, factors, recommendation };
    }

    /**
     * Get recent work logs
     */
    getRecentLogs(days: number = 7): DailyWorkLog[] {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        return this.workLogs.filter(l => new Date(l.date) >= cutoff);
    }

    /**
     * Get today's log
     */
    getTodayLog(): DailyWorkLog | null {
        const today = new Date().toISOString().split('T')[0];
        return this.workLogs.find(l => l.date === today) || null;
    }

    /**
     * Check if over target hours today
     */
    isOvertime(): boolean {
        const todayLog = this.getTodayLog();
        if (!todayLog) return false;

        return todayLog.workMinutes > this.config.targetWorkHours * 60;
    }

    /**
     * Get hours remaining today
     */
    getHoursRemaining(): number {
        const todayLog = this.getTodayLog();
        const worked = todayLog?.workMinutes || 0;
        const target = this.config.targetWorkHours * 60;

        return Math.max(0, (target - worked) / 60);
    }

    /**
     * Get configuration
     */
    getConfig(): WorkLifeConfig {
        return { ...this.config };
    }

    /**
     * Update configuration
     */
    updateConfig(updates: Partial<WorkLifeConfig>): void {
        this.config = { ...this.config, ...updates };
        this.saveConfig();
    }

    /**
     * Generate sample data
     */
    generateSampleData(): void {
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const isWeekend = [0, 6].includes(date.getDay());

            if (isWeekend && Math.random() > 0.3) continue;

            const workMinutes = isWeekend
                ? Math.round(60 + Math.random() * 120)
                : Math.round(420 + Math.random() * 120);

            this.workLogs.push({
                date: dateStr,
                workMinutes,
                startTime: isWeekend ? '10:00' : '09:00',
                endTime: isWeekend ? '12:00' : (workMinutes > 480 ? '19:00' : '17:30'),
                overtimeMinutes: Math.max(0, workMinutes - 480),
                isWeekend,
            });
        }

        this.saveWorkLogs();
    }
}

export const workLifeBalanceService = new WorkLifeBalanceService();
export default workLifeBalanceService;
