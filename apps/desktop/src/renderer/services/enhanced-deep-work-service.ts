// apps/desktop/src/renderer/services/enhanced-deep-work-service.ts

import { v4 as generateId } from 'uuid';
import { eventBus } from '../lib/event-bus';

interface FlowState {
    inFlow: boolean;
    flowScore: number;        // 0-100
    flowDuration: number;     // minutes in current flow
    distractions: number;     // count since flow started
    contextSwitches: number;
}

interface DeepWorkMetrics {
    dailyDeepWorkMinutes: number;
    deepWorkPercentage: number;
    averageFlowDuration: number;
    distractionFrequency: number;     // per hour
    contextSwitchFrequency: number;   // per hour
    peakFlowHours: number[];
    appProductivityScores: Map<string, number>;
}

interface CurrentMetrics {
    continuousFocusMinutes: number;
    distractionsPerHour: number;
    contextSwitchesPerHour: number;
    recentDistractions: number;
    recentContextSwitches: number;
}

interface HeatmapData {
    data: number[][];
    labels: {
        days: string[];
        hours: string[];
    };
}

export class EnhancedDeepWorkService {
    private flowState: FlowState = {
        inFlow: false,
        flowScore: 0,
        flowDuration: 0,
        distractions: 0,
        contextSwitches: 0
    };

    private readonly FLOW_THRESHOLD = 70;
    private readonly DISTRACTION_APPS = ['discord.exe', 'slack.exe', 'twitter.com', 'reddit.com'];
    private currentSession: { id: string; type: string; startTime: Date; plannedDurationMs: number } | null = null;

    getFlowState(): FlowState {
        return { ...this.flowState };
    }

    startSession(type: string, plannedDurationMs: number): string {
        const sessionId = generateId();
        this.currentSession = { id: sessionId, type, startTime: new Date(), plannedDurationMs };

        eventBus.emit('focus:started', {
            sessionId,
            duration: Math.round(plannedDurationMs / 60000),
            taskId: undefined
        });

        return sessionId;
    }

    endSession(completed: boolean): void {
        if (!this.currentSession) return;

        const durationMinutes = Math.round((Date.now() - this.currentSession.startTime.getTime()) / 60000);

        if (completed) {
            eventBus.emit('focus:completed', {
                sessionId: this.currentSession.id,
                actualDuration: durationMinutes,
                quality: this.flowState.flowScore
            });
        } else {
            eventBus.emit('focus:abandoned', {
                sessionId: this.currentSession.id,
                reason: 'user_ended'
            });
        }

        this.currentSession = null;
    }

    async detectFlowState(): Promise<FlowState> {
        const metrics = await this.getCurrentMetrics();

        // Flow state algorithm
        const focusDuration = metrics.continuousFocusMinutes;
        const distractionRate = metrics.distractionsPerHour;
        const contextSwitchRate = metrics.contextSwitchesPerHour;
        const activeAppScore = await this.getActiveAppProductivityScore();

        // Calculate flow score (0-100)
        let flowScore = 50;
        flowScore += Math.min(focusDuration / 2, 20);           // +20 for 40+ min focus
        flowScore -= distractionRate * 5;                        // -5 per distraction/hour
        flowScore -= contextSwitchRate * 2;                      // -2 per context switch/hour
        flowScore += (activeAppScore - 50) / 2;                  // +/- based on app

        flowScore = Math.max(0, Math.min(100, flowScore));

        const wasInFlow = this.flowState.inFlow;

        this.flowState = {
            inFlow: flowScore >= this.FLOW_THRESHOLD,
            flowScore,
            flowDuration: this.flowState.inFlow ? this.flowState.flowDuration + 1 : 0,
            distractions: metrics.recentDistractions,
            contextSwitches: metrics.recentContextSwitches
        };

        // Emit events for flow state changes
        if (!wasInFlow && this.flowState.inFlow) {
            eventBus.emit('flow:entered', {
                flowScore,
                timestamp: new Date()
            });
        } else if (wasInFlow && !this.flowState.inFlow) {
            eventBus.emit('flow:exited', {
                duration: this.flowState.flowDuration,
                reason: flowScore < this.FLOW_THRESHOLD ? 'score_drop' : 'manual'
            });
        }

        // Trigger distraction-free mode if in flow
        if (this.flowState.inFlow && this.flowState.flowDuration >= 5) {
            await this.enableDistractionFreeMode();
        }

        return this.flowState;
    }

