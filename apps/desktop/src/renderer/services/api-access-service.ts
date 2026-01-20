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
    private rateLimitMap: Map<string, { count: number; resetTime: number }> = new Map();

    constructor() {
        this.loadFromStorage();
    }

    private async loadFromStorage(): Promise<void> {
        try {
            const stored = localStorage.getItem('wakey_api_metadata');
            if (stored) {
                const data = JSON.parse(stored);
                this.webhooks = data.webhooks || [];
                this.requestLog = data.requestLog || [];

                // Load API keys securely
                const secureKeys = await window.wakey.getSecureApiKeys();
                this.apiKeys = data.apiKeys?.map((key: any) => ({
                    ...key,
                    key: secureKeys[key.id] || key.key, // Fallback to stored key if secure load fails
                })) || [];
            }
        } catch (error) {
            console.error('Failed to load API config:', error);
        }
    }

    private async saveToStorage(): Promise<void> {
        // Save API keys securely
        for (const apiKey of this.apiKeys) {
            await window.wakey.setSecureApiKey(apiKey.id, apiKey.key);
        }

        // Save metadata (without actual keys)
        const metadataKeys = this.apiKeys.map(k => ({
            id: k.id,
            name: k.name,
            permissions: k.permissions,
            createdAt: k.createdAt,
            lastUsed: k.lastUsed,
            enabled: k.enabled,
            rateLimit: k.rateLimit,
        }));

        localStorage.setItem('wakey_api_metadata', JSON.stringify({
            apiKeys: metadataKeys,
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

    private validateInput(input: string, fieldName: string, maxLength: number = 100): void {
        if (!input || typeof input !== 'string') {
            throw new Error(`${fieldName} is required and must be a string`);
        }
        if (input.length > maxLength) {
            throw new Error(`${fieldName} must be less than ${maxLength} characters`);
        }
        // Basic XSS prevention
        if (/<script|javascript:|data:/i.test(input)) {
            throw new Error(`${fieldName} contains potentially malicious content`);
        }
    }

    private checkRateLimit(apiKey: APIKey): boolean {
        const now = Date.now();
        const key = apiKey.id;
        const limit = apiKey.rateLimit;
        const windowMs = 60000; // 1 minute

        const current = this.rateLimitMap.get(key);
        if (!current || now > current.resetTime) {
            // Reset window
            this.rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
            return true;
        }

        if (current.count >= limit) {
            return false; // Rate limit exceeded
        }

        current.count++;
        return true;
    }

    /**
     * Create a new API key
     */
    async createAPIKey(name: string, permissions: APIPermission[]): Promise<APIKey> {
        this.validateInput(name, 'API key name', 50);

        if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
            throw new Error('At least one permission is required');
        }

        // Validate permissions
        const validPermissions: APIPermission[] = [
            'read:stats', 'read:goals', 'write:goals', 'read:tasks',
            'write:tasks', 'read:sessions', 'trigger:focus', 'trigger:break',
            'webhooks'
        ];
        for (const perm of permissions) {
            if (!validPermissions.includes(perm)) {
                throw new Error(`Invalid permission: ${perm}`);
            }
        }

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
        await this.saveToStorage();
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
    async revokeAPIKey(keyId: string): Promise<void> {
        const key = this.apiKeys.find(k => k.id === keyId);
        if (key) {
            key.enabled = false;
            await this.saveToStorage();
        }
    }

    /**
     * Delete API key
     */
    async deleteAPIKey(keyId: string): Promise<void> {
        this.apiKeys = this.apiKeys.filter(k => k.id !== keyId);
        await window.wakey.deleteSecureApiKey(keyId);
        await this.saveToStorage();
    }

    /**
     * Validate API key
     */
    async validateKey(key: string): Promise<APIKey | null> {
        if (!key || typeof key !== 'string' || key.length < 10) {
            return null; // Basic validation
        }

        const apiKey = this.apiKeys.find(k => k.key === key && k.enabled);
        if (apiKey) {
            // Check rate limit
            if (!this.checkRateLimit(apiKey)) {
                throw new Error('Rate limit exceeded');
            }

            apiKey.lastUsed = new Date();
            await this.saveToStorage();
            return apiKey;
        }
        return null;
    }

    /**
     * Check permission
     */
    async hasPermission(key: string, permission: APIPermission): Promise<boolean> {
        const apiKey = await this.validateKey(key);
        return apiKey?.permissions.includes(permission) || false;
    }

    /**
     * Create webhook
     */
    async createWebhook(name: string, url: string, events: WebhookEvent[]): Promise<Webhook> {
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
        await this.saveToStorage();
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
    async deleteWebhook(webhookId: string): Promise<void> {
        this.webhooks = this.webhooks.filter(w => w.id !== webhookId);
        await this.saveToStorage();
    }

    /**
     * Toggle webhook
     */
    async toggleWebhook(webhookId: string, enabled: boolean): Promise<void> {
        const webhook = this.webhooks.find(w => w.id === webhookId);
        if (webhook) {
            webhook.enabled = enabled;
            await this.saveToStorage();
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

        await this.saveToStorage();
    }

    /**
     * Log API request
     */
    async logRequest(apiKeyId: string, endpoint: string, method: string, status: number, responseTime: number): Promise<void> {
        this.requestLog.push({
            id: `req_${Date.now()}`,
            apiKeyId,
            endpoint,
            method,
            timestamp: new Date(),
            responseStatus: status,
            responseTime,
        });

        await this.saveToStorage();
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
