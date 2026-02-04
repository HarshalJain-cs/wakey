// apps/desktop/src/renderer/services/integrations/make-integration.ts

import {
    BaseIntegration,
    SyncResult,
    IntegrationMetadata
} from './base-integration';

interface MakeScenario {
    id: string;
    name: string;
    webhookUrl: string;
    events: string[];
    enabled: boolean;
    lastRun?: string;
    runCount: number;
}

interface MakeWebhookPayload {
    event: string;
    timestamp: string;
    appName: string;
    data: Record<string, any>;
}

/**
 * Make.com (formerly Integromat) Integration
 * Connects Wakey to Make.com scenarios via webhooks
 */
export class MakeIntegration extends BaseIntegration {
    readonly id = 'make';
    readonly name = 'Make.com';
    readonly icon = '🔮';
    readonly category = 'automation' as const;
    readonly authType = 'webhook' as const;

    private scenarios: MakeScenario[] = [];
    private readonly STORAGE_KEY = 'wakey_make_scenarios';

    getMetadata(): IntegrationMetadata {
        return {
            ...super.getMetadata(),
            description: 'Connect to Make.com (Integromat) for powerful automation workflows',
            features: [
                'scenario-webhooks',
                'two-way-communication',
                'custom-triggers',
                'data-transformation',
                'multi-step-workflows'
            ],
            premium: false
        };
    }

    async connect(): Promise<void> {
        await this.loadScenarios();
        this.isConnected = this.scenarios.length > 0;
    }

    async disconnect(): Promise<void> {
        this.isConnected = false;
    }

    async sync(): Promise<SyncResult> {
        await this.loadScenarios();
        this.lastSyncAt = new Date();

        return {
            created: 0,
            updated: 0,
            deleted: 0,
            synced: this.scenarios.length,
            errors: []
        };
    }

    async addScenario(name: string, webhookUrl: string, events: string[]): Promise<MakeScenario> {
        // Validate webhook URL follows Make.com pattern
        if (!this.isValidMakeWebhook(webhookUrl)) {
            throw new Error('Invalid Make.com webhook URL');
        }

        const scenario: MakeScenario = {
            id: `make_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            name,
            webhookUrl,
            events,
            enabled: true,
            runCount: 0
        };

        this.scenarios.push(scenario);
        await this.saveScenarios();
        this.isConnected = true;

        return scenario;
    }

    async removeScenario(id: string): Promise<boolean> {
        const index = this.scenarios.findIndex(s => s.id === id);
        if (index === -1) return false;

        this.scenarios.splice(index, 1);
        await this.saveScenarios();

        if (this.scenarios.length === 0) {
            this.isConnected = false;
        }

        return true;
    }

    async toggleScenario(id: string): Promise<boolean> {
        const scenario = this.scenarios.find(s => s.id === id);
        if (!scenario) return false;

        scenario.enabled = !scenario.enabled;
        await this.saveScenarios();
        return scenario.enabled;
    }

    async triggerScenario(event: string, data: Record<string, any>): Promise<void> {
        const matchingScenarios = this.scenarios.filter(s =>
            s.enabled && s.events.includes(event)
        );

        const payload: MakeWebhookPayload = {
            event,
            timestamp: new Date().toISOString(),
            appName: 'Wakey',
            data
        };

        await Promise.allSettled(
            matchingScenarios.map(async scenario => {
                try {
                    const response = await fetch(scenario.webhookUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'User-Agent': 'Wakey/1.0'
                        },
                        body: JSON.stringify(payload)
                    });

                    if (response.ok) {
                        scenario.runCount++;
                        scenario.lastRun = new Date().toISOString();
                    }
                } catch (error) {
                    console.error(`Make.com scenario ${scenario.name} failed:`, error);
                }
            })
        );

        await this.saveScenarios();
    }

    getScenarios(): MakeScenario[] {
        return [...this.scenarios];
    }

    private isValidMakeWebhook(url: string): boolean {
        try {
            const parsed = new URL(url);
            // Make.com webhooks typically use hook.integromat.com or hook.us1.make.com etc
            return parsed.hostname.includes('make.com') ||
                parsed.hostname.includes('integromat.com') ||
                parsed.protocol === 'https:';
        } catch {
            return false;
        }
    }

    private async loadScenarios(): Promise<void> {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            try {
                this.scenarios = JSON.parse(stored);
            } catch {
                this.scenarios = [];
            }
        }
    }

    private async saveScenarios(): Promise<void> {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.scenarios));
    }

    /**
     * Get available events for Make.com integration
     */
    getAvailableEvents(): { id: string; name: string; description: string }[] {
        return [
            { id: 'focus.started', name: 'Focus Session Started', description: 'When a focus session begins' },
            { id: 'focus.completed', name: 'Focus Session Completed', description: 'When a focus session ends' },
            { id: 'focus.cancelled', name: 'Focus Session Cancelled', description: 'When a focus session is cancelled' },
            { id: 'break.started', name: 'Break Started', description: 'When a break begins' },
            { id: 'break.completed', name: 'Break Completed', description: 'When a break ends' },
            { id: 'task.created', name: 'Task Created', description: 'When a new task is created' },
            { id: 'task.completed', name: 'Task Completed', description: 'When a task is marked done' },
            { id: 'task.updated', name: 'Task Updated', description: 'When a task is modified' },
            { id: 'achievement.unlocked', name: 'Achievement Unlocked', description: 'When an achievement is earned' },
            { id: 'streak.milestone', name: 'Streak Milestone', description: 'When a streak milestone is reached' },
            { id: 'day.summary', name: 'Daily Summary', description: 'End of day productivity summary' },
            { id: 'distraction.detected', name: 'Distraction Detected', description: 'When a distraction is detected during focus' }
        ];
    }
}

export const makeIntegration = new MakeIntegration();
