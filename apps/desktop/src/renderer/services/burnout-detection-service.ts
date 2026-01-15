/**
 * @fileoverview Burnout Detection Service
 * 
 * Monitors work patterns to detect signs of burnout:
 * - Excessive work hours
 * - Declining focus scores
 * - Skipping breaks
 * - Weekend work patterns
 * - Late night work
 */

export type BurnoutRisk = 'low' | 'moderate' | 'high' | 'critical';

export interface BurnoutIndicator {
    type: string;
    description: string;
    severity: 'info' | 'warning' | 'danger';
    triggered: boolean;
}

export interface BurnoutAssessment {
    riskLevel: BurnoutRisk;
    score: number; // 0-100
    indicators: BurnoutIndicator[];
    recommendations: string[];
    lastUpdated: Date;
}

interface DailyWorkPattern {
    date: string;
    workMinutes: number;
    focusScore: number;
    breaksTaken: number;
    lateNightMinutes: number; // Work after 9pm
    earlyMorningMinutes: number; // Work before 7am
    weekendWork: boolean;
}

class BurnoutDetectionService {
    private patterns: DailyWorkPattern[] = [];
    private lastAssessment: BurnoutAssessment | null = null;

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem('wakey_burnout_data');
            if (stored) {
                const data = JSON.parse(stored);
                this.patterns = data.patterns || [];
                this.lastAssessment = data.lastAssessment || null;
            }
        } catch (error) {
            console.error('Failed to load burnout data:', error);
        }
    }

    private saveToStorage(): void {
        localStorage.setItem('wakey_burnout_data', JSON.stringify({
            patterns: this.patterns,
            lastAssessment: this.lastAssessment,
        }));
    }

    /**
     * Record daily work pattern
     */
    recordDailyPattern(pattern: Omit<DailyWorkPattern, 'date'>): void {
        const today = new Date().toISOString().split('T')[0];
        const isWeekend = [0, 6].includes(new Date().getDay());

        const dayPattern: DailyWorkPattern = {
            ...pattern,
            date: today,
            weekendWork: isWeekend && pattern.workMinutes > 30,
        };

        const existingIndex = this.patterns.findIndex(p => p.date === today);
        if (existingIndex >= 0) {
            this.patterns[existingIndex] = dayPattern;
        } else {
            this.patterns.push(dayPattern);
        }

        // Keep last 30 days
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);
        this.patterns = this.patterns.filter(p => new Date(p.date) >= cutoff);

        this.saveToStorage();
    }

    /**
     * Assess current burnout risk
     */
    assessBurnoutRisk(): BurnoutAssessment {
        const indicators: BurnoutIndicator[] = [];
        let riskScore = 0;
        const recentPatterns = this.patterns.slice(-14); // Last 2 weeks

        // Check excessive work hours
        const avgDailyMinutes = recentPatterns.length > 0
            ? recentPatterns.reduce((sum, p) => sum + p.workMinutes, 0) / recentPatterns.length
            : 0;

        indicators.push({
            type: 'excessive_hours',
            description: 'Working more than 9 hours daily',
            severity: avgDailyMinutes > 540 ? 'danger' : avgDailyMinutes > 480 ? 'warning' : 'info',
            triggered: avgDailyMinutes > 480,
        });
        if (avgDailyMinutes > 540) riskScore += 25;
        else if (avgDailyMinutes > 480) riskScore += 15;

        // Check declining focus scores
        if (recentPatterns.length >= 7) {
            const firstWeekAvg = recentPatterns.slice(0, 7).reduce((sum, p) => sum + p.focusScore, 0) / 7;
            const lastWeekAvg = recentPatterns.slice(-7).reduce((sum, p) => sum + p.focusScore, 0) / 7;
            const decline = firstWeekAvg - lastWeekAvg;

            indicators.push({
                type: 'focus_decline',
                description: 'Focus scores declining over time',
                severity: decline > 15 ? 'danger' : decline > 8 ? 'warning' : 'info',
                triggered: decline > 8,
            });
            if (decline > 15) riskScore += 20;
            else if (decline > 8) riskScore += 10;
        }

        // Check break patterns
        const avgBreaks = recentPatterns.length > 0
            ? recentPatterns.reduce((sum, p) => sum + p.breaksTaken, 0) / recentPatterns.length
            : 0;

        indicators.push({
            type: 'skipping_breaks',
            description: 'Not taking enough breaks',
            severity: avgBreaks < 2 ? 'danger' : avgBreaks < 4 ? 'warning' : 'info',
            triggered: avgBreaks < 4,
        });
        if (avgBreaks < 2) riskScore += 20;
        else if (avgBreaks < 4) riskScore += 10;

        // Check late night work
        const lateNightDays = recentPatterns.filter(p => p.lateNightMinutes > 60).length;
        indicators.push({
            type: 'late_nights',
            description: 'Working late into the night',
            severity: lateNightDays >= 5 ? 'danger' : lateNightDays >= 3 ? 'warning' : 'info',
            triggered: lateNightDays >= 3,
        });
        if (lateNightDays >= 5) riskScore += 20;
        else if (lateNightDays >= 3) riskScore += 10;

        // Check weekend work
        const weekendDays = recentPatterns.filter(p => p.weekendWork).length;
        indicators.push({
            type: 'weekend_work',
            description: 'Working on weekends',
            severity: weekendDays >= 4 ? 'danger' : weekendDays >= 2 ? 'warning' : 'info',
            triggered: weekendDays >= 2,
        });
        if (weekendDays >= 4) riskScore += 15;
        else if (weekendDays >= 2) riskScore += 8;

        // Determine risk level
        let riskLevel: BurnoutRisk;
        if (riskScore >= 70) riskLevel = 'critical';
        else if (riskScore >= 45) riskLevel = 'high';
        else if (riskScore >= 25) riskLevel = 'moderate';
        else riskLevel = 'low';

        // Generate recommendations
        const recommendations = this.generateRecommendations(indicators, riskLevel);

        this.lastAssessment = {
            riskLevel,
            score: riskScore,
            indicators,
            recommendations,
            lastUpdated: new Date(),
        };

        this.saveToStorage();
        return this.lastAssessment;
    }

    private generateRecommendations(indicators: BurnoutIndicator[], riskLevel: BurnoutRisk): string[] {
        const recommendations: string[] = [];

        const triggeredIndicators = indicators.filter(i => i.triggered);

        if (triggeredIndicators.find(i => i.type === 'excessive_hours')) {
            recommendations.push('🕐 Set a hard stop time each day and stick to it');
            recommendations.push('📅 Block "wind down" time on your calendar');
        }

        if (triggeredIndicators.find(i => i.type === 'focus_decline')) {
            recommendations.push('🧘 Try a midday meditation or walk');
            recommendations.push('💤 Ensure you\'re getting 7-8 hours of sleep');
        }

        if (triggeredIndicators.find(i => i.type === 'skipping_breaks')) {
            recommendations.push('☕ Use the Pomodoro technique with enforced breaks');
            recommendations.push('🚶 Take a 10-minute walk after each focus session');
        }

        if (triggeredIndicators.find(i => i.type === 'late_nights')) {
            recommendations.push('🌙 Establish a "screens off" time before bed');
            recommendations.push('📵 Move devices out of the bedroom');
        }

        if (triggeredIndicators.find(i => i.type === 'weekend_work')) {
            recommendations.push('🎯 Protect your weekends for rest and recovery');
            recommendations.push('📋 Plan tasks to complete by Friday evening');
        }

        if (riskLevel === 'critical') {
            recommendations.unshift('🚨 Consider taking a day off or speaking with a manager');
        }

        if (riskLevel === 'high') {
            recommendations.unshift('⚠️ Your work patterns suggest high stress - please prioritize rest');
        }

        return recommendations.slice(0, 5);
    }

    /**
     * Get last assessment
     */
    getLastAssessment(): BurnoutAssessment | null {
        return this.lastAssessment;
    }

    /**
     * Get risk level as color
     */
    getRiskColor(risk: BurnoutRisk): string {
        switch (risk) {
            case 'low': return '#22c55e';
            case 'moderate': return '#f59e0b';
            case 'high': return '#f97316';
            case 'critical': return '#ef4444';
        }
    }

    /**
     * Generate sample data for demo
     */
    generateSampleData(): void {
        const today = new Date();

        for (let i = 13; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            // Create slightly concerning but not critical pattern
            this.patterns.push({
                date: date.toISOString().split('T')[0],
                workMinutes: 420 + Math.random() * 120, // 7-9 hours
                focusScore: 70 - (i * 0.5) + Math.random() * 10, // Slight decline
                breaksTaken: Math.round(2 + Math.random() * 3),
                lateNightMinutes: i % 3 === 0 ? 60 + Math.random() * 30 : 0,
                earlyMorningMinutes: 0,
                weekendWork: [0, 6].includes(date.getDay()) && Math.random() > 0.5,
            });
        }

        this.saveToStorage();
    }
}

export const burnoutDetectionService = new BurnoutDetectionService();
export default burnoutDetectionService;
