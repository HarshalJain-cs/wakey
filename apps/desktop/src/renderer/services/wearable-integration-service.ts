// apps/desktop/src/renderer/services/wearable-integration-service.ts

import { eventBus } from '../lib/event-bus';

interface WearableData {
    heartRate: HeartRateData;
    sleep: SleepData;
    activity: ActivityData;
    stress: StressData;
    readiness: ReadinessScore;
}

interface HeartRateData {
    current: number;
    resting: number;
    variability: number;  // HRV
    zones: { zone: string; minutes: number }[];
}

interface SleepData {
    duration: number;
    quality: number;
    stages: { stage: 'awake' | 'light' | 'deep' | 'rem'; minutes: number }[];
    score: number;
    recommendations: string[];
}

interface ActivityData {
    steps: number;
    calories: number;
    activeMinutes: number;
    distance: number;
}

interface StressData {
    level: number;  // 0-100
    trend: 'decreasing' | 'stable' | 'increasing';
    triggers: string[];
}

interface ReadinessScore {
    score: number;
    factors: {
        sleep: number;
        recovery: number;
        activity: number;
        hrv: number;
    };
    recommendations: string[];
}

type WearableProvider = 'apple_health' | 'fitbit' | 'garmin' | 'oura' | 'whoop' | 'google_fit' | 'samsung_health';

interface WearableConnection {
    provider: WearableProvider;
    connected: boolean;
    lastSync: Date | null;
    accessToken?: string;
    refreshToken?: string;
}

const PROVIDER_CONFIG: Record<WearableProvider, { name: string; authUrl: string; features: string[] }> = {
    apple_health: {
        name: 'Apple Health',
        authUrl: 'healthkit://authorize',
        features: ['heart_rate', 'sleep', 'activity', 'hrv', 'stand_reminders']
    },
    fitbit: {
        name: 'Fitbit',
        authUrl: 'https://www.fitbit.com/oauth2/authorize',
        features: ['heart_rate', 'sleep', 'activity', 'stress', 'hrv']
    },
    garmin: {
        name: 'Garmin',
        authUrl: 'https://connect.garmin.com/oauthConfirm',
        features: ['heart_rate', 'sleep', 'activity', 'stress', 'body_battery']
    },
    oura: {
        name: 'Oura Ring',
        authUrl: 'https://cloud.ouraring.com/oauth/authorize',
        features: ['sleep', 'readiness', 'activity', 'hrv']
    },
    whoop: {
        name: 'WHOOP',
        authUrl: 'https://api.whoop.com/oauth/oauth2/auth',
        features: ['strain', 'recovery', 'sleep', 'hrv']
    },
    google_fit: {
        name: 'Google Fit',
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        features: ['heart_rate', 'sleep', 'activity']
    },
    samsung_health: {
        name: 'Samsung Health',
        authUrl: 'https://account.samsung.com/accounts/v1/STGAUTHSVC',
        features: ['heart_rate', 'sleep', 'activity', 'stress']
    }
};

export class WearableIntegrationService {
    private connections: Map<WearableProvider, WearableConnection> = new Map();
    private cachedData: Map<WearableProvider, WearableData> = new Map();
    private syncInterval: NodeJS.Timeout | null = null;

    constructor() {
        this.loadConnections();
    }

    private loadConnections(): void {
        // Load saved connections from storage
        const saved = localStorage.getItem('wakey_wearable_connections');
        if (saved) {
            const parsed = JSON.parse(saved) as Record<WearableProvider, WearableConnection>;
            for (const [provider, connection] of Object.entries(parsed)) {
                this.connections.set(provider as WearableProvider, {
                    ...connection,
                    lastSync: connection.lastSync ? new Date(connection.lastSync) : null
                });
            }
        }
    }

    private saveConnections(): void {
        const data: Record<string, WearableConnection> = {};
        for (const [provider, connection] of this.connections) {
            data[provider] = connection;
        }
        localStorage.setItem('wakey_wearable_connections', JSON.stringify(data));
    }

    getAvailableProviders(): { provider: WearableProvider; name: string; features: string[]; connected: boolean }[] {
        return Object.entries(PROVIDER_CONFIG).map(([id, config]) => ({
            provider: id as WearableProvider,
            name: config.name,
            features: config.features,
            connected: this.connections.get(id as WearableProvider)?.connected || false
        }));
    }

    async connect(provider: WearableProvider): Promise<boolean> {
        const config = PROVIDER_CONFIG[provider];
        if (!config) return false;

        try {
            // In Electron, this would open OAuth flow
            // For now, simulate connection
            console.log(`Opening OAuth for ${config.name}: ${config.authUrl}`);

            // Would normally: window.open(config.authUrl + queryParams)
            // Then handle OAuth callback

            this.connections.set(provider, {
                provider,
                connected: true,
                lastSync: null,
                accessToken: 'mock_access_token',
                refreshToken: 'mock_refresh_token'
            });

            this.saveConnections();

            eventBus.emit('integration:connected', {
                integrationId: provider
            });

            // Start sync
            await this.syncData(provider);

            return true;
        } catch (error) {
            console.error(`Failed to connect ${provider}:`, error);
            return false;
        }
    }

    async disconnect(provider: WearableProvider): Promise<void> {
        const connection = this.connections.get(provider);
        if (!connection) return;

        // Revoke tokens
        await this.revokeTokens(provider, connection);

        this.connections.delete(provider);
        this.cachedData.delete(provider);
        this.saveConnections();

        eventBus.emit('integration:disconnected', {
            integrationId: provider
        });
    }

