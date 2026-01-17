/**
 * @fileoverview API Access Service
 * 
 * REST API for external applications and integrations:
 * - Authentication
 * - Data access endpoints
 * - Webhooks
 * - Rate limiting
 */

export interface APIKey {
    id: string;
    name: string;
    key: string;
    permissions: APIPermission[];
    createdAt: Date;
    lastUsed: Date | null;
    enabled: boolean;
    rateLimit: number; // requests per minute
}

export type APIPermission =
    | 'read:stats'
    | 'read:goals'
    | 'write:goals'
    | 'read:tasks'
    | 'write:tasks'
    | 'read:sessions'
    | 'trigger:focus'
    | 'trigger:break'
    | 'webhooks';

export interface Webhook {
    id: string;
    name: string;
    url: string;
    events: WebhookEvent[];
    secret: string;
    enabled: boolean;
    createdAt: Date;
    lastTriggered: Date | null;
    failureCount: number;
}

export type WebhookEvent =
    | 'focus.started'
    | 'focus.ended'
    | 'break.started'
    | 'task.completed'
    | 'goal.achieved'
    | 'daily.summary';

export interface APIRequest {
    id: string;
    apiKeyId: string;
    endpoint: string;
    method: string;
    timestamp: Date;
    responseStatus: number;
    responseTime: number;
}

// API endpoints documentation
export interface APIEndpoint {
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    description: string;
    requiredPermissions: APIPermission[];
    parameters?: { name: string; type: string; required: boolean; description: string }[];
    responseExample?: unknown;
}

const API_ENDPOINTS: APIEndpoint[] = [
    {
        path: '/api/v1/stats/today',
        method: 'GET',
        description: 'Get today\'s productivity statistics',
        requiredPermissions: ['read:stats'],
        responseExample: {
            focusMinutes: 240,
            distractionMinutes: 30,
            focusScore: 89,
            deepWorkSessions: 3,
            tasksCompleted: 5,
        },
    },
    {
        path: '/api/v1/stats/week',
        method: 'GET',
        description: 'Get this week\'s productivity statistics',
        requiredPermissions: ['read:stats'],
    },
    {
        path: '/api/v1/goals',
        method: 'GET',
        description: 'List all goals',
        requiredPermissions: ['read:goals'],
    },
    {
        path: '/api/v1/goals/:id/progress',
        method: 'PUT',
        description: 'Update goal progress',
        requiredPermissions: ['write:goals'],
        parameters: [
            { name: 'id', type: 'string', required: true, description: 'Goal ID' },
            { name: 'progress', type: 'number', required: true, description: 'New progress value' },
        ],
    },
    {
        path: '/api/v1/tasks',
        method: 'GET',
        description: 'List all tasks',
        requiredPermissions: ['read:tasks'],
    },
    {
        path: '/api/v1/tasks',
        method: 'POST',
        description: 'Create a new task',
        requiredPermissions: ['write:tasks'],
        parameters: [
            { name: 'title', type: 'string', required: true, description: 'Task title' },
            { name: 'priority', type: 'string', required: false, description: 'Task priority' },
        ],
    },
    {
        path: '/api/v1/sessions/current',
        method: 'GET',
        description: 'Get current focus session',
        requiredPermissions: ['read:sessions'],
    },
    {
        path: '/api/v1/focus/start',
        method: 'POST',
        description: 'Start a focus session',
        requiredPermissions: ['trigger:focus'],
        parameters: [
            { name: 'duration', type: 'number', required: false, description: 'Session duration in minutes' },
        ],
    },
    {
        path: '/api/v1/break/start',
        method: 'POST',
        description: 'Start a break',
        requiredPermissions: ['trigger:break'],
    },
];

