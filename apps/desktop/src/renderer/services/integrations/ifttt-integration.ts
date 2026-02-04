// apps/desktop/src/renderer/services/integrations/ifttt-integration.ts

import {
    BaseIntegration,
    SyncResult,
    IntegrationMetadata
} from './base-integration';

interface IFTTTWebhook {
    id: string;
    eventName: string;
    webhookKey: string;
    events: string[];
    enabled: boolean;
    createdAt: string;
    lastTriggered?: string;
}

interface IFTTTPayload {
    value1: string;
    value2: string;
    value3: string;
}

/**
 * IFTTT (If This Then That) Integration
 * Uses IFTTT Webhooks to connect to thousands of services
 */
export class IFTTTIntegration extends BaseIntegration {
    readonly id = 'ifttt';
    readonly name = 'IFTTT';
    readonly icon = '🔗';
    readonly category = 'automation' as const;
    readonly authType = 'webhook' as const;

    private webhooks: IFTTTWebhook[] = [];
    private globalKey: string = '';
    private readonly STORAGE_KEY = 'wakey_ifttt_webhooks';
    private readonly KEY_STORAGE = 'wakey_ifttt_key';

    getMetadata(): IntegrationMetadata {
        return {
            ...super.getMetadata(),
            description: 'Connect to IFTTT for simple "If This Then That" automations',
            features: [
                'webhook-triggers',
                'simple-automations',
                'phone-notifications',
                'smart-home-control',
                'cross-platform'
            ],
            premium: false
        };
    }

    async connect(): Promise<void> {
        await this.loadConfig();
        this.isConnected = !!this.globalKey;
    }

    async disconnect(): Promise<void> {
        this.globalKey = '';
        this.webhooks = [];
        localStorage.removeItem(this.KEY_STORAGE);
        localStorage.removeItem(this.STORAGE_KEY);
        this.isConnected = false;
    }

    async sync(): Promise<SyncResult> {
        await this.loadConfig();
        this.lastSyncAt = new Date();

        return {
            created: 0,
            updated: 0,
            deleted: 0,
            synced: this.webhooks.length,
            errors: []
        };
    }

    // ============================================
    // Configuration
    // ============================================

    setWebhookKey(key: string): void {
        this.globalKey = key;
        localStorage.setItem(this.KEY_STORAGE, key);
        this.isConnected = true;
    }

    getWebhookKey(): string {
        return this.globalKey;
    }

    // ============================================
    // Event Management
    // ============================================

    addEvent(eventName: string, wakeyEvents: string[]): IFTTTWebhook {
        const webhook: IFTTTWebhook = {
            id: `ifttt_${Date.now()}`,
            eventName,
            webhookKey: this.globalKey,
            events: wakeyEvents,
            enabled: true,
            createdAt: new Date().toISOString()
        };

        this.webhooks.push(webhook);
        this.saveWebhooks();
        return webhook;
    }

    removeEvent(id: string): boolean {
        const index = this.webhooks.findIndex(w => w.id === id);
        if (index === -1) return false;

        this.webhooks.splice(index, 1);
        this.saveWebhooks();
        return true;
    }

    toggleEvent(id: string): boolean {
        const webhook = this.webhooks.find(w => w.id === id);
        if (!webhook) return false;

        webhook.enabled = !webhook.enabled;
        this.saveWebhooks();
        return webhook.enabled;
    }

    getEvents(): IFTTTWebhook[] {
        return [...this.webhooks];
    }

    // ============================================
    // Trigger Methods
    // ============================================

