// apps/desktop/src/renderer/services/enhanced-burnout-service.ts

import { wearableIntegrationService, WearableData } from './wearable-integration-service';
import { eventBus } from '../lib/event-bus';

interface BurnoutIndicators {
    workHours: { score: number; trend: 'up' | 'down' | 'stable' };
    focusQuality: { score: number; trend: 'up' | 'down' | 'stable' };
    stressLevel: { score: number; trend: 'up' | 'down' | 'stable' };
    sleepQuality: { score: number; trend: 'up' | 'down' | 'stable' };
    physicalActivity: { score: number; trend: 'up' | 'down' | 'stable' };
    socialInteraction: { score: number; trend: 'up' | 'down' | 'stable' };
    sentimentScore: { score: number; trend: 'up' | 'down' | 'stable' };
}

interface BurnoutAssessment {
    riskLevel: 'low' | 'moderate' | 'high' | 'critical';
    score: number;  // 0-100
    indicators: BurnoutIndicators;
    primaryCauses: string[];
    interventions: BurnoutIntervention[];
    timeline: { date: Date; score: number }[];
}

interface BurnoutIntervention {
    id: string;
    type: 'immediate' | 'short-term' | 'long-term';
    title: string;
    description: string;
    actionable: boolean;
    action?: () => Promise<void>;
}

interface WorkData {
    weeklyHours: number;
    dailyAverage: number;
    overtime: number;
    breaksTaken: number;
    meetingLoad: number;
}

interface FocusData {
    averageQuality: number;
    sessionsCompleted: number;
    distractions: number;
    deepWorkHours: number;
}

interface CommunicationData {
    messageVolume: number;
    responseTime: number;
    sentiment: number;
}

export class EnhancedBurnoutService {
    private burnoutHistory: { date: Date; score: number }[] = [];
    private alertsEnabled: boolean = true;

    async assessBurnoutRisk(): Promise<BurnoutAssessment> {
        // Gather all indicators
        const workData = await this.getWorkData();
        const healthData = await wearableIntegrationService.getLatestData();
        const focusData = await this.getFocusMetrics();
        const communicationData = await this.analyzeRecentCommunication();

        // Calculate individual scores
        const indicators: BurnoutIndicators = {
            workHours: this.scoreWorkHours(workData),
            focusQuality: this.scoreFocusQuality(focusData),
            stressLevel: this.scoreStress(healthData),
            sleepQuality: this.scoreSleep(healthData),
            physicalActivity: this.scoreActivity(healthData),
            socialInteraction: this.scoreSocialInteraction(workData),
            sentimentScore: this.scoreSentiment(communicationData)
        };

        // Calculate composite score (weighted)
        const weights = {
            workHours: 0.20,
            focusQuality: 0.15,
            stressLevel: 0.20,
            sleepQuality: 0.15,
            physicalActivity: 0.10,
            socialInteraction: 0.10,
            sentimentScore: 0.10
        };

        let compositeScore = 0;
        for (const [key, weight] of Object.entries(weights)) {
            compositeScore += indicators[key as keyof BurnoutIndicators].score * weight;
        }

        // Determine risk level
        const riskLevel = compositeScore > 75 ? 'critical' :
            compositeScore > 55 ? 'high' :
                compositeScore > 35 ? 'moderate' : 'low';

        // Generate interventions
        const interventions = this.generateInterventions(indicators, riskLevel);

        // Log to history
        this.burnoutHistory.push({ date: new Date(), score: compositeScore });

        // Emit event if critical
        if (this.alertsEnabled && (riskLevel === 'critical' || riskLevel === 'high')) {
            eventBus.emit('health:burnout-warning', {
                level: riskLevel === 'critical' ? 'critical' : 'warning',
                message: `Burnout risk is ${riskLevel}. Score: ${compositeScore.toFixed(0)}`
            });
        }

        return {
            riskLevel,
            score: compositeScore,
            indicators,
            primaryCauses: this.identifyPrimaryCauses(indicators),
            interventions,
            timeline: this.burnoutHistory.slice(-30)
        };
    }

    private async getWorkData(): Promise<WorkData> {
        // Would fetch from database
        return {
            weeklyHours: 42,
            dailyAverage: 8.4,
            overtime: 2,
            breaksTaken: 5,
            meetingLoad: 10
        };
    }

    private async getFocusMetrics(): Promise<FocusData> {
        // Would fetch from focus service
        return {
            averageQuality: 75,
            sessionsCompleted: 20,
            distractions: 12,
            deepWorkHours: 15
        };
    }

    private async analyzeRecentCommunication(): Promise<CommunicationData> {
        // Would analyze communication patterns
        return {
            messageVolume: 100,
            responseTime: 5,
            sentiment: 0.7
        };
    }

    private scoreWorkHours(data: WorkData): { score: number; trend: 'up' | 'down' | 'stable' } {
        // Higher score = worse (more burnout risk)
        let score = 0;
        if (data.weeklyHours > 50) score = 80;
        else if (data.weeklyHours > 45) score = 60;
        else if (data.weeklyHours > 40) score = 40;
        else score = 20;

        return { score, trend: data.overtime > 0 ? 'up' : 'stable' };
    }

    private scoreFocusQuality(data: FocusData): { score: number; trend: 'up' | 'down' | 'stable' } {
        // Lower quality = higher burnout risk
        const score = Math.max(0, 100 - data.averageQuality);
        return { score, trend: 'stable' };
    }