    private async revokeTokens(provider: WearableProvider, _connection: WearableConnection): Promise<void> {
        // Would call provider's revoke endpoint
        console.log(`Revoking tokens for ${provider}`);
    }

    async syncData(provider: WearableProvider): Promise<WearableData | null> {
        const connection = this.connections.get(provider);
        if (!connection?.connected) return null;

        try {
            const data = await this.fetchData(provider, connection);
            this.cachedData.set(provider, data);

            connection.lastSync = new Date();
            this.saveConnections();

            eventBus.emit('sync:completed', {
                entityType: 'wearable',
                entityId: provider
            });

            return data;
        } catch (error) {
            console.error(`Failed to sync ${provider}:`, error);

            eventBus.emit('sync:failed', {
                entityType: 'wearable',
                entityId: provider,
                error: (error as Error).message
            });

            return null;
        }
    }

    private async fetchData(provider: WearableProvider, _connection: WearableConnection): Promise<WearableData> {
        const providerName = PROVIDER_CONFIG[provider]?.name || provider;
        // Would call provider's API
        // Return mock data for now
        return {
            heartRate: {
                current: 72,
                resting: 58,
                variability: 45,
                zones: [
                    { zone: 'rest', minutes: 480 },
                    { zone: 'fat_burn', minutes: 60 },
                    { zone: 'cardio', minutes: 30 },
                    { zone: 'peak', minutes: 10 }
                ]
            },
            sleep: {
                duration: 7.5,
                quality: 85,
                stages: [
                    { stage: 'awake', minutes: 15 },
                    { stage: 'light', minutes: 180 },
                    { stage: 'deep', minutes: 90 },
                    { stage: 'rem', minutes: 165 }
                ],
                score: 82,
                recommendations: ['Try going to bed 30 minutes earlier']
            },
            activity: {
                steps: 8500,
                calories: 2100,
                activeMinutes: 45,
                distance: 6.2
            },
            stress: {
                level: 35,
                trend: 'stable',
                triggers: []
            },
            readiness: {
                score: 78,
                factors: {
                    sleep: 82,
                    recovery: 75,
                    activity: 80,
                    hrv: 72
                },
                recommendations: [
                    'Good day for moderate intensity workout',
                    `Consider a light recovery activity (${providerName})`
                ]
            }
        };
    }

    async syncAllConnected(): Promise<void> {
        const providers = Array.from(this.connections.keys());
        await Promise.all(providers.map(p => this.syncData(p)));
    }

    getLatestData(): WearableData | null {
        // Get aggregated data from all connected sources
        if (this.cachedData.size === 0) return null;

        // For now, return first cached data
        // Would normally aggregate/average from multiple sources
        return Array.from(this.cachedData.values())[0];
    }

    getDataFromProvider(provider: WearableProvider): WearableData | null {
        return this.cachedData.get(provider) || null;
    }

    startAutoSync(intervalMinutes: number = 15): void {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }

        this.syncInterval = setInterval(() => {
            this.syncAllConnected();
        }, intervalMinutes * 60 * 1000);
    }

    stopAutoSync(): void {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    // Helper methods for productivity features

    async getOptimalFocusTime(): Promise<{ hour: number; readinessScore: number }[]> {
        const data = this.getLatestData();
        if (!data) return [];

        // Analyze readiness and suggest optimal focus times
        const baseReadiness = data.readiness.score;

        // Adjust based on typical circadian patterns
        return [
            { hour: 9, readinessScore: baseReadiness * 0.9 },
            { hour: 10, readinessScore: baseReadiness * 1.0 },
            { hour: 11, readinessScore: baseReadiness * 0.95 },
            { hour: 14, readinessScore: baseReadiness * 0.7 },  // Post-lunch dip
            { hour: 15, readinessScore: baseReadiness * 0.8 },
            { hour: 16, readinessScore: baseReadiness * 0.85 },
        ];
    }

    shouldSuggestBreak(): { suggest: boolean; reason?: string } {
        const data = this.getLatestData();
        if (!data) return { suggest: false };

        if (data.heartRate.current > data.heartRate.resting * 1.3) {
            return { suggest: true, reason: 'Elevated heart rate detected' };
        }

        if (data.stress.level > 70) {
            return { suggest: true, reason: 'High stress level detected' };
        }

        if (data.stress.trend === 'increasing') {
            return { suggest: true, reason: 'Stress is increasing - consider a break' };
        }

        return { suggest: false };
    }

    getRecoveryStatus(): { status: 'poor' | 'moderate' | 'good' | 'optimal'; recommendations: string[] } {
        const data = this.getLatestData();
        if (!data) return { status: 'moderate', recommendations: [] };

        const readiness = data.readiness.score;

        if (readiness >= 85) {
            return { status: 'optimal', recommendations: ['Great day for challenging work!'] };
        } else if (readiness >= 70) {
            return { status: 'good', recommendations: data.readiness.recommendations };
        } else if (readiness >= 50) {
            return { status: 'moderate', recommendations: ['Consider lighter workload today'] };
        } else {
            return { status: 'poor', recommendations: ['Prioritize rest and recovery today'] };
        }
    }
}

export const wearableIntegrationService = new WearableIntegrationService();
export type { WearableData, HeartRateData, SleepData, ActivityData, StressData, ReadinessScore, WearableProvider };