class APIAccessService {
    private apiKeys: APIKey[] = [];
    private webhooks: Webhook[] = [];
    private requestLog: APIRequest[] = [];

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem('wakey_api');
            if (stored) {
                const data = JSON.parse(stored);
                this.apiKeys = data.apiKeys || [];
                this.webhooks = data.webhooks || [];
                this.requestLog = data.requestLog || [];
            }
        } catch (error) {
            console.error('Failed to load API config:', error);
        }
    }

    private saveToStorage(): void {
        localStorage.setItem('wakey_api', JSON.stringify({
            apiKeys: this.apiKeys,
            webhooks: this.webhooks,
            requestLog: this.requestLog.slice(-1000), // Keep last 1000 requests
        }));
    }

    private generateKey(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let key = 'wk_';
        for (let i = 0; i < 32; i++) {
            key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return key;
    }

    /**
     * Create a new API key
     */
    createAPIKey(name: string, permissions: APIPermission[]): APIKey {
        const apiKey: APIKey = {
            id: `key_${Date.now()}`,
            name,
            key: this.generateKey(),
            permissions,
            createdAt: new Date(),
            lastUsed: null,
            enabled: true,
            rateLimit: 60,
        };

        this.apiKeys.push(apiKey);
        this.saveToStorage();
        return apiKey;
    }

    /**
     * Get all API keys
     */
    getAPIKeys(): APIKey[] {
        return this.apiKeys.map(k => ({
            ...k,
            key: k.key.slice(0, 8) + '...' + k.key.slice(-4), // Mask key
        }));
    }

    /**
     * Revoke API key
     */
    revokeAPIKey(keyId: string): void {
        const key = this.apiKeys.find(k => k.id === keyId);
        if (key) {
            key.enabled = false;
            this.saveToStorage();
        }
    }

    /**
     * Delete API key
     */
    deleteAPIKey(keyId: string): void {
        this.apiKeys = this.apiKeys.filter(k => k.id !== keyId);
        this.saveToStorage();
    }

    /**
     * Validate API key
     */
    validateKey(key: string): APIKey | null {
        const apiKey = this.apiKeys.find(k => k.key === key && k.enabled);
        if (apiKey) {
            apiKey.lastUsed = new Date();
            this.saveToStorage();
            return apiKey;
        }
        return null;
    }

    /**
     * Check permission
     */
    hasPermission(key: string, permission: APIPermission): boolean {
        const apiKey = this.validateKey(key);
        return apiKey?.permissions.includes(permission) || false;
    }

    /**
     * Create webhook
     */
    createWebhook(name: string, url: string, events: WebhookEvent[]): Webhook {
        const webhook: Webhook = {
            id: `wh_${Date.now()}`,
            name,
            url,
            events,
            secret: this.generateKey(),
            enabled: true,
            createdAt: new Date(),
            lastTriggered: null,
            failureCount: 0,
        };

        this.webhooks.push(webhook);
        this.saveToStorage();
        return webhook;
    }

    /**
     * Get all webhooks
     */
    getWebhooks(): Webhook[] {
        return this.webhooks;
    }

    /**
     * Delete webhook
     */
    deleteWebhook(webhookId: string): void {
        this.webhooks = this.webhooks.filter(w => w.id !== webhookId);
        this.saveToStorage();
    }

    /**
     * Toggle webhook
     */
    toggleWebhook(webhookId: string, enabled: boolean): void {
        const webhook = this.webhooks.find(w => w.id === webhookId);
        if (webhook) {
            webhook.enabled = enabled;
            this.saveToStorage();
        }
    }

    /**
     * Trigger webhooks for an event
     */
    async triggerWebhooks(event: WebhookEvent, _data: unknown): Promise<void> {
        const activeWebhooks = this.webhooks.filter(
            w => w.enabled && w.events.includes(event)
        );

        for (const webhook of activeWebhooks) {
            try {
                // In production, would actually send HTTP request
                console.log(`[Webhook] Triggering ${webhook.name} for ${event}`);

                webhook.lastTriggered = new Date();
                webhook.failureCount = 0;
            } catch (error) {
                console.error(`Webhook ${webhook.name} failed:`, error);
                webhook.failureCount++;

                // Disable after 5 consecutive failures
                if (webhook.failureCount >= 5) {
                    webhook.enabled = false;
                }
            }
        }

        this.saveToStorage();
    }

    /**
     * Log API request
     */
    logRequest(apiKeyId: string, endpoint: string, method: string, status: number, responseTime: number): void {
        this.requestLog.push({
            id: `req_${Date.now()}`,
            apiKeyId,
            endpoint,
            method,
            timestamp: new Date(),
            responseStatus: status,
            responseTime,
        });

        this.saveToStorage();
    }

    /**
     * Get request log
     */
    getRequestLog(limit: number = 100): APIRequest[] {
        return this.requestLog.slice(-limit).reverse();
    }

    /**
     * Get API endpoints documentation
     */
    getEndpoints(): APIEndpoint[] {
        return API_ENDPOINTS;
    }

    /**
     * Get all available permissions
     */
    getAvailablePermissions(): APIPermission[] {
        return [
            'read:stats', 'read:goals', 'write:goals',
            'read:tasks', 'write:tasks', 'read:sessions',
            'trigger:focus', 'trigger:break', 'webhooks',
        ];
    }

    /**
     * Get available webhook events
     */
    getAvailableEvents(): WebhookEvent[] {
        return [
            'focus.started', 'focus.ended', 'break.started',
            'task.completed', 'goal.achieved', 'daily.summary',
        ];
    }

    /**
     * Get API usage stats
     */
    getUsageStats(): {
        totalRequests: number;
        todayRequests: number;
        averageResponseTime: number;
        errorRate: number;
    } {
        const today = new Date().toISOString().split('T')[0];
        const todayRequests = this.requestLog.filter(
            r => r.timestamp.toString().startsWith(today)
        );

        const errorRequests = this.requestLog.filter(r => r.responseStatus >= 400);

        return {
            totalRequests: this.requestLog.length,
            todayRequests: todayRequests.length,
            averageResponseTime: this.requestLog.length > 0
                ? this.requestLog.reduce((sum, r) => sum + r.responseTime, 0) / this.requestLog.length
                : 0,
            errorRate: this.requestLog.length > 0
                ? (errorRequests.length / this.requestLog.length) * 100
                : 0,
        };
    }
}

export const apiAccessService = new APIAccessService();
export default apiAccessService;
