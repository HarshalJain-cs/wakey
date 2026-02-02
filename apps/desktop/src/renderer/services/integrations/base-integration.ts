// apps/desktop/src/renderer/services/integrations/base-integration.ts

export interface IntegrationConfig {
    clientId: string;
    clientSecret?: string;
    redirectUri: string;
    scope: string;
    authUrl: string;
    tokenUrl: string;
}

export interface SyncResult {
    created: number;
    updated: number;
    deleted: number;
    synced: number;
    errors?: string[];
}

export interface OAuthTokens {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
    tokenType: string;
}

export type IntegrationCategory =
    | 'productivity'
    | 'communication'
    | 'calendar'
    | 'development'
    | 'health'
    | 'notes'
    | 'automation'
    | 'ai'
    | 'entertainment'
    | 'storage'
    | 'email'
    | 'crm'
    | 'time-tracking'
    | 'design'
    | 'analytics';

export interface IntegrationMetadata {
    id: string;
    name: string;
    icon: string;
    category: IntegrationCategory;
    authType: 'oauth2' | 'api_key' | 'webhook' | 'url_scheme';
    description: string;
    features: string[];
    premium: boolean;
}

export abstract class BaseIntegration {
    abstract readonly id: string;
    abstract readonly name: string;
    abstract readonly icon: string;
    abstract readonly category: IntegrationCategory;
    abstract readonly authType: 'oauth2' | 'api_key' | 'webhook' | 'url_scheme';

    protected accessToken?: string;
    protected refreshToken?: string;
    protected tokenExpiresAt?: Date;
    protected isConnected: boolean = false;
    protected lastSyncAt?: Date;
    protected pollingInterval?: NodeJS.Timeout;

    abstract connect(): Promise<void>;
    abstract disconnect(): Promise<void>;
    abstract sync(): Promise<SyncResult>;

    getMetadata(): IntegrationMetadata {
        return {
            id: this.id,
            name: this.name,
            icon: this.icon,
            category: this.category,
            authType: this.authType,
            description: '',
            features: [],
            premium: false
        };
    }

    protected async performOAuthFlow(config: IntegrationConfig): Promise<OAuthTokens> {
        // Build auth URL with parameters
        const authParams = new URLSearchParams({
            client_id: config.clientId,
            redirect_uri: config.redirectUri,
            scope: config.scope,
            response_type: 'code',
            state: this.generateState()
        });

        const authUrl = `${config.authUrl}?${authParams.toString()}`;

        // In Electron, this would open auth window
        console.log(`Opening OAuth flow for ${this.name}: ${authUrl}`);

        // Would normally wait for redirect callback
        const authCode = await this.waitForAuthCallback();

        // Exchange code for tokens
        const tokens = await this.exchangeCodeForTokens(authCode, config);

        return tokens;
    }

    protected async exchangeCodeForTokens(code: string, config: IntegrationConfig): Promise<OAuthTokens> {
        const response = await fetch(config.tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                client_id: config.clientId,
                client_secret: config.clientSecret || '',
                redirect_uri: config.redirectUri
            })
        });

        const data = await response.json();

        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
            tokenType: data.token_type || 'Bearer'
        };
    }

    protected async refreshAccessToken(config: IntegrationConfig): Promise<OAuthTokens> {
        if (!this.refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await fetch(config.tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: this.refreshToken,
                client_id: config.clientId,
                client_secret: config.clientSecret || ''
            })
        });

        const data = await response.json();

        this.accessToken = data.access_token;
        if (data.refresh_token) {
            this.refreshToken = data.refresh_token;
        }
        this.tokenExpiresAt = data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined;

        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token || this.refreshToken,
            expiresAt: this.tokenExpiresAt,
            tokenType: data.token_type || 'Bearer'
        };
    }

    protected async saveTokens(tokens: OAuthTokens): Promise<void> {
        this.accessToken = tokens.accessToken;
        this.refreshToken = tokens.refreshToken;
        this.tokenExpiresAt = tokens.expiresAt;
        this.isConnected = true;

        // Would save to secure storage
        const storageKey = `integration_${this.id}_tokens`;
        localStorage.setItem(storageKey, JSON.stringify(tokens));
    }

    protected async loadTokens(): Promise<OAuthTokens | null> {
        const storageKey = `integration_${this.id}_tokens`;
        const stored = localStorage.getItem(storageKey);

        if (!stored) return null;

        const tokens = JSON.parse(stored) as OAuthTokens;
        this.accessToken = tokens.accessToken;
        this.refreshToken = tokens.refreshToken;
        this.tokenExpiresAt = tokens.expiresAt ? new Date(tokens.expiresAt) : undefined;
        this.isConnected = true;

        return tokens;
    }

    protected async clearTokens(): Promise<void> {
        this.accessToken = undefined;
        this.refreshToken = undefined;
        this.tokenExpiresAt = undefined;
        this.isConnected = false;

        const storageKey = `integration_${this.id}_tokens`;
        localStorage.removeItem(storageKey);
    }

    protected async isTokenExpired(): Promise<boolean> {
        if (!this.tokenExpiresAt) return false;
        return new Date() >= this.tokenExpiresAt;
    }

    protected async ensureValidToken(config: IntegrationConfig): Promise<void> {
        if (await this.isTokenExpired()) {
            await this.refreshAccessToken(config);
        }
    }

    protected generateState(): string {
        return Math.random().toString(36).substring(2, 15);
    }

    protected async waitForAuthCallback(): Promise<string> {
        // Would be implemented via Electron deep linking
        return 'mock_auth_code';
    }

    protected startPolling(intervalMs: number): void {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }
        this.pollingInterval = setInterval(() => {
            this.sync().catch(console.error);
        }, intervalMs);
    }

    protected stopPolling(): void {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = undefined;
        }
    }

    getConnectionStatus(): { connected: boolean; lastSync?: Date } {
        return {
            connected: this.isConnected,
            lastSync: this.lastSyncAt
        };
    }
}

export default BaseIntegration;