    async trigger(wakeyEvent: string, value1: string, value2?: string, value3?: string): Promise<void> {
        if (!this.globalKey) return;

        const matchingWebhooks = this.webhooks.filter(w =>
            w.enabled && w.events.includes(wakeyEvent)
        );

        await Promise.allSettled(
            matchingWebhooks.map(async webhook => {
                try {
                    const url = `https://maker.ifttt.com/trigger/${webhook.eventName}/with/key/${this.globalKey}`;

                    const payload: IFTTTPayload = {
                        value1,
                        value2: value2 || '',
                        value3: value3 || ''
                    };

                    await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    webhook.lastTriggered = new Date().toISOString();
                } catch (error) {
                    console.error(`IFTTT trigger ${webhook.eventName} failed:`, error);
                }
            })
        );

        this.saveWebhooks();
    }

    // Convenience methods for common events
    async onFocusStarted(durationMinutes: number, taskName?: string): Promise<void> {
        await this.trigger(
            'focus.started',
            `Focus session started: ${durationMinutes} minutes`,
            taskName || 'No task specified',
            new Date().toLocaleTimeString()
        );
    }

    async onFocusCompleted(actualMinutes: number, qualityScore: number): Promise<void> {
        await this.trigger(
            'focus.completed',
            `Completed ${actualMinutes} minute focus session`,
            `Quality Score: ${qualityScore}%`,
            new Date().toLocaleTimeString()
        );
    }

    async onAchievementUnlocked(name: string, description: string, points: number): Promise<void> {
        await this.trigger(
            'achievement.unlocked',
            `🏆 ${name}`,
            description,
            `+${points} points`
        );
    }

    async onStreakMilestone(streakType: string, days: number): Promise<void> {
        await this.trigger(
            'streak.milestone',
            `🔥 ${days}-day ${streakType} streak!`,
            `Keep up the great work!`,
            new Date().toLocaleDateString()
        );
    }

    async onDailySummary(focusMinutes: number, tasksCompleted: number, productivityScore: number): Promise<void> {
        await this.trigger(
            'daily.summary',
            `Daily Summary: ${focusMinutes} min focused, ${tasksCompleted} tasks done`,
            `Productivity Score: ${productivityScore}%`,
            new Date().toLocaleDateString()
        );
    }

    // ============================================
    // Internal Methods
    // ============================================

    private async loadConfig(): Promise<void> {
        this.globalKey = localStorage.getItem(this.KEY_STORAGE) || '';

        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            try {
                this.webhooks = JSON.parse(stored);
            } catch {
                this.webhooks = [];
            }
        }
    }

    private saveWebhooks(): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.webhooks));
    }

    // ============================================
    // Available Wakey Events
    // ============================================

    getAvailableWakeyEvents(): { id: string; name: string; description: string }[] {
        return [
            { id: 'focus.started', name: 'Focus Started', description: 'When a focus session begins' },
            { id: 'focus.completed', name: 'Focus Completed', description: 'When a focus session ends successfully' },
            { id: 'focus.cancelled', name: 'Focus Cancelled', description: 'When a focus session is cancelled' },
            { id: 'break.started', name: 'Break Started', description: 'When a break begins' },
            { id: 'break.completed', name: 'Break Completed', description: 'When a break ends' },
            { id: 'task.completed', name: 'Task Completed', description: 'When a task is marked done' },
            { id: 'achievement.unlocked', name: 'Achievement Unlocked', description: 'When an achievement is earned' },
            { id: 'streak.milestone', name: 'Streak Milestone', description: 'When a streak milestone is reached' },
            { id: 'daily.summary', name: 'Daily Summary', description: 'End of day productivity summary' }
        ];
    }

    /**
     * Generate setup instructions for IFTTT
     */
    getSetupInstructions(): string[] {
        return [
            '1. Go to ifttt.com and log in or create an account',
            '2. Search for "Webhooks" in the IFTTT app',
            '3. Click "Settings" to find your Webhook Key',
            '4. Enter your Webhook Key above',
            '5. Create new applets using "Webhooks" as the trigger',
            '6. Use your custom event names in Wakey',
            '7. Map Wakey events to your IFTTT applets'
        ];
    }
}

export const iftttIntegration = new IFTTTIntegration();