    private scoreStress(data: WearableData | null): { score: number; trend: 'up' | 'down' | 'stable' } {
        if (!data) return { score: 50, trend: 'stable' };
        return {
            score: data.stress.level,
            trend: data.stress.trend === 'increasing' ? 'up' :
                data.stress.trend === 'decreasing' ? 'down' : 'stable'
        };
    }

    private scoreSleep(data: WearableData | null): { score: number; trend: 'up' | 'down' | 'stable' } {
        if (!data) return { score: 50, trend: 'stable' };
        // Low sleep score = high burnout risk
        return { score: Math.max(0, 100 - data.sleep.score), trend: 'stable' };
    }

    private scoreActivity(data: WearableData | null): { score: number; trend: 'up' | 'down' | 'stable' } {
        if (!data) return { score: 50, trend: 'stable' };
        // Low activity = higher burnout risk
        const activityScore = Math.min(data.activity.activeMinutes / 60 * 100, 100);
        return { score: Math.max(0, 100 - activityScore), trend: 'stable' };
    }

    private scoreSocialInteraction(data: WorkData): { score: number; trend: 'up' | 'down' | 'stable' } {
        // Too many meetings can indicate social exhaustion
        const score = data.meetingLoad > 20 ? 70 : data.meetingLoad > 10 ? 40 : 20;
        return { score, trend: 'stable' };
    }

    private scoreSentiment(data: CommunicationData): { score: number; trend: 'up' | 'down' | 'stable' } {
        // Low sentiment = higher burnout risk
        return { score: Math.max(0, 100 - data.sentiment * 100), trend: 'stable' };
    }

    private identifyPrimaryCauses(indicators: BurnoutIndicators): string[] {
        const causes: string[] = [];

        if (indicators.workHours.score > 60) {
            causes.push('Excessive work hours');
        }
        if (indicators.stressLevel.score > 60) {
            causes.push('Elevated stress levels');
        }
        if (indicators.sleepQuality.score > 60) {
            causes.push('Poor sleep quality');
        }
        if (indicators.focusQuality.score > 60) {
            causes.push('Declining focus quality');
        }
        if (indicators.physicalActivity.score > 60) {
            causes.push('Insufficient physical activity');
        }

        return causes;
    }

    private generateInterventions(
        indicators: BurnoutIndicators,
        riskLevel: string
    ): BurnoutIntervention[] {
        const interventions: BurnoutIntervention[] = [];

        if (riskLevel === 'critical') {
            interventions.push({
                id: 'immediate-break',
                type: 'immediate',
                title: 'Take immediate break',
                description: 'Step away from work for at least 30 minutes',
                actionable: true,
                action: async () => {
                    console.log('Starting 30-minute break');
                }
            });
        }

        if (indicators.workHours.score > 60) {
            interventions.push({
                id: 'reduce-hours',
                type: 'short-term',
                title: 'Reduce work hours',
                description: 'Your work hours are above healthy limits. Set boundaries.',
                actionable: true,
                action: async () => {
                    console.log('Enabling work hours limit');
                }
            });
        }

        if (indicators.sleepQuality.score > 50) {
            interventions.push({
                id: 'improve-sleep',
                type: 'short-term',
                title: 'Improve sleep hygiene',
                description: 'Enable bedtime reminders and reduce late work sessions.',
                actionable: true
            });
        }

        if (indicators.physicalActivity.score > 60) {
            interventions.push({
                id: 'increase-activity',
                type: 'long-term',
                title: 'Increase physical activity',
                description: 'Schedule regular exercise and walking breaks.',
                actionable: true
            });
        }

        if (indicators.stressLevel.score > 60) {
            interventions.push({
                id: 'stress-management',
                type: 'short-term',
                title: 'Practice stress management',
                description: 'Try breathing exercises and meditation during breaks.',
                actionable: true
            });
        }

        return interventions;
    }

    getBurnoutTimeline(): { date: Date; score: number }[] {
        return this.burnoutHistory;
    }

    enableAlerts(enabled: boolean): void {
        this.alertsEnabled = enabled;
    }

    // Recovery tracking
    async startRecoveryProgram(): Promise<{
        duration: number;
        activities: { day: number; activity: string; completed: boolean }[];
    }> {
        return {
            duration: 14, // 2-week program
            activities: [
                { day: 1, activity: 'Take a mental health day', completed: false },
                { day: 2, activity: 'Limit work to 6 hours', completed: false },
                { day: 3, activity: '30-minute walk outdoors', completed: false },
                { day: 4, activity: 'Digital detox evening', completed: false },
                { day: 5, activity: 'Social activity with friends/family', completed: false },
                { day: 6, activity: 'Hobby time (2+ hours)', completed: false },
                { day: 7, activity: 'Full day off', completed: false },
                { day: 8, activity: 'Gradual return with breaks', completed: false },
                { day: 9, activity: 'Exercise session', completed: false },
                { day: 10, activity: 'Review and adjust workload', completed: false },
                { day: 11, activity: 'Establish new boundaries', completed: false },
                { day: 12, activity: 'Mindfulness practice', completed: false },
                { day: 13, activity: 'Plan sustainable schedule', completed: false },
                { day: 14, activity: 'Reassess burnout score', completed: false }
            ]
        };
    }
}

export const enhancedBurnoutService = new EnhancedBurnoutService();
export type { BurnoutAssessment, BurnoutIndicators, BurnoutIntervention };