    async getCurrentMetrics(): Promise<CurrentMetrics> {
        // Would integrate with activity tracking
        return {
            continuousFocusMinutes: 0,
            distractionsPerHour: 0,
            contextSwitchesPerHour: 0,
            recentDistractions: 0,
            recentContextSwitches: 0
        };
    }

    async getActiveAppProductivityScore(): Promise<number> {
        // Would check currently active app against productivity scores
        return 50; // Neutral default
    }

    async getAppProductivityScores(): Promise<Map<string, number>> {
        // Machine learning based scoring
        const appUsageData = await this.getAppUsageHistory();
        const scores = new Map<string, number>();

        for (const [app, usage] of appUsageData) {
            const correlationWithProductivity = await this.calculateProductivityCorrelation(app, usage);
            const categoryScore = this.getAppCategoryBaseScore(app);
            const personalizedScore = (correlationWithProductivity * 0.7) + (categoryScore * 0.3);
            scores.set(app, Math.round(personalizedScore));
        }

        return scores;
    }

    private async getAppUsageHistory(): Promise<Map<string, number>> {
        // Would fetch from database
        return new Map();
    }

    private async calculateProductivityCorrelation(app: string, usage: number): Promise<number> {
        void app;
        void usage;
        // Would use ML model to correlate app usage with productivity
        return 50;
    }

    private getAppCategoryBaseScore(app: string): number {
        // Base scores by app category
        const productivityApps = ['vscode', 'webstorm', 'terminal', 'notion', 'obsidian'];
        const distractionApps = ['discord', 'slack', 'twitter', 'reddit', 'youtube'];

        const appLower = app.toLowerCase();

        if (productivityApps.some(p => appLower.includes(p))) {
            return 80;
        }
        if (distractionApps.some(d => appLower.includes(d))) {
            return 20;
        }
        return 50;
    }

    generateDeepWorkHeatmap(): HeatmapData {
        // Returns hour-by-day deep work intensity
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

        // Would populate from database
        const data = Array(7).fill(null).map(() => Array(24).fill(0));

        return {
            data,
            labels: { days, hours }
        };
    }

    async getDeepWorkMetrics(): Promise<DeepWorkMetrics> {
        const appScores = await this.getAppProductivityScores();

        return {
            dailyDeepWorkMinutes: 0,
            deepWorkPercentage: 0,
            averageFlowDuration: 0,
            distractionFrequency: 0,
            contextSwitchFrequency: 0,
            peakFlowHours: [],
            appProductivityScores: appScores
        };
    }

    private async enableDistractionFreeMode(): Promise<void> {
        // Block notifications, mute apps, enable focus mode
        console.log('Enabling distraction-free mode...');

        eventBus.emit('system:notification', {
            type: 'info',
            message: 'Flow state detected - distraction-free mode enabled'
        });

        // Would integrate with OS notification blocking
        // await notificationService.blockAll();
        // await windowManager.hideDistractionApps();
        // await systemTray.showFlowIndicator();
    }

    recordDistraction(app: string | { app: string }): void {
        const appName = typeof app === 'string' ? app : app.app;
        this.flowState.distractions++;

        if (this.DISTRACTION_APPS.some(d => appName.toLowerCase().includes(d))) {
            // Significant distraction
            eventBus.emit('focus:abandoned', {
                sessionId: 'current',
                reason: `Distraction: ${appName}`
            });
        }
    }

    recordContextSwitch(): void {
        this.flowState.contextSwitches++;
    }
}

export const enhancedDeepWorkService = new EnhancedDeepWorkService();
export type { FlowState, DeepWorkMetrics, HeatmapData };
