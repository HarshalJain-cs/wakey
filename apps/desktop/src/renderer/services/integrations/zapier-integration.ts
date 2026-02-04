// apps/desktop/src/renderer/services/integrations/zapier-integration.ts

import {
    BaseIntegration,
    SyncResult,
    IntegrationMetadata
} from './base-integration';

interface WebhookConfig {
    id: string;
    name: string;
    url: string;
    events: WebhookEventType[];
    enabled: boolean;
    createdAt: string;
    lastTriggered?: string;
    triggerCount: number;
}

type WebhookEventType =
    | 'focus_session_started'
    | 'focus_session_completed'
    | 'focus_session_cancelled'
    | 'break_started'
    | 'break_completed'
    | 'task_created'
    | 'task_completed'
    | 'task_deleted'
    | 'achievement_unlocked'
    | 'streak_milestone'
    | 'daily_summary'
    | 'distraction_detected'
    | 'goal_achieved';

interface WebhookPayload {
    event: WebhookEventType;
    timestamp: string;
    user?: {
        id: string;
        name: string;
    };
    data: Record<string, any>;
}

interface WebhookResponse {
    success: boolean;
    statusCode?: number;
    error?: string;
}

export class ZapierIntegration extends BaseIntegration {
    readonly id = 'zapier';
    readonly name = 'Zapier / Webhooks';
    readonly icon = '⚡';
    readonly category = 'automation' as const;
    readonly authType = 'webhook' as const;

    private webhooks: WebhookConfig[] = [];
    private readonly STORAGE_KEY = 'wakey_webhooks';

    getMetadata(): IntegrationMetadata {
        return {
            ...super.getMetadata(),
            description: 'Connect Wakey to 5,000+ apps via Zapier, Make, or custom webhooks',
            features: [
                'custom-webhooks',
                'zapier-triggers',
                'make-integration',
                'ifttt-support',
                'event-filtering',
                'retry-logic',
                'webhook-logs'
            ],
            premium: false
        };
    }

    async connect(): Promise<void> {
        await this.loadWebhooks();
        this.isConnected = this.webhooks.length > 0;
    }

    async disconnect(): Promise<void> {
        // Don't clear webhooks, just mark as disconnected
        this.isConnected = false;
    }

    async sync(): Promise<SyncResult> {
        await this.loadWebhooks();
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
    // Webhook Management
    // ============================================

    async addWebhook(name: string, url: string, events: WebhookEventType[]): Promise<WebhookConfig> {
        const webhook: WebhookConfig = {
            id: this.generateId(),
            name,
            url,
            events,
            enabled: true,
            createdAt: new Date().toISOString(),
            triggerCount: 0
        };

        // Validate webhook URL
        if (!this.isValidWebhookUrl(url)) {
            throw new Error('Invalid webhook URL');
        }

        // Test webhook
        const testResult = await this.testWebhook(url);
        if (!testResult.success) {
            throw new Error(`Webhook test failed: ${testResult.error}`);
        }

        this.webhooks.push(webhook);
        await this.saveWebhooks();
        this.isConnected = true;

        return webhook;
    }

    async updateWebhook(id: string, updates: Partial<WebhookConfig>): Promise<WebhookConfig | null> {
        const index = this.webhooks.findIndex(w => w.id === id);
        if (index === -1) return null;

        this.webhooks[index] = { ...this.webhooks[index], ...updates };
        await this.saveWebhooks();

        return this.webhooks[index];
    }

    async removeWebhook(id: string): Promise<boolean> {
        const index = this.webhooks.findIndex(w => w.id === id);
        if (index === -1) return false;

        this.webhooks.splice(index, 1);
        await this.saveWebhooks();

        if (this.webhooks.length === 0) {
            this.isConnected = false;
        }

        return true;
    }

    getWebhooks(): WebhookConfig[] {
        return [...this.webhooks];
    }

    // ============================================
    // Event Triggering
    // ============================================

    async triggerEvent(event: WebhookEventType, data: Record<string, any>): Promise<void> {
        const payload: WebhookPayload = {
            event,
            timestamp: new Date().toISOString(),
            data
        };

        // Get user info if available
        const userId = localStorage.getItem('wakey_user_id');
        const userName = localStorage.getItem('wakey_user_name');
        if (userId && userName) {
            payload.user = { id: userId, name: userName };
        }

        // Find all webhooks that should receive this event
        const matchingWebhooks = this.webhooks.filter(w =>
            w.enabled && w.events.includes(event)
        );

        // Send to all matching webhooks in parallel
        const results = await Promise.allSettled(
            matchingWebhooks.map(webhook => this.sendWebhook(webhook, payload))
        );

        // Update trigger counts and timestamps
        for (let i = 0; i < matchingWebhooks.length; i++) {
            const webhook = matchingWebhooks[i];
            const result = results[i];

            webhook.lastTriggered = new Date().toISOString();
            if (result.status === 'fulfilled') {
                webhook.triggerCount++;
            }
        }

        await this.saveWebhooks();
    }

    // ============================================
    // Convenience Methods for Common Events
    // ============================================

    async onFocusSessionStarted(durationMinutes: number, taskName?: string): Promise<void> {
        await this.triggerEvent('focus_session_started', {
            duration_minutes: durationMinutes,
            task_name: taskName,
            started_at: new Date().toISOString()
        });
    }

    async onFocusSessionCompleted(durationMinutes: number, actualMinutes: number, qualityScore: number): Promise<void> {
        await this.triggerEvent('focus_session_completed', {
            planned_duration: durationMinutes,
            actual_duration: actualMinutes,
            quality_score: qualityScore,
            completed_at: new Date().toISOString()
        });
    }

    async onTaskCreated(taskId: string, title: string, priority: string): Promise<void> {
        await this.triggerEvent('task_created', {
            task_id: taskId,
            title,
            priority,
            created_at: new Date().toISOString()
        });
    }

    async onTaskCompleted(taskId: string, title: string, timeSpentMinutes?: number): Promise<void> {
        await this.triggerEvent('task_completed', {
            task_id: taskId,
            title,
            time_spent_minutes: timeSpentMinutes,
            completed_at: new Date().toISOString()
        });
    }

    async onAchievementUnlocked(achievementId: string, name: string, points: number): Promise<void> {
        await this.triggerEvent('achievement_unlocked', {
            achievement_id: achievementId,
            name,
            points,
            unlocked_at: new Date().toISOString()
        });
    }

    async onStreakMilestone(streakType: string, days: number): Promise<void> {
        await this.triggerEvent('streak_milestone', {
            streak_type: streakType,
            days,
            achieved_at: new Date().toISOString()
        });
    }

    async onDailySummary(summary: {
        focusMinutes: number;
        sessionsCompleted: number;
        tasksCompleted: number;
        distractions: number;
        productivityScore: number;
    }): Promise<void> {
        await this.triggerEvent('daily_summary', {
            ...summary,
            date: new Date().toISOString().split('T')[0]
        });
    }

    // ============================================
    // Internal Methods
    // ============================================

    private async sendWebhook(webhook: WebhookConfig, payload: WebhookPayload): Promise<WebhookResponse> {
        try {
            const response = await fetch(webhook.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Wakey/1.0',
                    'X-Wakey-Event': payload.event,
                    'X-Wakey-Timestamp': payload.timestamp
                },
                body: JSON.stringify(payload)
            });

            return {
                success: response.ok,
                statusCode: response.status,
                error: response.ok ? undefined : `HTTP ${response.status}`
            };
        } catch (error) {
            return {
                success: false,
                error: String(error)
            };
        }
    }

    private async testWebhook(url: string): Promise<WebhookResponse> {
        const testPayload: WebhookPayload = {
            event: 'focus_session_started',
            timestamp: new Date().toISOString(),
            data: {
                test: true,
                message: 'This is a test webhook from Wakey'
            }
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Wakey/1.0',
                    'X-Wakey-Test': 'true'
                },
                body: JSON.stringify(testPayload)
            });

            // Accept 2xx, 3xx, and common webhook service responses
            const isSuccess = response.ok || response.status === 301 || response.status === 302;

            return {
                success: isSuccess,
                statusCode: response.status
            };
        } catch (error) {
            return {
                success: false,
                error: String(error)
            };
        }
    }

    private isValidWebhookUrl(url: string): boolean {
        try {
            const parsed = new URL(url);
            return parsed.protocol === 'https:' || parsed.protocol === 'http:';
        } catch {
            return false;
        }
    }

    private async loadWebhooks(): Promise<void> {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            try {
                this.webhooks = JSON.parse(stored);
            } catch {
                this.webhooks = [];
            }
        }
    }

    private async saveWebhooks(): Promise<void> {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.webhooks));
    }

    private generateId(): string {
        return `webhook_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    // ============================================
    // Zapier-Specific Methods
    // ============================================

    /**
     * Generate a sample payload for Zapier webhook testing
     */
    getSamplePayload(event: WebhookEventType): WebhookPayload {
        const samples: Record<WebhookEventType, Record<string, any>> = {
            focus_session_started: {
                duration_minutes: 25,
                task_name: 'Complete project report',
                started_at: new Date().toISOString()
            },
            focus_session_completed: {
                planned_duration: 25,
                actual_duration: 27,
                quality_score: 85,
                completed_at: new Date().toISOString()
            },
            focus_session_cancelled: {
                planned_duration: 25,
                actual_duration: 12,
                reason: 'Manual cancellation',
                cancelled_at: new Date().toISOString()
            },
            break_started: {
                duration_minutes: 5,
                break_type: 'short',
                started_at: new Date().toISOString()
            },
            break_completed: {
                duration_minutes: 5,
                completed_at: new Date().toISOString()
            },
            task_created: {
                task_id: 'task_12345',
                title: 'Review Q4 metrics',
                priority: 'high',
                created_at: new Date().toISOString()
            },
            task_completed: {
                task_id: 'task_12345',
                title: 'Review Q4 metrics',
                time_spent_minutes: 45,
                completed_at: new Date().toISOString()
            },
            task_deleted: {
                task_id: 'task_12345',
                title: 'Review Q4 metrics',
                deleted_at: new Date().toISOString()
            },
            achievement_unlocked: {
                achievement_id: 'focus_master',
                name: 'Focus Master',
                description: 'Complete 100 focus sessions',
                points: 500,
                unlocked_at: new Date().toISOString()
            },
            streak_milestone: {
                streak_type: 'daily_focus',
                days: 30,
                achieved_at: new Date().toISOString()
            },
            daily_summary: {
                focus_minutes: 180,
                sessions_completed: 7,
                tasks_completed: 12,
                distractions: 3,
                productivity_score: 88,
                date: new Date().toISOString().split('T')[0]
            },
            distraction_detected: {
                app_name: 'Twitter',
                duration_seconds: 45,
                detected_at: new Date().toISOString()
            },
            goal_achieved: {
                goal_id: 'goal_456',
                goal_name: 'Read 20 books this year',
                target_value: 20,
                current_value: 20,
                achieved_at: new Date().toISOString()
            }
        };

        return {
            event,
            timestamp: new Date().toISOString(),
            user: { id: 'user_sample', name: 'Sample User' },
            data: samples[event]
        };
    }

    /**
     * Get list of all available webhook events
     */
    getAvailableEvents(): { event: WebhookEventType; description: string }[] {
        return [
            { event: 'focus_session_started', description: 'Triggered when a focus session begins' },
            { event: 'focus_session_completed', description: 'Triggered when a focus session is completed' },
            { event: 'focus_session_cancelled', description: 'Triggered when a focus session is cancelled' },
            { event: 'break_started', description: 'Triggered when a break begins' },
            { event: 'break_completed', description: 'Triggered when a break ends' },
            { event: 'task_created', description: 'Triggered when a new task is created' },
            { event: 'task_completed', description: 'Triggered when a task is marked as done' },
            { event: 'task_deleted', description: 'Triggered when a task is deleted' },
            { event: 'achievement_unlocked', description: 'Triggered when an achievement is earned' },
            { event: 'streak_milestone', description: 'Triggered when a streak milestone is reached' },
            { event: 'daily_summary', description: 'Triggered at end of day with summary stats' },
            { event: 'distraction_detected', description: 'Triggered when a distraction is detected' },
            { event: 'goal_achieved', description: 'Triggered when a goal is completed' }
        ];
    }
}

export const zapierIntegration = new ZapierIntegration();
